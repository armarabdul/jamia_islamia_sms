from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel

class CalendarEvent(TimeStampedModel):
    class EventType(models.TextChoices):
        HOLIDAY = 'HOLIDAY', _('School Holiday')
        EXAM = 'EXAM', _('Examination')
        ACADEMIC = 'ACADEMIC', _('Academic Milestone / Term Start')
        MEETING = 'MEETING', _('Parent-Teacher Meeting')
        DEADLINE = 'DEADLINE', _('Assignment / Fee Deadline')
        SPORTS = 'SPORTS', _('Sports & Extra-Curricular')
        ISLAMIC = 'ISLAMIC', _('Islamic Event / Gathering')

    title = models.CharField(_('Event Title'), max_length=150)
    title_urdu = models.CharField(_('Event Title (Urdu)'), max_length=150, blank=True, default='')
    event_type = models.CharField(_('Event Type'), max_length=20, choices=EventType.choices, default=EventType.ACADEMIC, db_index=True)
    start_date = models.DateField(_('Start Date'), db_index=True)
    end_date = models.DateField(_('End Date'), db_index=True)
    description = models.TextField(_('Description'), blank=True, default='')
    description_urdu = models.TextField(_('Description (Urdu)'), blank=True, default='')
    is_holiday = models.BooleanField(_('Is Institutional Holiday'), default=False)

    class Meta:
        ordering = ['start_date']
        verbose_name = _('Calendar Event')
        verbose_name_plural = _('Calendar Events')

    def __str__(self):
        return f"{self.title} ({self.start_date} to {self.end_date})"
