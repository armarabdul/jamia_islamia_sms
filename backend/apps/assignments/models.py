from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from django.conf import settings

from core.validators import validate_secure_file_upload

class Assignment(TimeStampedModel):
    title = models.CharField(_('Homework Title'), max_length=200)
    title_urdu = models.CharField(_('Homework Title (Urdu)'), max_length=200, blank=True, default='')
    description = models.TextField(_('Detailed Instructions / Content'))
    subject = models.ForeignKey('academic.Subject', on_delete=models.CASCADE, related_name='assignments')
    class_room = models.ForeignKey('academic.ClassRoom', on_delete=models.CASCADE, related_name='assignments')
    section = models.ForeignKey('academic.Section', on_delete=models.CASCADE, related_name='assignments')
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_assignments',
        limit_choices_to={'role': 'TEACHER'}
    )
    due_date = models.DateField(_('Due Date'), db_index=True)
    attachment = models.FileField(_('Worksheet / Material Attachment'), upload_to='assignments/', blank=True, null=True, validators=[validate_secure_file_upload])
    max_marks = models.DecimalField(_('Maximum Marks'), max_digits=5, decimal_places=2, default=10.00)

    class Meta:
        ordering = ['-due_date', '-created_at']
        verbose_name = _('Assignment / Homework')
        verbose_name_plural = _('Assignments & Homework')

    def __str__(self):
        return f"{self.title} ({self.subject.name} - {self.section.name}) Due: {self.due_date}"


class Submission(TimeStampedModel):
    class Status(models.TextChoices):
        SUBMITTED = 'SUBMITTED', _('Submitted')
        GRADED = 'GRADED', _('Graded')
        LATE = 'LATE', _('Late Submission')
        RESUBMISSION_REQUESTED = 'RESUBMISSION_REQUESTED', _('Resubmission Requested')

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='assignment_submissions')
    submission_text = models.TextField(_('Student Answers / Notes'), blank=True, default='')
    attachment = models.FileField(_('Submission File / Photo'), upload_to='submissions/', blank=True, null=True, validators=[validate_secure_file_upload])
    status = models.CharField(_('Status'), max_length=30, choices=Status.choices, default=Status.SUBMITTED)
    marks_obtained = models.DecimalField(_('Marks Awarded'), max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(_('Teacher Feedback'), blank=True, default='')
    graded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_submissions')

    class Meta:
        unique_together = ('assignment', 'student')
        ordering = ['-created_at']
        verbose_name = _('Assignment Submission')
        verbose_name_plural = _('Assignment Submissions')

    def __str__(self):
        return f"{self.student.full_name} -> {self.assignment.title} ({self.status})"
