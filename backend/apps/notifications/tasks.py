import logging
from celery import shared_task
from apps.notifications.services import send_push_to_tokens

logger = logging.getLogger('celery.notifications')

@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def async_dispatch_push_notifications(self, tokens, title, body, data=None):
    """
    Asynchronous Celery task for non-blocking push notification broadcasting.
    """
    try:
        logger.info(f"Async dispatching push notifications to {len(tokens)} devices.")
        send_push_to_tokens(tokens, title, body, data)
        return {'status': 'SUCCESS', 'count': len(tokens)}
    except Exception as exc:
        logger.error(f"Failed async push notification task: {exc}", exc_info=True)
        raise self.retry(exc=exc)
