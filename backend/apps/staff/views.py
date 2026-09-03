from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Staff, LeaveRequest
from .serializers import StaffSerializer, LeaveRequestSerializer
from core.permissions import IsAdminUserRole, IsStaffUserRole

class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all().select_related('user')
    serializer_class = StaffSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        qs = super().get_queryset()
        is_teaching = self.request.query_params.get('is_teaching')
        department = self.request.query_params.get('department')
        if is_teaching is not None:
            qs = qs.filter(is_teaching=is_teaching.lower() in ['true', '1'])
        if department:
            qs = qs.filter(department=department)
        return qs


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all().select_related('staff__user', 'approved_by')
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'ADMIN' or user.is_superuser:
            return LeaveRequest.objects.all().select_related('staff__user', 'approved_by')
        return LeaveRequest.objects.filter(staff__user=user)

    def perform_create(self, serializer):
        staff = Staff.objects.filter(user=self.request.user).first()
        if staff:
            serializer.save(staff=staff)
        else:
            serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = LeaveRequest.Status.APPROVED
        leave.approved_by = request.user
        leave.admin_notes = request.data.get('admin_notes', '')
        leave.save()
        return Response({'success': True, 'status': leave.status})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = LeaveRequest.Status.REJECTED
        leave.approved_by = request.user
        leave.admin_notes = request.data.get('admin_notes', '')
        leave.save()
        return Response({'success': True, 'status': leave.status})
