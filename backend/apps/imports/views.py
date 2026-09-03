import csv
import io
from datetime import datetime
from django.db import transaction
from django.http import HttpResponse
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from apps.students.models import Student, Enrollment
from apps.academic.models import AcademicYear, ClassRoom, Section
from apps.accounts.models import User
from core.permissions import IsAdminUserRole
from core.audit import log_audit_action

class PreviewStudentCSVView(generics.GenericAPIView):
    """
    Dry-run CSV import parser. Validates headers, parses rows, detects duplicates,
    and returns a structured preview with row-level error indicators WITHOUT altering the database.
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        file = request.FILES.get('file')
        if not file or not file.name.endswith('.csv'):
            return Response({'detail': 'A valid .csv file is required.'}, status=status.HTTP_400_BAD_REQUEST)

        decoded_file = file.read().decode('utf-8-sig')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)

        required_fields = {'admission_number', 'first_name', 'last_name', 'gender', 'class_name', 'section_name'}
        if not required_fields.issubset(set(reader.fieldnames or [])):
            missing = required_fields - set(reader.fieldnames or [])
            return Response(
                {'detail': f'Missing required CSV column headers: {", ".join(missing)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        preview_rows = []
        has_errors = False
        existing_admission_nums = set(Student.objects.values_list('admission_number', flat=True))
        seen_in_file = set()

        for idx, row in enumerate(reader, start=2):
            errors = []
            adm_no = row.get('admission_number', '').strip()
            first_name = row.get('first_name', '').strip()
            last_name = row.get('last_name', '').strip()
            gender = row.get('gender', 'MALE').strip().upper()
            class_name = row.get('class_name', '').strip()
            section_name = row.get('section_name', '').strip()
            dob_str = row.get('date_of_birth', '').strip()

            if not adm_no:
                errors.append('Admission number is missing.')
            elif adm_no in existing_admission_nums:
                errors.append(f'Admission number {adm_no} already exists in database.')
            elif adm_no in seen_in_file:
                errors.append(f'Duplicate admission number {adm_no} within this CSV file.')
            seen_in_file.add(adm_no)

            if not first_name:
                errors.append('First name is required.')
            if gender not in ['MALE', 'FEMALE']:
                errors.append('Gender must be MALE or FEMALE.')

            if dob_str:
                try:
                    datetime.strptime(dob_str, '%Y-%m-%d')
                except ValueError:
                    errors.append('Date of birth must be YYYY-MM-DD.')

            if errors:
                has_errors = True

            preview_rows.append({
                'row_number': idx,
                'data': row,
                'valid': len(errors) == 0,
                'errors': errors
            })

        return Response({
            'total_rows': len(preview_rows),
            'has_errors': has_errors,
            'preview': preview_rows[:50],  # Return first 50 rows for preview
            'valid_count': sum(1 for r in preview_rows if r['valid']),
            'invalid_count': sum(1 for r in preview_rows if not r['valid']),
        })


class CommitStudentCSVView(generics.GenericAPIView):
    """
    Commits validated CSV data into the database in a single atomic transaction.
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        rows = request.data.get('rows', [])
        academic_year_id = request.data.get('academic_year_id')

        if not rows:
            return Response({'detail': 'No row data provided to commit.'}, status=status.HTTP_400_BAD_REQUEST)

        current_year = AcademicYear.objects.filter(id=academic_year_id).first() if academic_year_id else AcademicYear.objects.filter(is_current=True).first()
        if not current_year:
            return Response({'detail': 'A valid active academic year is required.'}, status=status.HTTP_400_BAD_REQUEST)

        imported_students = []

        try:
            with transaction.atomic():
                for item in rows:
                    data = item.get('data', item)
                    adm_no = data.get('admission_number', '').strip()
                    f_name = data.get('first_name', '').strip()
                    l_name = data.get('last_name', '').strip()
                    gender = data.get('gender', 'MALE').strip().upper()
                    dob_str = data.get('date_of_birth', '').strip()
                    cls_name = data.get('class_name', '').strip()
                    sec_name = data.get('section_name', '').strip()

                    dob = None
                    if dob_str:
                        try:
                            dob = datetime.strptime(dob_str, '%Y-%m-%d').date()
                        except ValueError:
                            pass

                    # Create student
                    student = Student.objects.create(
                        admission_number=adm_no,
                        first_name=f_name,
                        last_name=l_name,
                        first_name_urdu=data.get('first_name_urdu', ''),
                        last_name_urdu=data.get('last_name_urdu', ''),
                        gender=gender,
                        date_of_birth=dob,
                        emergency_contact_phone=data.get('emergency_phone', ''),
                        address=data.get('address', ''),
                        status=Student.Status.ACTIVE
                    )

                    # Enroll in class & section if specified
                    if cls_name:
                        classroom, _ = ClassRoom.objects.get_or_create(name=cls_name)
                        section, _ = Section.objects.get_or_create(class_room=classroom, name=sec_name or 'A')
                        Enrollment.objects.create(
                            student=student,
                            academic_year=current_year,
                            class_room=classroom,
                            section=section,
                            roll_number=data.get('roll_number', ''),
                            is_active=True
                        )

                    imported_students.append(student)

                log_audit_action(
                    user=request.user,
                    action='IMPORT_STUDENTS_CSV',
                    resource_type='Student',
                    changes={'count': len(imported_students)},
                    ip_address=getattr(request, 'client_ip', None)
                )

        except Exception as e:
            return Response({'detail': f'Import transaction failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'message': f'Successfully imported {len(imported_students)} students.',
            'imported_count': len(imported_students)
        })


class ExportStudentCSVView(generics.GenericAPIView):
    """
    Exports student roster as clean downloadable CSV.
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        students = Student.objects.all().prefetch_related('enrollments__class_room', 'enrollments__section')

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="jamia_islamia_students.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Admission Number', 'First Name', 'Last Name', 'First Name (Urdu)',
            'Last Name (Urdu)', 'Gender', 'Class', 'Section', 'Roll Number',
            'Date of Birth', 'Emergency Phone', 'Status'
        ])

        for st in students:
            enrollment = st.enrollments.filter(is_active=True).first()
            writer.writerow([
                st.admission_number,
                st.first_name,
                st.last_name,
                st.first_name_urdu,
                st.last_name_urdu,
                st.gender,
                enrollment.class_room.name if enrollment else '',
                enrollment.section.name if enrollment else '',
                enrollment.roll_number if enrollment else '',
                st.date_of_birth.strftime('%Y-%m-%d') if st.date_of_birth else '',
                st.emergency_contact_phone,
                st.status
            ])

        return response
