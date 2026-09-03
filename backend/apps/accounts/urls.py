from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from .views import (
    CustomTokenObtainPairView,
    CurrentUserProfileView,
    ChangePasswordView,
    DeviceTokenRegistrationView,
    AuditLogListView
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('me/', CurrentUserProfileView.as_view(), name='current_user_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('device-token/', DeviceTokenRegistrationView.as_view(), name='device_token_register'),
    path('audit-logs/', AuditLogListView.as_view(), name='audit_logs_list'),
]
