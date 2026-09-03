from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from django.conf import settings

class AcademicYear(TimeStampedModel):
    name = models.CharField(_('Year Name'), max_length=50, unique=True, help_text='e.g., 2026-2027')
    name_urdu = models.CharField(_('Year Name (Urdu)'), max_length=50, blank=True, default='')
    start_date = models.DateField(_('Start Date'))
    end_date = models.DateField(_('End Date'))
    is_current = models.BooleanField(_('Is Current Academic Year'), default=False)

    class Meta:
        ordering = ['-start_date']
        verbose_name = _('Academic Year')
        verbose_name_plural = _('Academic Years')

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.is_current:
            AcademicYear.objects.filter(is_current=True).exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)


class ClassRoom(TimeStampedModel):
    name = models.CharField(_('Class Name'), max_length=100)
    name_urdu = models.CharField(_('Class Name (Urdu)'), max_length=100, blank=True, default='')
    numeric_level = models.PositiveIntegerField(_('Numeric Level'), default=1)
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='classes', null=True, blank=True)

    class Meta:
        ordering = ['numeric_level', 'name']
        verbose_name = _('Class')
        verbose_name_plural = _('Classes')

    def __str__(self):
        return self.name


class Section(TimeStampedModel):
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(_('Section Name'), max_length=50, help_text='e.g., Section A, B')
    name_urdu = models.CharField(_('Section Name (Urdu)'), max_length=50, blank=True, default='')
    capacity = models.PositiveIntegerField(_('Student Capacity'), default=40)
    class_teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_sections',
        limit_choices_to={'role': 'TEACHER'}
    )

    class Meta:
        unique_together = ('class_room', 'name')
        ordering = ['class_room__numeric_level', 'name']
        verbose_name = _('Section')
        verbose_name_plural = _('Sections')

    def __str__(self):
        return f"{self.class_room.name} - {self.name}"


class Subject(TimeStampedModel):
    name = models.CharField(_('Subject Name'), max_length=100)
    name_urdu = models.CharField(_('Subject Name (Urdu)'), max_length=100, blank=True, default='')
    code = models.CharField(_('Subject Code'), max_length=50, unique=True)
    is_elective = models.BooleanField(_('Is Elective'), default=False)
    credit_hours = models.PositiveIntegerField(_('Credit Hours / Periods per week'), default=4)

    class Meta:
        ordering = ['name']
        verbose_name = _('Subject')
        verbose_name_plural = _('Subjects')

    def __str__(self):
        return f"{self.name} ({self.code})"


class SubjectTeacherAssignment(TimeStampedModel):
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='subject_assignments')
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='subject_assignments')
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='subject_assignments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teacher_assignments')
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_subjects',
        limit_choices_to={'role': 'TEACHER'}
    )

    class Meta:
        unique_together = ('academic_year', 'section', 'subject', 'teacher')
        verbose_name = _('Subject Teacher Assignment')
        verbose_name_plural = _('Subject Teacher Assignments')

    def __str__(self):
        return f"{self.teacher.get_full_name() or self.teacher.username} - {self.subject.name} ({self.section})"
