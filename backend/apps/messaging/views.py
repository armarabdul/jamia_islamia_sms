from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from apps.accounts.models import User

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.conversations.all().prefetch_related('participants', 'messages')

    def create(self, request, *args, **kwargs):
        """
        Creates a conversation subject to school communication boundary rules:
        - Admin can message anyone
        - Teacher can message Parents, Students, and Admins
        - Parent can message assigned Teachers and Admins
        - Student can message assigned Teachers and Admins
        - Arbitrary student-to-student or parent-to-parent messaging is forbidden.
        """
        user = request.user
        recipient_ids = request.data.get('participants', [])
        subject = request.data.get('subject', '')
        initial_message = request.data.get('message', '')

        if not recipient_ids:
            return Response({'detail': 'Must specify at least one recipient.'}, status=status.HTTP_400_BAD_REQUEST)

        recipients = list(User.objects.filter(id__in=recipient_ids))
        if not recipients:
            return Response({'detail': 'Invalid recipient(s).'}, status=status.HTTP_400_BAD_REQUEST)

        # Policy validation
        if getattr(user, 'role', '') in ['STUDENT', 'PARENT']:
            for r in recipients:
                if getattr(r, 'role', '') not in ['TEACHER', 'ADMIN'] and not r.is_staff and not r.is_superuser:
                    return Response(
                        {'detail': f'Communication with {r.get_role_display()} is restricted.'},
                        status=status.HTTP_403_FORBIDDEN
                    )

        conversation = Conversation.objects.create(subject=subject)
        conversation.participants.add(user, *recipients)

        if initial_message:
            Message.objects.create(
                conversation=conversation,
                sender=user,
                content=initial_message
            )

        return Response(ConversationSerializer(conversation, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], url_path='messages')
    def messages(self, request, pk=None):
        conversation = self.get_object()
        if request.method == 'GET':
            # Mark all unread messages from other participants as read
            conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
            msgs = conversation.messages.all().select_related('sender')
            return Response(MessageSerializer(msgs, many=True).data)

        elif request.method == 'POST':
            content = request.data.get('content', '').strip()
            attachment = request.FILES.get('attachment')
            if not content and not attachment:
                return Response({'detail': 'Message content or attachment is required.'}, status=status.HTTP_400_BAD_REQUEST)

            msg = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=content,
                attachment=attachment
            )
            conversation.save()  # update last_message_at
            return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)
