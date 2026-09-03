from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(generics.ListAPIView):
    """
    Lists notifications for the authenticated user with unread counts.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        unread_count = Notification.objects.filter(recipient=request.user, is_read=False).count()

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            res = self.get_paginated_response(serializer.data)
            res.data['unread_count'] = unread_count
            return res

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'unread_count': unread_count,
            'results': serializer.data
        })


class MarkNotificationReadView(generics.GenericAPIView):
    """
    Marks a specific notification or all notifications as read.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        if pk:
            notif = Notification.objects.filter(id=pk, recipient=request.user).first()
            if notif:
                notif.is_read = True
                notif.save(update_fields=['is_read'])
                return Response({'success': True})
            return Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
            return Response({'success': True, 'message': 'All notifications marked as read.'})
