from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceRecordViewSet, StudentAttendanceSummaryView

router = DefaultRouter()
router.register(r'records', AttendanceRecordViewSet, basename='attendance-record')

urlpatterns = [
    path('student-summary/<uuid:student_id>/', StudentAttendanceSummaryView.as_view(), name='student_attendance_summary'),
    path('', include(router.urls)),
]
