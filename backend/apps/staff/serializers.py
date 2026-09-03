from rest_framework import serializers
from .models import Staff, LeaveRequest
from apps.accounts.serializers import UserSerializer

class StaffSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Staff
        fields = [
            'id', 'user', 'username', 'first_name', 'last_name', 'full_name',
            'email', 'phone_number', 'employee_code', 'qualification',
            'designation', 'department', 'joining_date', 'is_teaching',
            'emergency_contact', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class LeaveRequestSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.user.get_full_name', read_only=True)
    staff_code = serializers.CharField(source='staff.employee_code', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'staff', 'staff_name', 'staff_code', 'start_date', 'end_date',
            'reason', 'status', 'approved_by', 'admin_notes', 'created_at'
        ]
        read_only_fields = ['id', 'approved_by', 'created_at']
