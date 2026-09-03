from rest_framework import serializers
from .models import CalendarEvent

class CalendarEventSerializer(serializers.ModelSerializer):
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)

    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'title', 'title_urdu', 'event_type', 'event_type_display',
            'start_date', 'end_date', 'description', 'description_urdu',
            'is_holiday', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
