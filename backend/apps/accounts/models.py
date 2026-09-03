import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('Administrator')
        TEACHER = 'TEACHER', _('Teacher')
        STUDENT = 'STUDENT', _('Student')
        PARENT = 'PARENT', _('Parent')
        STAFF = 'STAFF', _('Staff')

    class Language(models.TextChoices):
        ENGLISH = 'en', _('English')
        URDU = 'ur', _('Urdu')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(
        _('Role'),
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
        db_index=True
    )
    phone_number = models.CharField(_('Phone Number'), max_length=20, blank=True, null=True)
    language_preference = models.CharField(
        _('Language Preference'),
        max_length=10,
        choices=Language.choices,
        default=Language.ENGLISH
    )
    profile_picture = models.ImageField(_('Profile Picture'), upload_to='profiles/', blank=True, null=True)
    is_verified = models.BooleanField(_('Is Verified'), default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['username']
        verbose_name = _('User')
        verbose_name_plural = _('Users')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN or self.is_superuser

    @property
    def is_teacher(self):
        return self.role == self.Role.TEACHER

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_parent(self):
        return self.role == self.Role.PARENT

    @property
    def is_staff_member(self):
        return self.role == self.Role.STAFF


class DeviceToken(models.Model):
    """
    Stores FCM / Expo Push tokens for Android & iOS notification dispatch.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='device_tokens')
    token = models.CharField(_('Device Token'), max_length=512, unique=True)
    platform = models.CharField(_('Platform'), max_length=20, choices=[('android', 'Android'), ('ios', 'iOS'), ('web', 'Web')], default='android')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'is_active']),
        ]


class AuditLog(models.Model):
    """
    Security audit trail for tracking administrative changes, data modifications, and security events.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(_('Action'), max_length=100, db_index=True)
    resource_type = models.CharField(_('Resource Type'), max_length=100, db_index=True)
    resource_id = models.CharField(_('Resource ID'), max_length=100, blank=True, null=True)
    changes = models.JSONField(_('Changes'), default=dict, blank=True)
    ip_address = models.GenericIPAddressField(_('IP Address'), blank=True, null=True)
    timestamp = models.DateTimeField(_('Timestamp'), auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']


class IdempotencyRecord(models.Model):
    """
    Stores idempotency receipts keyed by user and client-provided X-Idempotency-Key.
    Ensures safe retry of offline mutations without duplicate actions.
    """
    key = models.CharField(max_length=255, db_index=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='idempotency_records',
        null=True,
        blank=True
    )
    request_path = models.CharField(max_length=255)
    request_method = models.CharField(max_length=10)
    request_hash = models.CharField(max_length=64)
    status_code = models.IntegerField()
    response_body = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = ('key', 'user')
        indexes = [
            models.Index(fields=['key', 'user']),
        ]
