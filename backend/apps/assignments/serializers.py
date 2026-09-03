from rest_framework import serializers
from .models import Assignment, Submission

class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_name_urdu = serializers.CharField(source='student.full_name_urdu', read_only=True)
    admission_number = serializers.CharField(source='student.admission_number', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id', 'assignment', 'student', 'student_name', 'student_name_urdu',
            'admission_number', 'submission_text', 'attachment', 'status',
            'marks_obtained', 'feedback', 'graded_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'graded_by', 'created_at', 'updated_at']


class AssignmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_name_urdu = serializers.CharField(source='subject.name_urdu', read_only=True)
    class_name = serializers.CharField(source='class_room.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    submission_count = serializers.SerializerMethodField()
    my_submission = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            'id', 'title', 'title_urdu', 'description', 'subject', 'subject_name',
            'subject_name_urdu', 'class_room', 'class_name', 'section',
            'section_name', 'teacher', 'teacher_name', 'due_date',
            'attachment', 'max_marks', 'submission_count', 'my_submission', 'created_at'
        ]
        read_only_fields = ['id', 'teacher', 'created_at']

    def get_submission_count(self, obj):
        return obj.submissions.count()

    def get_my_submission(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        if getattr(request.user, 'role', '') == 'STUDENT':
            student = getattr(request.user, 'student_profile', None)
            if student:
                sub = obj.submissions.filter(student=student).first()
                if sub:
                    return SubmissionSerializer(sub).data
        return None
