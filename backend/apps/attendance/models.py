from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from django.conf import settings

class AttendanceRecord(TimeStampedModel):
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', _('Present')
        ABSENT = 'ABSENT', _('Absent')
        LATE = 'LATE', _('Late')
        EXCUSED = 'EXCUSED', _('Excused')

    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='attendance_records')
    academic_year = models.ForeignKey('academic.AcademicYear', on_delete=models.CASCADE, related_name='attendance_records')
    class_room = models.ForeignKey('academic.ClassRoom', on_delete=models.CASCADE, related_name='attendance_records')
    section = models.ForeignKey('academic.Section', on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(_('Attendance Date'), db_index=True)
    period_number = models.PositiveSmallIntegerField(_('Period Number (0 for daily)'), default=0, help_text='0 indicates full-day general attendance')
    status = models.CharField(_('Status'), max_length=15, choices=Status.choices, default=Status.PRESENT, db_index=True)
    marked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='marked_attendances')
    notes = models.CharField(_('Notes'), max_length=255, blank=True, default='')

    class Meta:
        unique_together = ('student', 'date', 'period_number')
        indexes = [
            models.Index(fields=['class_room', 'section', 'date']),
            models.Index(fields=['section', 'date', 'period_number']),
            models.Index(fields=['academic_year', 'date']),
            models.Index(fields=['student', 'status']),
            models.Index(fields=['date', 'status']),
        ]
        ordering = ['-date', 'student__admission_number']
        verbose_name = _('Attendance Record')
        verbose_name_plural = _('Attendance Records')

    def __str__(self):
        return f"{self.student.full_name} ({self.date}) - {self.get_status_display()}"
