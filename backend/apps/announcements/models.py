from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from django.conf import settings

class Announcement(TimeStampedModel):
    class Audience(models.TextChoices):
        ALL = 'ALL', _('School-wide (Everyone)')
        TEACHERS = 'TEACHERS', _('Teachers Only')
        STUDENTS = 'STUDENTS', _('Students Only')
        PARENTS = 'PARENTS', _('Parents Only')
        CLASS = 'CLASS', _('Specific Class / Section')

    title = models.CharField(_('Title'), max_length=200)
    title_urdu = models.CharField(_('Title (Urdu)'), max_length=200, blank=True, default='')
    content = models.TextField(_('Announcement Content'))
    content_urdu = models.TextField(_('Announcement Content (Urdu)'), blank=True, default='')
    audience = models.CharField(_('Target Audience'), max_length=20, choices=Audience.choices, default=Audience.ALL)
    target_class = models.ForeignKey('academic.ClassRoom', on_delete=models.CASCADE, null=True, blank=True, related_name='announcements')
    target_section = models.ForeignKey('academic.Section', on_delete=models.CASCADE, null=True, blank=True, related_name='announcements')
    attachment = models.FileField(_('Attachment'), upload_to='announcements/', blank=True, null=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_announcements')
    is_pinned = models.BooleanField(_('Is Pinned Announcement'), default=False)
    published_at = models.DateTimeField(_('Publish Date'), auto_now_add=True)
    expires_at = models.DateTimeField(_('Expiry Date'), null=True, blank=True)

    class Meta:
        ordering = ['-is_pinned', '-published_at']
        verbose_name = _('Announcement')
        verbose_name_plural = _('Announcements')

    def __str__(self):
        return f"{self.title} ({self.get_audience_display()})"
