import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('jamia_islamia')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Celery Beat Periodic Scheduled Tasks
app.conf.beat_schedule = {
    'daily-attendance-summary-evening': {
        'task': 'apps.attendance.tasks.generate_daily_attendance_summary',
        'schedule': crontab(hour=16, minute=0),  # Runs daily at 4:00 PM
        'args': (),
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
