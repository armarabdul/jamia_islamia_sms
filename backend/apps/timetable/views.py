from rest_framework import viewsets, generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import TimetableEntry
from .serializers import TimetableEntrySerializer
from apps.parents.models import ParentStudentRelation
from apps.students.models import Student
from core.permissions import IsAdminUserRole

class TimetableEntryViewSet(viewsets.ModelViewSet):
    queryset = TimetableEntry.objects.all().select_related(
        'academic_year', 'class_room', 'section', 'subject', 'teacher'
    )
    serializer_class = TimetableEntrySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        qs = super().get_queryset()
        section_id = self.request.query_params.get('section_id')
        teacher_id = self.request.query_params.get('teacher_id')
        day = self.request.query_params.get('day_of_week')

        if section_id:
            qs = qs.filter(section_id=section_id)
        if teacher_id:
            qs = qs.filter(teacher_id=teacher_id)
        if day is not None:
            qs = qs.filter(day_of_week=day)

        return qs


class MyScheduleView(generics.ListAPIView):
    """
    Role-tailored schedule view:
    - Teacher: Returns periods taught by this teacher across all sections
    - Student: Returns periods for student's active section
    - Parent: Returns periods for child's active section
    """
    serializer_class = TimetableEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = TimetableEntry.objects.all().select_related(
            'academic_year', 'class_room', 'section', 'subject', 'teacher'
        )

        if getattr(user, 'role', '') == 'TEACHER':
            return qs.filter(teacher=user)

        if getattr(user, 'role', '') == 'STUDENT':
            student = Student.objects.filter(user=user).first()
            if student:
                enrollment = student.enrollments.filter(is_active=True).first()
                if enrollment:
                    return qs.filter(section=enrollment.section)
            return TimetableEntry.objects.none()

        if getattr(user, 'role', '') == 'PARENT':
            child_id = self.request.query_params.get('student_id')
            if child_id:
                is_linked = ParentStudentRelation.objects.filter(
                    parent__user=user,
                    student_id=child_id
                ).exists()
                if not is_linked and not user.is_superuser:
                    raise PermissionDenied('Access denied.')
                student = Student.objects.filter(id=child_id).first()
                if student:
                    enrollment = student.enrollments.filter(is_active=True).first()
                    if enrollment:
                        return qs.filter(section=enrollment.section)
            return TimetableEntry.objects.none()

        return qs
