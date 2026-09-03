from rest_framework import serializers
from .models import GradeScale, GradeRecord

class GradeScaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeScale
        fields = ['id', 'grade_letter', 'min_percentage', 'max_percentage', 'grade_point', 'remarks', 'remarks_urdu']
        read_only_fields = ['id']


class GradeRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_name_urdu = serializers.CharField(source='student.full_name_urdu', read_only=True)
    admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    subject_name = serializers.CharField(source='exam_subject.subject.name', read_only=True)
    subject_name_urdu = serializers.CharField(source='exam_subject.subject.name_urdu', read_only=True)
    total_marks = serializers.DecimalField(source='exam_subject.total_marks', max_digits=5, decimal_places=2, read_only=True)
    passing_marks = serializers.DecimalField(source='exam_subject.passing_marks', max_digits=5, decimal_places=2, read_only=True)
    exam_name = serializers.CharField(source='exam_subject.exam.name', read_only=True)

    class Meta:
        model = GradeRecord
        fields = [
            'id', 'exam_subject', 'exam_name', 'student', 'student_name',
            'student_name_urdu', 'admission_number', 'subject_name',
            'subject_name_urdu', 'marks_obtained', 'total_marks',
            'passing_marks', 'is_absent', 'grade_letter', 'remarks',
            'entered_by', 'created_at'
        ]
        read_only_fields = ['id', 'grade_letter', 'created_at']


class StudentMarkItemSerializer(serializers.Serializer):
    student_id = serializers.UUIDField()
    marks_obtained = serializers.DecimalField(max_digits=5, decimal_places=2)
    is_absent = serializers.BooleanField(default=False)
    remarks = serializers.CharField(required=False, allow_blank=True, default='')


class BatchMarksEntrySerializer(serializers.Serializer):
    exam_subject_id = serializers.UUIDField()
    marks = StudentMarkItemSerializer(many=True)
