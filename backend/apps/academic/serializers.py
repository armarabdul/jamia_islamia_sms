from rest_framework import serializers
from .models import AcademicYear, ClassRoom, Section, Subject, SubjectTeacherAssignment
from apps.accounts.serializers import UserSerializer

class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ['id', 'name', 'name_urdu', 'start_date', 'end_date', 'is_current', 'created_at']
        read_only_fields = ['id', 'created_at']


class SectionSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_room.name', read_only=True)
    teacher_name = serializers.CharField(source='class_teacher.get_full_name', read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'class_room', 'class_name', 'name', 'name_urdu', 'capacity', 'class_teacher', 'teacher_name']
        read_only_fields = ['id']


class ClassRoomSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)

    class Meta:
        model = ClassRoom
        fields = ['id', 'name', 'name_urdu', 'numeric_level', 'school', 'sections']
        read_only_fields = ['id']


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'name_urdu', 'code', 'is_elective', 'credit_hours']
        read_only_fields = ['id']


class SubjectTeacherAssignmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_name = serializers.CharField(source='class_room.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)

    class Meta:
        model = SubjectTeacherAssignment
        fields = [
            'id', 'academic_year', 'class_room', 'class_name',
            'section', 'section_name', 'subject', 'subject_name',
            'teacher', 'teacher_name'
        ]
        read_only_fields = ['id']
