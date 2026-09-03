from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, DeviceToken, AuditLog
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    DeviceTokenSerializer,
    AuditLogSerializer
)
from core.permissions import IsAdminUserRole
from core.audit import log_audit_action
from core.throttling import LoginRateThrottle

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Login endpoint issuing JWT access & refresh tokens with user role info.
    Throttled to 5 attempts per minute.
    """
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            username = request.data.get('username')
            user = User.objects.filter(username=username).first()
            if user:
                log_audit_action(
                    user=user,
                    action='USER_LOGIN',
                    resource_type='User',
                    resource_id=str(user.id),
                    ip_address=getattr(request, 'client_ip', None)
                )
        return response


class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieves or updates the current logged-in user's profile and language preference.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    """
    Allows authenticated users to change their account password.
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': ['Current password does not match.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        log_audit_action(
            user=user,
            action='CHANGE_PASSWORD',
            resource_type='User',
            resource_id=str(user.id),
            ip_address=getattr(request, 'client_ip', None)
        )
        return Response({'success': True, 'message': 'Password updated successfully.'})


class DeviceTokenRegistrationView(generics.CreateAPIView):
    """
    Registers or updates mobile device tokens for push notifications.
    """
    serializer_class = DeviceTokenSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        token_str = serializer.validated_data.get('token')
        DeviceToken.objects.update_or_create(
            user=self.request.user,
            token=token_str,
            defaults={
                'platform': serializer.validated_data.get('platform', 'android'),
                'is_active': True
            }
        )


class AuditLogListView(generics.ListAPIView):
    """
    Audit log list view (Admins only).
    """
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUserRole]
    queryset = AuditLog.objects.all().select_related('user')
