from django.db import transaction
from django.db.models import Count, Q
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AttendanceRecord
from .serializers import (
    AttendanceRecordSerializer,
    BulkAttendanceCreateSerializer
)
from apps.students.models import Student
from apps.parents.models import ParentStudentRelation
from core.permissions import IsAdminUserRole, IsTeacherUserRole

class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all().select_related('student', 'class_room', 'section', 'academic_year', 'marked_by')
    serializer_class = AttendanceRecordSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'summary']:
            return [permissions.IsAuthenticated()]
        return [IsTeacherUserRole()]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if getattr(user, 'role', '') == 'STUDENT':
            qs = qs.filter(student__user=user)
        elif getattr(user, 'role', '') == 'PARENT':
            child_ids = ParentStudentRelation.objects.filter(parent__user=user).values_list('student_id', flat=True)
            qs = qs.filter(student_id__in=child_ids)

        section_id = self.request.query_params.get('section_id')
        date = self.request.query_params.get('date')
        student_id = self.request.query_params.get('student_id')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')

        if section_id:
            qs = qs.filter(section_id=section_id)
        if date:
            qs = qs.filter(date=date)
        if student_id:
            qs = qs.filter(student_id=student_id)
        if month and year:
            qs = qs.filter(date__year=year, date__month=month)

        return qs

    @action(detail=False, methods=['post'], url_path='bulk-mark')
    def bulk_mark(self, request):
        """
        High-performance endpoint for teachers to submit daily or period attendance
        for an entire section in a single atomic transaction.
        Also dispatches alerts to parents for absent students.
        """
        serializer = BulkAttendanceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        year_id = data['academic_year_id']
        class_id = data['class_room_id']
        section_id = data['section_id']
        att_date = data['date']
        period_num = data['period_number']
        records = data['records']

        created_or_updated = []
        absent_student_ids = []

        with transaction.atomic():
            for item in records:
                s_id = item['student_id']
                st = item['status']
                notes = item.get('notes', '')

                record, _ = AttendanceRecord.objects.update_or_create(
                    student_id=s_id,
                    date=att_date,
                    period_number=period_num,
                    defaults={
                        'academic_year_id': year_id,
                        'class_room_id': class_id,
                        'section_id': section_id,
                        'status': st,
                        'marked_by': request.user,
                        'notes': notes
                    }
                )
                created_or_updated.append(record)
                if st == AttendanceRecord.Status.ABSENT:
                    absent_student_ids.append(s_id)

        # Trigger notifications for absent students
        if absent_student_ids:
            try:
                from apps.notifications.services import dispatch_absence_notifications
                dispatch_absence_notifications(absent_student_ids, att_date)
            except Exception:
                pass

        return Response({
            'success': True,
            'message': f'Attendance successfully recorded for {len(created_or_updated)} students.',
            'count': len(created_or_updated),
            'absent_count': len(absent_student_ids)
        }, status=status.HTTP_200_OK)


class StudentAttendanceSummaryView(generics.GenericAPIView):
    """
    Computes attendance percentage and stats for a student in a single optimized SQL query.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, student_id):
        user = request.user
        # Authorization check
        if getattr(user, 'role', '') == 'STUDENT' and str(getattr(user.student_profile, 'id', '')) != str(student_id):
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        aggregates = AttendanceRecord.objects.filter(
            student_id=student_id, 
            period_number=0
        ).aggregate(
            total_days=Count('id'),
            present_days=Count('id', filter=Q(status=AttendanceRecord.Status.PRESENT)),
            absent_days=Count('id', filter=Q(status=AttendanceRecord.Status.ABSENT)),
            late_days=Count('id', filter=Q(status=AttendanceRecord.Status.LATE)),
            excused_days=Count('id', filter=Q(status=AttendanceRecord.Status.EXCUSED)),
        )

        total_days = aggregates['total_days'] or 0
        present_days = aggregates['present_days'] or 0
        absent_days = aggregates['absent_days'] or 0
        late_days = aggregates['late_days'] or 0
        excused_days = aggregates['excused_days'] or 0

        percentage = round((present_days / total_days * 100), 1) if total_days > 0 else 100.0

        return Response({
            'student_id': student_id,
            'total_days': total_days,
            'present_days': present_days,
            'absent_days': absent_days,
            'late_days': late_days,
            'excused_days': excused_days,
            'attendance_percentage': percentage
        })
