from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AcademicYearViewSet,
    ClassRoomViewSet,
    SectionViewSet,
    SubjectViewSet,
    SubjectTeacherAssignmentViewSet
)

router = DefaultRouter()
router.register(r'years', AcademicYearViewSet, basename='academic-year')
router.register(r'classes', ClassRoomViewSet, basename='classroom')
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'teacher-assignments', SubjectTeacherAssignmentViewSet, basename='subject-assignment')

urlpatterns = [
    path('', include(router.urls)),
]
