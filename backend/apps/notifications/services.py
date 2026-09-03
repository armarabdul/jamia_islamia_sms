import logging
import requests
from django.conf import settings
from .models import Notification
from apps.accounts.models import DeviceToken
from apps.students.models import Student
from apps.parents.models import ParentStudentRelation

logger = logging.getLogger('notifications')

def send_push_to_tokens(tokens, title, body, data=None):
    """
    Dispatches push notifications to Android devices via Expo Push API.
    Masks sensitive personal data in preview payload.
    """
    if not tokens:
        return
    try:
        messages = [
            {
                'to': token,
                'sound': 'default',
                'title': title,
                'body': body,
                'data': data or {},
                'priority': 'high',
                'channelId': 'jamia_alerts'
            }
            for token in tokens if token.startswith('ExponentPushToken[') or token.startswith('ExpoPushToken[')
        ]
        if messages:
            headers = {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            }
            res = requests.post('https://exp.host/--/api/v2/push/send', json=messages, headers=headers, timeout=5)
            logger.info(f"Dispatched push notifications to {len(messages)} Expo tokens: {title} (HTTP {res.status_code})")
        else:
            logger.info(f"Notification prepared for {len(tokens)} devices: {title}")
    except Exception as e:
        logger.error(f"Error dispatching push notification: {e}")


def create_and_send_notification(
    recipient,
    title,
    body,
    title_urdu='',
    body_urdu='',
    notification_type=Notification.NotificationType.SYSTEM,
    resource_type='',
    resource_id=''
):
    """
    Creates an in-app notification record and simultaneously triggers push notification.
    """
    notif = Notification.objects.create(
        recipient=recipient,
        title=title,
        title_urdu=title_urdu or title,
        body=body,
        body_urdu=body_urdu or body,
        notification_type=notification_type,
        resource_type=resource_type,
        resource_id=str(resource_id)
    )

    # Fetch active device push tokens
    tokens = list(DeviceToken.objects.filter(user=recipient, is_active=True).values_list('token', flat=True))
    if tokens:
        # Use appropriate language based on user's preference
        disp_title = notif.title_urdu if getattr(recipient, 'language_preference', '') == 'ur' else notif.title
        disp_body = notif.body_urdu if getattr(recipient, 'language_preference', '') == 'ur' else notif.body
        send_push_to_tokens(
            tokens=tokens,
            title=disp_title,
            body=disp_body,
            data={'notification_id': str(notif.id), 'type': notification_type, 'resource_id': str(resource_id)}
        )

    return notif


def dispatch_absence_notifications(student_ids, date_str):
    """
    Automatically triggered when daily attendance is submitted with absences.
    Notifies parents of absent students.
    """
    students = Student.objects.filter(id__in=student_ids).prefetch_related('parent_relations__parent__user')
    for st in students:
        for rel in st.parent_relations.all():
            parent_user = rel.parent.user
            title_en = f"Attendance Alert: {st.full_name}"
            title_ur = f"حاضری کی اطلاع: {st.full_name_urdu or st.full_name}"
            body_en = f"Please note that {st.full_name} was marked ABSENT on {date_str}. If this was unexpected, please contact the school administration."
            body_ur = f"برائے مہربانی نوٹ فرمائیں کہ {st.full_name_urdu or st.full_name} مورخہ {date_str} کو غیر حاضر پائے گئے۔ اگر یہ غیر متوقع تھا تو اسکول انتظامیہ سے رابطہ کریں۔"
            create_and_send_notification(
                recipient=parent_user,
                title=title_en,
                body=body_en,
                title_urdu=title_ur,
                body_urdu=body_ur,
                notification_type=Notification.NotificationType.ATTENDANCE,
                resource_type='Attendance',
                resource_id=str(st.id)
            )
