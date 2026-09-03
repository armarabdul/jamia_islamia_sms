import logging
from datetime import date
from celery import shared_task
from django.db.models import Count, Q
from apps.academic.models import AcademicYear, Section
from apps.attendance.models import AttendanceRecord
from apps.notifications.models import Notification
from apps.accounts.models import User

logger = logging.getLogger('celery.attendance')

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_daily_attendance_summary(self, target_date_str=None):
    """
    Idempotent daily scheduled Celery task that computes institutional attendance totals,
    generates section summaries, and dispatches administrative alerts.
    """
    try:
        att_date = date.fromisoformat(target_date_str) if target_date_str else date.today()
        logger.info(f"Executing daily attendance summary generation for date: {att_date}")

        current_year = AcademicYear.objects.filter(is_current=True).first()
        if not current_year:
            logger.warning("No active academic year found during attendance summary task.")
            return {'status': 'SKIPPED', 'reason': 'No active academic year'}

        records = AttendanceRecord.objects.filter(
            academic_year=current_year,
            date=att_date,
            period_number=0
        )

        aggregates = records.aggregate(
            total=Count('id'),
            present=Count('id', filter=Q(status=AttendanceRecord.Status.PRESENT)),
            absent=Count('id', filter=Q(status=AttendanceRecord.Status.ABSENT)),
            late=Count('id', filter=Q(status=AttendanceRecord.Status.LATE)),
        )

        total_marked = aggregates['total'] or 0
        total_present = aggregates['present'] or 0
        total_absent = aggregates['absent'] or 0
        total_late = aggregates['late'] or 0

        rate = round((total_present / total_marked * 100), 2) if total_marked > 0 else 0.0

        # Summary message
        summary_title = f"Daily Attendance Summary - {att_date}"
        summary_title_ur = f"روزانہ حاضری کا خلاصہ - {att_date}"
        summary_body = (
            f"Institutional Attendance Report for {att_date}:\n"
            f"Total Students Marked: {total_marked}\n"
            f"Present: {total_present} ({rate}%)\n"
            f"Absent: {total_absent}\n"
            f"Late: {total_late}"
        )

        # Notify administrators (Idempotent: check if notification for this date already exists)
        admins = User.objects.filter(role=User.Role.ADMIN, is_active=True)
        created_count = 0
        for admin in admins:
            exists = Notification.objects.filter(
                recipient=admin,
                notification_type=Notification.NotificationType.ATTENDANCE,
                resource_type='DAILY_SUMMARY',
                resource_id=str(att_date)
            ).exists()

            if not exists:
                Notification.objects.create(
                    recipient=admin,
                    title=summary_title,
                    title_urdu=summary_title_ur,
                    body=summary_body,
                    notification_type=Notification.NotificationType.ATTENDANCE,
                    resource_type='DAILY_SUMMARY',
                    resource_id=str(att_date)
                )
                created_count += 1

        logger.info(
            f"Daily attendance summary for {att_date} completed successfully. "
            f"Marked: {total_marked}, Present: {total_present} ({rate}%), Admin Notifications: {created_count}"
        )

        return {
            'status': 'SUCCESS',
            'date': str(att_date),
            'total_marked': total_marked,
            'attendance_rate': rate,
            'notifications_created': created_count
        }

    except Exception as exc:
        logger.error(f"Error in generate_daily_attendance_summary: {exc}", exc_info=True)
        raise self.retry(exc=exc)
