from rest_framework import viewsets, permissions
from .models import CalendarEvent
from .serializers import CalendarEventSerializer
from core.permissions import IsAdminUserRole

class CalendarEventViewSet(viewsets.ModelViewSet):
    queryset = CalendarEvent.objects.all()
    serializer_class = CalendarEventSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        qs = super().get_queryset()
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        event_type = self.request.query_params.get('type')

        if year and month:
            qs = qs.filter(start_date__year=year, start_date__month=month)
        elif year:
            qs = qs.filter(start_date__year=year)
        if event_type:
            qs = qs.filter(event_type=event_type)

        return qs
