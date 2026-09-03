from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StaffViewSet, LeaveRequestViewSet

router = DefaultRouter()
router.register(r'leaves', LeaveRequestViewSet, basename='leave-request')
router.register(r'', StaffViewSet, basename='staff')

urlpatterns = [
    path('', include(router.urls)),
]
