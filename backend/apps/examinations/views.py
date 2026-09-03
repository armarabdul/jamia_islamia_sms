from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Exam, ExamSubject
from .serializers import ExamSerializer, ExamSubjectSerializer
from core.permissions import IsAdminUserRole

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all().prefetch_related('exam_subjects__subject')
    serializer_class = ExamSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def publish(self, request, pk=None):
        exam = self.get_object()
        exam.is_published = True
        exam.save()
        return Response({'success': True, 'message': f'{exam.name} results are now published.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def unpublish(self, request, pk=None):
        exam = self.get_object()
        exam.is_published = False
        exam.save()
        return Response({'success': True, 'message': f'{exam.name} results are now unpublished.'})


class ExamSubjectViewSet(viewsets.ModelViewSet):
    queryset = ExamSubject.objects.all().select_related('exam', 'class_room', 'subject')
    serializer_class = ExamSubjectSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        qs = super().get_queryset()
        exam_id = self.request.query_params.get('exam_id')
        class_id = self.request.query_params.get('class_id')
        if exam_id:
            qs = qs.filter(exam_id=exam_id)
        if class_id:
            qs = qs.filter(class_room_id=class_id)
        return qs
