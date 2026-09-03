from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from .models import Parent, ParentStudentRelation
from .serializers import ParentSerializer, ParentStudentRelationSerializer
from apps.students.serializers import StudentSerializer
from core.permissions import IsAdminUserRole

class ParentViewSet(viewsets.ModelViewSet):
    queryset = Parent.objects.all().prefetch_related('children_relations__student')
    serializer_class = ParentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]


class MyChildrenView(generics.ListAPIView):
    """
    Self-service endpoint for logged-in parents to list their linked children.
    Supports switching between multiple children on Web and Android dashboards.
    """
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') != 'PARENT' and not user.is_superuser:
            return []
        parent = Parent.objects.filter(user=user).first()
        if not parent:
            return []
        student_ids = parent.children_relations.values_list('student_id', flat=True)
        from apps.students.models import Student
        return Student.objects.filter(id__in=student_ids).prefetch_related('enrollments__class_room', 'enrollments__section')


class LinkChildView(generics.CreateAPIView):
    """
    Admin endpoint to associate a student with a parent account.
    """
    serializer_class = ParentStudentRelationSerializer
    permission_classes = [IsAdminUserRole]
