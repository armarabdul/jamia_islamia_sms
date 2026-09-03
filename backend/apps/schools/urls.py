from django.urls import path
from .views import CurrentSchoolView

urlpatterns = [
    path('current/', CurrentSchoolView.as_view(), name='current_school_profile'),
]
