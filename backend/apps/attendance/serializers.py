from rest_framework import serializers
from .models import AttendanceRecord

class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_name_urdu = serializers.CharField(source='student.full_name_urdu', read_only=True)
    admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    roll_number = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'student', 'student_name', 'student_name_urdu', 'admission_number',
            'roll_number', 'academic_year', 'class_room', 'section', 'date',
            'period_number', 'status', 'marked_by', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_roll_number(self, obj):
        enrollment = obj.student.enrollments.filter(is_active=True).first()
        return enrollment.roll_number if enrollment else ''


class AttendanceItemSerializer(serializers.Serializer):
    student_id = serializers.UUIDField()
    status = serializers.ChoiceField(choices=AttendanceRecord.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class BulkAttendanceCreateSerializer(serializers.Serializer):
    academic_year_id = serializers.UUIDField()
    class_room_id = serializers.UUIDField()
    section_id = serializers.UUIDField()
    date = serializers.DateField()
    period_number = serializers.IntegerField(default=0)
    records = AttendanceItemSerializer(many=True)
