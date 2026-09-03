from datetime import date
from django.db.models import Count, Avg, Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from apps.students.models import Student
from apps.staff.models import Staff
from apps.parents.models import Parent
from apps.attendance.models import AttendanceRecord
from apps.examinations.models import Exam
from apps.assignments.models import Assignment
from apps.announcements.models import Announcement
from apps.academic.models import ClassRoom, Section
from core.permissions import IsAdminUserRole

class AdminDashboardOverviewView(generics.GenericAPIView):
    """
    Supplies real-time operational statistics for the Jamia Islamia Admin Dashboard.
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        today = date.today()

        total_students = Student.objects.filter(status=Student.Status.ACTIVE).count()
        total_teachers = Staff.objects.filter(is_teaching=True).count()
        total_parents = Parent.objects.count()

        # Today's attendance stats
        today_att = AttendanceRecord.objects.filter(date=today, period_number=0)
        today_marked_count = today_att.count()
        today_present_count = today_att.filter(status=AttendanceRecord.Status.PRESENT).count()
        today_absent_count = today_att.filter(status=AttendanceRecord.Status.ABSENT).count()
        today_percentage = round((today_present_count / today_marked_count * 100), 1) if today_marked_count > 0 else 0.0

        # Upcoming exams
        upcoming_exams = Exam.objects.filter(start_date__gte=today).order_by('start_date')[:5].values(
            'id', 'name', 'name_urdu', 'start_date', 'end_date', 'is_published'
        )

        # Pending assignments
        active_assignments = Assignment.objects.filter(due_date__gte=today).count()

        # Recent announcements
        recent_announcements = Announcement.objects.order_by('-created_at')[:5].values(
            'id', 'title', 'title_urdu', 'audience', 'published_at'
        )

        return Response({
            'kpis': {
                'total_students': total_students,
                'total_teachers': total_teachers,
                'total_parents': total_parents,
                'attendance_today_percentage': today_percentage,
                'attendance_marked_count': today_marked_count,
                'attendance_absent_count': today_absent_count,
                'active_assignments_count': active_assignments,
            },
            'upcoming_exams': list(upcoming_exams),
            'recent_announcements': list(recent_announcements),
        })


class AttendanceAnalyticsView(generics.GenericAPIView):
    """
    Class-wise and grade-level attendance analytics.
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        today = date.today()
        classes = ClassRoom.objects.all().prefetch_related('sections')
        analytics_data = []

        for cls in classes:
            sections_data = []
            for sec in cls.sections.all():
                records = AttendanceRecord.objects.filter(section=sec, period_number=0)
                tot = records.count()
                pres = records.filter(status=AttendanceRecord.Status.PRESENT).count()
                pct = round((pres / tot * 100), 1) if tot > 0 else 100.0
                sections_data.append({
                    'section_id': str(sec.id),
                    'section_name': sec.name,
                    'total_records': tot,
                    'present_records': pres,
                    'attendance_percentage': pct
                })
            analytics_data.append({
                'class_id': str(cls.id),
                'class_name': cls.name,
                'class_name_urdu': cls.name_urdu,
                'sections': sections_data
            })

        return Response({'classes_attendance': analytics_data})
