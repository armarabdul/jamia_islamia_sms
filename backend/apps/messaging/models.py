from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from django.conf import settings

class Conversation(TimeStampedModel):
    subject = models.CharField(_('Subject / Topic'), max_length=150, blank=True, default='')
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    last_message_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_message_at']
        verbose_name = _('Conversation')
        verbose_name_plural = _('Conversations')

    def __str__(self):
        return f"Conversation: {self.subject or self.id}"


class Message(TimeStampedModel):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(_('Message Text'))
    attachment = models.FileField(_('Attachment'), upload_to='messages/', blank=True, null=True)
    is_read = models.BooleanField(_('Is Read'), default=False)

    class Meta:
        ordering = ['created_at']
        verbose_name = _('Message')
        verbose_name_plural = _('Messages')

    def __str__(self):
        return f"{self.sender.username}: {self.content[:30]}"
