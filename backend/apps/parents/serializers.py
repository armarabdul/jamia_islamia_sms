from rest_framework import serializers
from .models import Parent, ParentStudentRelation
from apps.students.serializers import StudentSerializer

class ParentStudentRelationSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = ParentStudentRelation
        fields = ['id', 'parent', 'student', 'student_id', 'relationship_type', 'is_primary_contact']
        read_only_fields = ['id']


class ParentSerializer(serializers.ModelSerializer):
    children = ParentStudentRelationSerializer(source='children_relations', many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Parent
        fields = [
            'id', 'user', 'username', 'email', 'father_name', 'father_name_urdu',
            'mother_name', 'mother_name_urdu', 'primary_phone', 'secondary_phone',
            'occupation', 'address', 'address_urdu', 'children', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
