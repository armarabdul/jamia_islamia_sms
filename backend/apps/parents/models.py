from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from django.conf import settings

class Parent(TimeStampedModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='parent_profile'
    )
    father_name = models.CharField(_('Father Name'), max_length=150, blank=True, default='')
    father_name_urdu = models.CharField(_('Father Name (Urdu)'), max_length=150, blank=True, default='')
    mother_name = models.CharField(_('Mother Name'), max_length=150, blank=True, default='')
    mother_name_urdu = models.CharField(_('Mother Name (Urdu)'), max_length=150, blank=True, default='')
    primary_phone = models.CharField(_('Primary Phone Number'), max_length=50)
    secondary_phone = models.CharField(_('Secondary Phone Number'), max_length=50, blank=True, default='')
    occupation = models.CharField(_('Occupation'), max_length=100, blank=True, default='')
    address = models.TextField(_('Residential Address'), blank=True, default='')
    address_urdu = models.TextField(_('Residential Address (Urdu)'), blank=True, default='')

    class Meta:
        verbose_name = _('Parent')
        verbose_name_plural = _('Parents')

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.primary_phone})"


class ParentStudentRelation(TimeStampedModel):
    class RelationType(models.TextChoices):
        FATHER = 'FATHER', _('Father')
        MOTHER = 'MOTHER', _('Mother')
        GUARDIAN = 'GUARDIAN', _('Guardian')

    parent = models.ForeignKey(Parent, on_delete=models.CASCADE, related_name='children_relations')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='parent_relations')
    relationship_type = models.CharField(
        _('Relationship Type'),
        max_length=20,
        choices=RelationType.choices,
        default=RelationType.FATHER
    )
    is_primary_contact = models.BooleanField(_('Is Primary Contact'), default=True)

    class Meta:
        unique_together = ('parent', 'student')
        verbose_name = _('Parent Student Link')
        verbose_name_plural = _('Parent Student Links')

    def __str__(self):
        return f"{self.parent} -> {self.student.full_name} ({self.get_relationship_type_display()})"
