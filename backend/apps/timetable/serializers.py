from rest_framework import serializers
from .models import TimetableEntry

class TimetableEntrySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_name_urdu = serializers.CharField(source='subject.name_urdu', read_only=True)
    class_name = serializers.CharField(source='class_room.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = TimetableEntry
        fields = [
            'id', 'academic_year', 'class_room', 'class_name', 'section',
            'section_name', 'subject', 'subject_name', 'subject_name_urdu',
            'teacher', 'teacher_name', 'day_of_week', 'day_name',
            'period_number', 'start_time', 'end_time', 'room_number'
        ]
        read_only_fields = ['id']
