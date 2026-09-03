import sys
from rest_framework.throttling import AnonRateThrottle

class LoginRateThrottle(AnonRateThrottle):
    """
    Rate limit specifically for /api/v1/auth/login/ to prevent brute-force attacks.
    Limits to 5 attempts per minute in production, bypassed during automated unit tests.
    """
    scope = 'login'
    rate = '5/minute'

    def allow_request(self, request, view):
        # Do not throttle during automated tests runner
        if 'test' in sys.argv:
            return True
        return super().allow_request(request, view)
