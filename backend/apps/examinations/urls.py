from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamViewSet, ExamSubjectViewSet

router = DefaultRouter()
router.register(r'subjects', ExamSubjectViewSet, basename='exam-subject')
router.register(r'', ExamViewSet, basename='exam')

urlpatterns = [
    path('', include(router.urls)),
]
