from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from django.conf import settings

class Staff(TimeStampedModel):
    class Department(models.TextChoices):
        ACADEMIC = 'ACADEMIC', _('Academic / Teaching')
        ADMINISTRATION = 'ADMINISTRATION', _('Administration')
        ISLAMIC_STUDIES = 'ISLAMIC_STUDIES', _('Islamic Studies / Qirat')
        LIBRARY = 'LIBRARY', _('Library')
        FINANCE = 'FINANCE', _('Finance & Accounts')
        SUPPORT = 'SUPPORT', _('Support & Maintenance')

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='staff_profile'
    )
    employee_code = models.CharField(_('Employee Code'), max_length=50, unique=True, db_index=True)
    qualification = models.CharField(_('Qualification'), max_length=200, blank=True, default='')
    designation = models.CharField(_('Designation'), max_length=100, default='Teacher')
    department = models.CharField(_('Department'), max_length=50, choices=Department.choices, default=Department.ACADEMIC)
    joining_date = models.DateField(_('Date of Joining'), null=True, blank=True)
    is_teaching = models.BooleanField(_('Is Teaching Staff'), default=True)
    emergency_contact = models.CharField(_('Emergency Contact'), max_length=100, blank=True, default='')

    class Meta:
        verbose_name = _('Staff')
        verbose_name_plural = _('Staff Members')

    def __str__(self):
        return f"{self.employee_code} - {self.user.get_full_name() or self.user.username} ({self.designation})"


class LeaveRequest(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')

    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='leave_requests')
    start_date = models.DateField(_('Start Date'))
    end_date = models.DateField(_('End Date'))
    reason = models.TextField(_('Reason for Leave'))
    status = models.CharField(_('Status'), max_length=20, choices=Status.choices, default=Status.PENDING)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_leaves'
    )
    admin_notes = models.TextField(_('Admin Notes'), blank=True, default='')

    class Meta:
        ordering = ['-start_date']
        verbose_name = _('Leave Request')
        verbose_name_plural = _('Leave Requests')

    def __str__(self):
        return f"{self.staff.user.username} ({self.start_date} to {self.end_date}) - {self.status}"
