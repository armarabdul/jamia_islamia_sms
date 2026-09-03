from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TimetableEntryViewSet, MyScheduleView

router = DefaultRouter()
router.register(r'entries', TimetableEntryViewSet, basename='timetable-entry')

urlpatterns = [
    path('my-schedule/', MyScheduleView.as_view(), name='my_schedule'),
    path('', include(router.urls)),
]
