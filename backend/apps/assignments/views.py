from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Assignment, Submission
from .serializers import AssignmentSerializer, SubmissionSerializer
from apps.parents.models import ParentStudentRelation
from apps.students.models import Student
from core.permissions import IsAdminUserRole, IsTeacherUserRole

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all().select_related('subject', 'class_room', 'section', 'teacher')
    serializer_class = AssignmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsTeacherUserRole()]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if getattr(user, 'role', '') == 'STUDENT':
            student = Student.objects.filter(user=user).first()
            if student:
                enrollment = student.enrollments.filter(is_active=True).first()
                if enrollment:
                    qs = qs.filter(section=enrollment.section)
                else:
                    return Assignment.objects.none()
            else:
                return Assignment.objects.none()

        elif getattr(user, 'role', '') == 'PARENT':
            child_ids = ParentStudentRelation.objects.filter(parent__user=user).values_list('student_id', flat=True)
            from apps.students.models import Enrollment
            section_ids = Enrollment.objects.filter(student_id__in=child_ids, is_active=True).values_list('section_id', flat=True)
            qs = qs.filter(section_id__in=section_ids)

        elif getattr(user, 'role', '') == 'TEACHER':
            is_my_only = self.request.query_params.get('my_assignments')
            if is_my_only:
                qs = qs.filter(teacher=user)

        section_id = self.request.query_params.get('section_id')
        subject_id = self.request.query_params.get('subject_id')
        if section_id:
            qs = qs.filter(section_id=section_id)
        if subject_id:
            qs = qs.filter(subject_id=subject_id)

        return qs

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request, pk=None):
        """
        Endpoint for students to submit homework responses & files.
        """
        assignment = self.get_object()
        student = Student.objects.filter(user=request.user).first()
        if not student:
            return Response({'detail': 'Only students can submit assignments.'}, status=status.HTTP_403_FORBIDDEN)

        submission_text = request.data.get('submission_text', '')
        attachment = request.FILES.get('attachment')

        sub, _ = Submission.objects.update_or_create(
            assignment=assignment,
            student=student,
            defaults={
                'submission_text': submission_text,
                'status': Submission.Status.SUBMITTED,
                **({'attachment': attachment} if attachment else {})
            }
        )

        return Response(SubmissionSerializer(sub).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[IsTeacherUserRole])
    def submissions(self, request, pk=None):
        """
        List all student submissions for this assignment.
        """
        assignment = self.get_object()
        subs = assignment.submissions.all().select_related('student')
        return Response(SubmissionSerializer(subs, many=True).data)


class GradeSubmissionView(generics.UpdateAPIView):
    """
    Teacher endpoint to evaluate student submissions and provide feedback.
    """
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsTeacherUserRole]

    def update(self, request, *args, **kwargs):
        submission = self.get_object()
        marks = request.data.get('marks_obtained')
        feedback = request.data.get('feedback', '')
        status_val = request.data.get('status', Submission.Status.GRADED)

        submission.marks_obtained = marks
        submission.feedback = feedback
        submission.status = status_val
        submission.graded_by = request.user
        submission.save()

        return Response(SubmissionSerializer(submission).data)
