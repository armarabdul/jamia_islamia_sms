from rest_framework import generics, permissions
from .models import School
from .serializers import SchoolSerializer
from core.permissions import IsAdminUserRole

class CurrentSchoolView(generics.RetrieveUpdateAPIView):
    """
    Returns or updates the institution configuration.
    Read-only for all authenticated users; update restricted to ADMIN.
    """
    serializer_class = SchoolSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsAdminUserRole()]

    def get_object(self):
        school, _ = School.objects.get_or_create(
            code='JI-BHATKAL',
            defaults={
                'name': 'Jamia Islamia',
                'name_urdu': 'جامعہ اسلامیہ',
                'address': 'Nawayath Colony, Bhatkal, Karnataka, India',
                'address_urdu': 'نوایت کالونی، بھٹکل، کرناٹک، بھارت',
                'email': 'info@jamiaislamia.edu',
                'phone': '+91 8386 220000',
                'settings': {
                    'academic_start_month': 6,
                    'working_days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'],
                    'weekend_day': 'Friday',
                    'default_language': 'en',
                    'available_languages': ['en', 'ur']
                }
            }
        )
        return school
