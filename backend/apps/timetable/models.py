from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from django.conf import settings

class TimetableEntry(TimeStampedModel):
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, _('Monday')
        TUESDAY = 1, _('Tuesday')
        WEDNESDAY = 2, _('Wednesday')
        THURSDAY = 3, _('Thursday')
        FRIDAY = 4, _('Friday')
        SATURDAY = 5, _('Saturday')
        SUNDAY = 6, _('Sunday')

    academic_year = models.ForeignKey('academic.AcademicYear', on_delete=models.CASCADE, related_name='timetable_entries')
    class_room = models.ForeignKey('academic.ClassRoom', on_delete=models.CASCADE, related_name='timetable_entries')
    section = models.ForeignKey('academic.Section', on_delete=models.CASCADE, related_name='timetable_entries')
    subject = models.ForeignKey('academic.Subject', on_delete=models.CASCADE, related_name='timetable_entries')
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='timetable_slots',
        limit_choices_to={'role': 'TEACHER'}
    )
    day_of_week = models.IntegerField(_('Day of Week'), choices=DayOfWeek.choices, db_index=True)
    period_number = models.PositiveSmallIntegerField(_('Period Number'), help_text='1 to 8')
    start_time = models.TimeField(_('Start Time'))
    end_time = models.TimeField(_('End Time'))
    room_number = models.CharField(_('Room Number / Hall'), max_length=50, blank=True, default='')

    class Meta:
        unique_together = ('academic_year', 'section', 'day_of_week', 'period_number')
        ordering = ['day_of_week', 'period_number']
        verbose_name = _('Timetable Entry')
        verbose_name_plural = _('Timetable Entries')

    def __str__(self):
        return f"{self.get_day_of_week_display()} P{self.period_number}: {self.section} - {self.subject.name} ({self.teacher.get_full_name() or self.teacher.username})"
