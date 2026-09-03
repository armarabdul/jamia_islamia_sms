from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from django.conf import settings

class Notification(TimeStampedModel):
    class NotificationType(models.TextChoices):
        ATTENDANCE = 'ATTENDANCE', _('Attendance Alert')
        HOMEWORK = 'HOMEWORK', _('Homework / Assignment')
        EXAM = 'EXAM', _('Examination Schedule')
        GRADE = 'GRADE', _('Grade / Result Publication')
        ANNOUNCEMENT = 'ANNOUNCEMENT', _('School Announcement')
        MESSAGE = 'MESSAGE', _('Direct Message')
        TIMETABLE = 'TIMETABLE', _('Timetable Update')
        SYSTEM = 'SYSTEM', _('System Alert')

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(_('Notification Title'), max_length=200)
    title_urdu = models.CharField(_('Notification Title (Urdu)'), max_length=200, blank=True, default='')
    body = models.TextField(_('Notification Body'))
    body_urdu = models.TextField(_('Notification Body (Urdu)'), blank=True, default='')
    notification_type = models.CharField(
        _('Type'),
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
        db_index=True
    )
    resource_type = models.CharField(_('Resource Type'), max_length=100, blank=True, default='')
    resource_id = models.CharField(_('Resource ID'), max_length=100, blank=True, default='')
    is_read = models.BooleanField(_('Is Read'), default=False, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
        ]
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')

    def __str__(self):
        return f"To: {self.recipient.username} [{self.notification_type}] {self.title}"
