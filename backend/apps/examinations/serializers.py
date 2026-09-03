from rest_framework import serializers
from .models import Exam, ExamSubject

class ExamSubjectSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    class_name = serializers.CharField(source='class_room.name', read_only=True)

    class Meta:
        model = ExamSubject
        fields = [
            'id', 'exam', 'class_room', 'class_name', 'subject',
            'subject_name', 'subject_code', 'exam_date', 'start_time',
            'end_time', 'total_marks', 'passing_marks'
        ]
        read_only_fields = ['id']


class ExamSerializer(serializers.ModelSerializer):
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    exam_subjects = ExamSubjectSerializer(many=True, read_only=True)

    class Meta:
        model = Exam
        fields = [
            'id', 'name', 'name_urdu', 'academic_year', 'academic_year_name',
            'start_date', 'end_date', 'is_published', 'description',
            'exam_subjects', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
