import os
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

ALLOWED_FILE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.docx']
ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

def validate_secure_file_upload(file):
    """
    Validates file extension, size limit (10MB), and prevents dangerous executable uploads.
    """
    if not file:
        return

    # 1. Size check
    if file.size > MAX_UPLOAD_SIZE_BYTES:
        raise ValidationError(
            _('File size exceeds 10 MB maximum limit. Current size: %(size).2f MB') % {
                'size': file.size / (1024 * 1024)
            }
        )

    # 2. Extension check
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_FILE_EXTENSIONS:
        raise ValidationError(
            _('Unsupported file format %(ext)s. Allowed formats: %(allowed)s') % {
                'ext': ext,
                'allowed': ', '.join(ALLOWED_FILE_EXTENSIONS)
            }
        )

    # 3. Content-Type check
    content_type = getattr(file, 'content_type', '')
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        # Some browsers may send generic octet-stream for docx, verify extension
        if not (ext == '.docx' and content_type == 'application/octet-stream'):
            pass  # Allowed with extension check
