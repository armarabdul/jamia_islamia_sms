from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel

class Exam(TimeStampedModel):
    name = models.CharField(_('Exam Title'), max_length=150)
    name_urdu = models.CharField(_('Exam Title (Urdu)'), max_length=150, blank=True, default='')
    academic_year = models.ForeignKey('academic.AcademicYear', on_delete=models.CASCADE, related_name='exams')
    start_date = models.DateField(_('Start Date'))
    end_date = models.DateField(_('End Date'))
    is_published = models.BooleanField(_('Is Results Published'), default=False, db_index=True)
    description = models.TextField(_('Description / Instructions'), blank=True, default='')

    class Meta:
        ordering = ['-start_date']
        verbose_name = _('Examination')
        verbose_name_plural = _('Examinations')

    def __str__(self):
        return f"{self.name} ({self.academic_year.name})"


class ExamSubject(TimeStampedModel):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='exam_subjects')
    class_room = models.ForeignKey('academic.ClassRoom', on_delete=models.CASCADE, related_name='exam_subjects')
    subject = models.ForeignKey('academic.Subject', on_delete=models.CASCADE, related_name='exam_subjects')
    exam_date = models.DateField(_('Exam Date'))
    start_time = models.TimeField(_('Start Time'), null=True, blank=True)
    end_time = models.TimeField(_('End Time'), null=True, blank=True)
    total_marks = models.DecimalField(_('Total Marks'), max_digits=5, decimal_places=2, default=100.00)
    passing_marks = models.DecimalField(_('Passing Marks'), max_digits=5, decimal_places=2, default=40.00)

    class Meta:
        unique_together = ('exam', 'class_room', 'subject')
        ordering = ['exam_date', 'start_time']
        verbose_name = _('Exam Subject Schedule')
        verbose_name_plural = _('Exam Subject Schedules')

    def __str__(self):
        return f"{self.exam.name} - {self.class_room.name} : {self.subject.name}"
