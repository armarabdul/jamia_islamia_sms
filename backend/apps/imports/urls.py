from django.urls import path
from .views import PreviewStudentCSVView, CommitStudentCSVView, ExportStudentCSVView

urlpatterns = [
    path('preview-students/', PreviewStudentCSVView.as_view(), name='preview_students_csv'),
    path('commit-students/', CommitStudentCSVView.as_view(), name='commit_students_csv'),
    path('export-students/', ExportStudentCSVView.as_view(), name='export_students_csv'),
]
