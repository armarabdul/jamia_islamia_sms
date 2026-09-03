from django.db import transaction
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import GradeScale, GradeRecord
from .serializers import (
    GradeScaleSerializer,
    GradeRecordSerializer,
    BatchMarksEntrySerializer
)
from apps.parents.models import ParentStudentRelation
from apps.examinations.models import Exam, ExamSubject
from apps.students.models import Student
from core.permissions import IsAdminUserRole, IsTeacherUserRole

class GradeScaleViewSet(viewsets.ModelViewSet):
    queryset = GradeScale.objects.all()
    serializer_class = GradeScaleSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]


class GradeRecordViewSet(viewsets.ModelViewSet):
    queryset = GradeRecord.objects.all().select_related('exam_subject__exam', 'exam_subject__subject', 'student')
    serializer_class = GradeRecordSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsTeacherUserRole()]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if getattr(user, 'role', '') == 'STUDENT':
            # Students only see published exams of their own
            qs = qs.filter(student__user=user, exam_subject__exam__is_published=True)
        elif getattr(user, 'role', '') == 'PARENT':
            # Parents only see published exams of linked children
            child_ids = ParentStudentRelation.objects.filter(parent__user=user).values_list('student_id', flat=True)
            qs = qs.filter(student_id__in=child_ids, exam_subject__exam__is_published=True)

        exam_id = self.request.query_params.get('exam_id')
        student_id = self.request.query_params.get('student_id')
        exam_subject_id = self.request.query_params.get('exam_subject_id')

        if exam_id:
            qs = qs.filter(exam_subject__exam_id=exam_id)
        if student_id:
            qs = qs.filter(student_id=student_id)
        if exam_subject_id:
            qs = qs.filter(exam_subject_id=exam_subject_id)

        return qs

    @action(detail=False, methods=['post'], url_path='batch-entry')
    def batch_entry(self, request):
        """
        Fast batch marks entry for teachers entering grades for an exam subject.
        """
        serializer = BatchMarksEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        exam_subject_id = data['exam_subject_id']
        marks_data = data['marks']

        saved_records = []
        with transaction.atomic():
            for item in marks_data:
                record, _ = GradeRecord.objects.update_or_create(
                    exam_subject_id=exam_subject_id,
                    student_id=item['student_id'],
                    defaults={
                        'marks_obtained': item['marks_obtained'],
                        'is_absent': item.get('is_absent', False),
                        'remarks': item.get('remarks', ''),
                        'entered_by': request.user
                    }
                )
                saved_records.append(record)

        return Response({
            'success': True,
            'message': f'Marks successfully saved for {len(saved_records)} students.',
            'count': len(saved_records)
        }, status=status.HTTP_200_OK)


class ReportCardDetailView(generics.GenericAPIView):
    """
    Computes and formats a comprehensive, bilingual Report Card for a student in a specific exam.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, student_id, exam_id):
        user = request.user
        # Verify access
        if getattr(user, 'role', '') == 'STUDENT' and str(getattr(user.student_profile, 'id', '')) != str(student_id):
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        exam = Exam.objects.filter(id=exam_id).first()
        student = Student.objects.filter(id=student_id).first()
        if not exam or not student:
            return Response({'detail': 'Exam or Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not exam.is_published and getattr(user, 'role', '') in ['STUDENT', 'PARENT']:
            return Response({'detail': 'Exam results have not been published yet.'}, status=status.HTTP_400_BAD_REQUEST)

        records = GradeRecord.objects.filter(
            student=student,
            exam_subject__exam=exam
        ).select_related('exam_subject__subject')

        subject_results = []
        total_obtained = 0
        total_maximum = 0
        all_passed = True

        for r in records:
            max_m = float(r.exam_subject.total_marks)
            obt_m = float(r.marks_obtained) if not r.is_absent else 0.0
            total_maximum += max_m
            total_obtained += obt_m
            passed = not r.is_absent and obt_m >= float(r.exam_subject.passing_marks)
            if not passed:
                all_passed = False

            subject_results.append({
                'subject_id': str(r.exam_subject.subject.id),
                'subject_name': r.exam_subject.subject.name,
                'subject_name_urdu': r.exam_subject.subject.name_urdu,
                'marks_obtained': obt_m,
                'total_marks': max_m,
                'passing_marks': float(r.exam_subject.passing_marks),
                'grade': r.grade_letter,
                'is_absent': r.is_absent,
                'remarks': r.remarks,
                'is_passed': passed
            })

        percentage = round((total_obtained / total_maximum * 100), 2) if total_maximum > 0 else 0.0
        overall_scale = GradeScale.objects.filter(
            min_percentage__lte=percentage,
            max_percentage__gte=percentage
        ).first()

        enrollment = student.enrollments.filter(is_active=True).first()

        report_card = {
            'student': {
                'id': str(student.id),
                'admission_number': student.admission_number,
                'name': student.full_name,
                'name_urdu': student.full_name_urdu,
                'class_name': enrollment.class_room.name if enrollment else '',
                'section_name': enrollment.section.name if enrollment else '',
                'roll_number': enrollment.roll_number if enrollment else '',
            },
            'exam': {
                'id': str(exam.id),
                'name': exam.name,
                'name_urdu': exam.name_urdu,
                'academic_year': exam.academic_year.name,
            },
            'results': subject_results,
            'summary': {
                'total_obtained': total_obtained,
                'total_maximum': total_maximum,
                'percentage': percentage,
                'overall_grade': overall_scale.grade_letter if overall_scale else ('Pass' if all_passed else 'Needs Improvement'),
                'overall_remarks': overall_scale.remarks if overall_scale else '',
                'overall_remarks_urdu': overall_scale.remarks_urdu if overall_scale else '',
                'is_overall_passed': all_passed,
            }
        }

        return Response(report_card)
