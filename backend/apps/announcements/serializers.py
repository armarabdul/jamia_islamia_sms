from rest_framework import serializers
from .models import Announcement

class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    target_class_name = serializers.CharField(source='target_class.name', read_only=True)
    target_section_name = serializers.CharField(source='target_section.name', read_only=True)

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'title_urdu', 'content', 'content_urdu',
            'audience', 'target_class', 'target_class_name',
            'target_section', 'target_section_name', 'attachment',
            'author', 'author_name', 'is_pinned', 'published_at',
            'expires_at', 'created_at'
        ]
        read_only_fields = ['id', 'author', 'published_at', 'created_at']
