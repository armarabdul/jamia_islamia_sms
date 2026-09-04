from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel

class School(TimeStampedModel):
    """
    Central institution profile for Jamia Islamia, configurable for future expansion.
    """
    name = models.CharField(_('School Name'), max_length=255, default='Jamia Islamia')
    name_urdu = models.CharField(_('School Name (Urdu)'), max_length=255, default='جامعہ اسلامیہ')
    code = models.CharField(_('School Code'), max_length=50, unique=True, default='JI-BHATKAL')
    address = models.TextField(_('Address'), default='Bhatkal, Karnataka, India')
    address_urdu = models.TextField(_('Address (Urdu)'), default='بھٹکل، کرناٹک، بھارت')
    phone = models.CharField(_('Phone'), max_length=50, default='+91 8386 220000')
    email = models.EmailField(_('Email'), default='info@jamiaislamia.edu')
    website = models.URLField(_('Website'), blank=True, default='https://jamiaislamia.edu.in')
    logo = models.ImageField(_('Logo'), upload_to='schools/', blank=True, null=True)
    settings = models.JSONField(_('School Settings'), default=dict, blank=True)

    class Meta:
        verbose_name = _('School')
        verbose_name_plural = _('Schools')

    def __str__(self):
        return f"{self.name} ({self.code})"
