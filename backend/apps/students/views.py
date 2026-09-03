from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Student, Enrollment
from .serializers import StudentSerializer, EnrollmentSerializer
from core.permissions import IsAdminUserRole

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'enrollment_history']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        user = self.request.user
        qs = Student.objects.all().prefetch_related('enrollments__class_room', 'enrollments__section')
        
        # Role-based data scoping
        if getattr(user, 'role', '') == 'STUDENT':
            qs = qs.filter(user=user)
        elif getattr(user, 'role', '') == 'PARENT':
            from apps.parents.models import ParentStudentRelation
            child_ids = ParentStudentRelation.objects.filter(parent__user=user).values_list('student_id', flat=True)
            qs = qs.filter(id__in=child_ids)
        elif getattr(user, 'role', '') == 'TEACHER':
            section_id = self.request.query_params.get('section_id')
            if section_id:
                qs = qs.filter(enrollments__section_id=section_id, enrollments__is_active=True)

        class_id = self.request.query_params.get('class_id')
        section_id = self.request.query_params.get('section_id')
        search = self.request.query_params.get('search')
        
        if class_id:
            qs = qs.filter(enrollments__class_room_id=class_id, enrollments__is_active=True)
        if section_id:
            qs = qs.filter(enrollments__section_id=section_id, enrollments__is_active=True)
        if search:
            qs = qs.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(admission_number__icontains=search)
            )

        return qs.distinct()

    @action(detail=True, methods=['get'])
    def enrollment_history(self, request, pk=None):
        student = self.get_object()
        enrollments = student.enrollments.all().order_by('-enrollment_date')
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all().select_related('student', 'class_room', 'section', 'academic_year')
    serializer_class = EnrollmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]
