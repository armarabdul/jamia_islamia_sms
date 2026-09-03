from rest_framework import viewsets, permissions
from .models import AcademicYear, ClassRoom, Section, Subject, SubjectTeacherAssignment
from .serializers import (
    AcademicYearSerializer,
    ClassRoomSerializer,
    SectionSerializer,
    SubjectSerializer,
    SubjectTeacherAssignmentSerializer
)
from core.permissions import IsAdminUserRole

class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]


class ClassRoomViewSet(viewsets.ModelViewSet):
    queryset = ClassRoom.objects.all().prefetch_related('sections')
    serializer_class = ClassRoomSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all().select_related('class_room', 'class_teacher')
    serializer_class = SectionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        qs = super().get_queryset()
        class_id = self.request.query_params.get('class_id')
        if class_id:
            qs = qs.filter(class_room_id=class_id)
        return qs


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]


class SubjectTeacherAssignmentViewSet(viewsets.ModelViewSet):
    queryset = SubjectTeacherAssignment.objects.all().select_related(
        'academic_year', 'class_room', 'section', 'subject', 'teacher'
    )
    serializer_class = SubjectTeacherAssignmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if getattr(user, 'role', '') == 'TEACHER':
            qs = qs.filter(teacher=user)
        return qs
