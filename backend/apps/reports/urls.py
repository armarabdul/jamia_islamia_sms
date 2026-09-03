from django.urls import path
from .views import AdminDashboardOverviewView, AttendanceAnalyticsView

urlpatterns = [
    path('dashboard-overview/', AdminDashboardOverviewView.as_view(), name='reports_dashboard_overview'),
    path('attendance-analytics/', AttendanceAnalyticsView.as_view(), name='reports_attendance_analytics'),
]
