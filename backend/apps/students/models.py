from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from django.conf import settings

class Student(TimeStampedModel):
    class Gender(models.TextChoices):
        MALE = 'MALE', _('Male')
        FEMALE = 'FEMALE', _('Female')

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        TRANSFERRED = 'TRANSFERRED', _('Transferred')
        GRADUATED = 'GRADUATED', _('Graduated')
        SUSPENDED = 'SUSPENDED', _('Suspended')

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile',
        null=True,
        blank=True
    )
    admission_number = models.CharField(_('Admission Number'), max_length=50, unique=True, db_index=True)
    first_name = models.CharField(_('First Name'), max_length=100)
    last_name = models.CharField(_('Last Name'), max_length=100)
    first_name_urdu = models.CharField(_('First Name (Urdu)'), max_length=100, blank=True, default='')
    last_name_urdu = models.CharField(_('Last Name (Urdu)'), max_length=100, blank=True, default='')
    gender = models.CharField(_('Gender'), max_length=10, choices=Gender.choices, default=Gender.MALE)
    date_of_birth = models.DateField(_('Date of Birth'), null=True, blank=True)
    blood_group = models.CharField(_('Blood Group'), max_length=10, blank=True, default='')
    emergency_contact_name = models.CharField(_('Emergency Contact Name'), max_length=150, blank=True, default='')
    emergency_contact_phone = models.CharField(_('Emergency Contact Phone'), max_length=50, blank=True, default='')
    address = models.TextField(_('Residential Address'), blank=True, default='')
    address_urdu = models.TextField(_('Residential Address (Urdu)'), blank=True, default='')
    previous_school = models.CharField(_('Previous School'), max_length=255, blank=True, default='')
    status = models.CharField(_('Status'), max_length=20, choices=Status.choices, default=Status.ACTIVE, db_index=True)
    admission_date = models.DateField(_('Admission Date'), auto_now_add=True)

    class Meta:
        ordering = ['admission_number']
        verbose_name = _('Student')
        verbose_name_plural = _('Students')

    def __str__(self):
        return f"{self.admission_number} - {self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def full_name_urdu(self):
        return f"{self.first_name_urdu} {self.last_name_urdu}".strip()

    @property
    def current_enrollment(self):
        return self.enrollments.filter(is_active=True).select_related('class_room', 'section', 'academic_year').first()


class Enrollment(TimeStampedModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    academic_year = models.ForeignKey('academic.AcademicYear', on_delete=models.CASCADE, related_name='enrollments')
    class_room = models.ForeignKey('academic.ClassRoom', on_delete=models.CASCADE, related_name='enrollments')
    section = models.ForeignKey('academic.Section', on_delete=models.CASCADE, related_name='enrollments')
    roll_number = models.CharField(_('Roll Number'), max_length=30, blank=True, default='')
    enrollment_date = models.DateField(_('Enrollment Date'), auto_now_add=True)
    is_active = models.BooleanField(_('Is Active Enrollment'), default=True)

    class Meta:
        unique_together = ('student', 'academic_year')
        indexes = [
            models.Index(fields=['class_room', 'section', 'is_active']),
            models.Index(fields=['student', 'is_active']),
            models.Index(fields=['academic_year', 'is_active']),
        ]
        ordering = ['class_room__numeric_level', 'section__name', 'roll_number']
        verbose_name = _('Enrollment')
        verbose_name_plural = _('Enrollments')

    def __str__(self):
        return f"{self.student.full_name} ({self.class_room.name}-{self.section.name} / {self.academic_year.name})"
