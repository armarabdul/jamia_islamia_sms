import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('audit')

class AuditMiddleware(MiddlewareMixin):
    """
    Middleware that captures client IP and attaches it to the request.
    """
    def process_request(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        request.client_ip = ip

def log_audit_action(user, action, resource_type, resource_id=None, changes=None, ip_address=None):
    """
    Creates an AuditLog record asynchronously or synchronously.
    """
    try:
        from apps.accounts.models import AuditLog
        AuditLog.objects.create(
            user=user if user and user.is_authenticated else None,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            changes=changes or {},
            ip_address=ip_address or ''
        )
    except Exception as e:
        logger.error(f"Failed to write audit log: {e}")
