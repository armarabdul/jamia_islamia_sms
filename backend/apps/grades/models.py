from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from django.conf import settings

class GradeScale(TimeStampedModel):
    grade_letter = models.CharField(_('Grade Letter'), max_length=10)
    min_percentage = models.DecimalField(_('Minimum Percentage'), max_digits=5, decimal_places=2)
    max_percentage = models.DecimalField(_('Maximum Percentage'), max_digits=5, decimal_places=2)
    grade_point = models.DecimalField(_('Grade Point'), max_digits=4, decimal_places=2, default=0.00)
    remarks = models.CharField(_('Remarks'), max_length=100, blank=True, default='')
    remarks_urdu = models.CharField(_('Remarks (Urdu)'), max_length=100, blank=True, default='')

    class Meta:
        ordering = ['-min_percentage']
        verbose_name = _('Grade Scale')
        verbose_name_plural = _('Grade Scales')

    def __str__(self):
        return f"{self.grade_letter} ({self.min_percentage}% - {self.max_percentage}%)"


class GradeRecord(TimeStampedModel):
    exam_subject = models.ForeignKey('examinations.ExamSubject', on_delete=models.CASCADE, related_name='grades')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='grades')
    marks_obtained = models.DecimalField(_('Marks Obtained'), max_digits=5, decimal_places=2, default=0.00)
    is_absent = models.BooleanField(_('Was Absent'), default=False)
    grade_letter = models.CharField(_('Calculated Grade'), max_length=10, blank=True, default='')
    remarks = models.CharField(_('Teacher Remarks'), max_length=255, blank=True, default='')
    entered_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='entered_grades')

    class Meta:
        unique_together = ('exam_subject', 'student')
        indexes = [
            models.Index(fields=['student', 'exam_subject']),
        ]
        verbose_name = _('Grade Record')
        verbose_name_plural = _('Grade Records')

    def __str__(self):
        return f"{self.student.full_name} - {self.exam_subject.subject.name}: {self.marks_obtained}/{self.exam_subject.total_marks}"

    def save(self, *args, **kwargs):
        if not self.is_absent and self.exam_subject and self.exam_subject.total_marks > 0:
            percentage = (self.marks_obtained / self.exam_subject.total_marks) * 100
            scale = GradeScale.objects.filter(
                min_percentage__lte=percentage,
                max_percentage__gte=percentage
            ).first()
            if scale:
                self.grade_letter = scale.grade_letter
        elif self.is_absent:
            self.grade_letter = 'AB'
        super().save(*args, **kwargs)
