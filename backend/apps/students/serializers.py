from rest_framework import serializers
from .models import Student, Enrollment
from apps.academic.serializers import ClassRoomSerializer, SectionSerializer, AcademicYearSerializer

class EnrollmentSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_room.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'academic_year', 'academic_year_name',
            'class_room', 'class_name', 'section', 'section_name',
            'roll_number', 'enrollment_date', 'is_active'
        ]
        read_only_fields = ['id', 'enrollment_date']


class StudentSerializer(serializers.ModelSerializer):
    current_enrollment = EnrollmentSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    full_name_urdu = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'admission_number', 'first_name', 'last_name',
            'first_name_urdu', 'last_name_urdu', 'full_name', 'full_name_urdu',
            'gender', 'date_of_birth', 'blood_group',
            'emergency_contact_name', 'emergency_contact_phone',
            'address', 'address_urdu', 'previous_school', 'status',
            'admission_date', 'current_enrollment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'admission_date', 'created_at', 'updated_at']
