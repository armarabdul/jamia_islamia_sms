from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from core.health import LivenessCheckView, ReadinessCheckView

api_v1_patterns = [
    path('auth/', include('apps.accounts.urls')),
    path('schools/', include('apps.schools.urls')),
    path('academic/', include('apps.academic.urls')),
    path('students/', include('apps.students.urls')),
    path('parents/', include('apps.parents.urls')),
    path('staff/', include('apps.staff.urls')),
    path('attendance/', include('apps.attendance.urls')),
    path('exams/', include('apps.examinations.urls')),
    path('grades/', include('apps.grades.urls')),
    path('timetable/', include('apps.timetable.urls')),
    path('assignments/', include('apps.assignments.urls')),
    path('announcements/', include('apps.announcements.urls')),
    path('messages/', include('apps.messaging.urls')),
    path('notifications/', include('apps.notifications.urls')),
    path('calendar/', include('apps.calendar.urls')),
    path('library/', include('apps.library.urls')),
    path('reports/', include('apps.reports.urls')),
    path('imports/', include('apps.imports.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_v1_patterns)),
    
    # Health Probes for Docker / Kubernetes / Nginx
    path('api/health/liveness/', LivenessCheckView.as_view(), name='health-liveness'),
    path('api/health/readiness/', ReadinessCheckView.as_view(), name='health-readiness'),

    # OpenAPI 3 Schema & Swagger UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
