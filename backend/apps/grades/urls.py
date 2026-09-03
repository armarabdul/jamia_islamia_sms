from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GradeScaleViewSet, GradeRecordViewSet, ReportCardDetailView

router = DefaultRouter()
router.register(r'scales', GradeScaleViewSet, basename='grade-scale')
router.register(r'records', GradeRecordViewSet, basename='grade-record')

urlpatterns = [
    path('report-card/<uuid:student_id>/<uuid:exam_id>/', ReportCardDetailView.as_view(), name='student_report_card'),
    path('', include(router.urls)),
]
