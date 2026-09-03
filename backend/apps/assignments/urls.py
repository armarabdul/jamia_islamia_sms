from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet, GradeSubmissionView

router = DefaultRouter()
router.register(r'', AssignmentViewSet, basename='assignment')

urlpatterns = [
    path('submissions/<uuid:pk>/grade/', GradeSubmissionView.as_view(), name='grade_submission'),
    path('', include(router.urls)),
]
