from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, permissions
from .models import Announcement
from .serializers import AnnouncementSerializer
from apps.parents.models import ParentStudentRelation
from apps.students.models import Student, Enrollment
from core.permissions import IsAdminUserRole, IsStaffUserRole

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all().select_related('author', 'target_class', 'target_section')
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsStaffUserRole()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        user = self.request.user
        now = timezone.now()
        qs = Announcement.objects.filter(
            Q(expires_at__isnull=True) | Q(expires_at__gte=now)
        ).select_related('author', 'target_class', 'target_section')

        if getattr(user, 'role', '') == 'ADMIN' or user.is_superuser:
            return qs

        filters = Q(audience=Announcement.Audience.ALL)

        if getattr(user, 'role', '') == 'TEACHER':
            filters |= Q(audience=Announcement.Audience.TEACHERS)
            filters |= Q(author=user)

        elif getattr(user, 'role', '') == 'STUDENT':
            filters |= Q(audience=Announcement.Audience.STUDENTS)
            student = Student.objects.filter(user=user).first()
            if student:
                enrollment = student.enrollments.filter(is_active=True).first()
                if enrollment:
                    filters |= (Q(audience=Announcement.Audience.CLASS) & (Q(target_class=enrollment.class_room) | Q(target_section=enrollment.section)))

        elif getattr(user, 'role', '') == 'PARENT':
            filters |= Q(audience=Announcement.Audience.PARENTS)
            child_ids = ParentStudentRelation.objects.filter(parent__user=user).values_list('student_id', flat=True)
            enrollments = Enrollment.objects.filter(student_id__in=child_ids, is_active=True)
            class_ids = enrollments.values_list('class_room_id', flat=True)
            section_ids = enrollments.values_list('section_id', flat=True)
            filters |= (Q(audience=Announcement.Audience.CLASS) & (Q(target_class_id__in=class_ids) | Q(target_section_id__in=section_ids)))

        return qs.filter(filters).distinct()
