import logging
from django.db import connection
from django.http import JsonResponse
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status

logger = logging.getLogger('core.health')

class LivenessCheckView(APIView):
    """
    Liveness probe indicating whether the Django container process is up and accepting HTTP traffic.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return JsonResponse({
            'status': 'HEALTHY',
            'service': 'jamia-islamia-api',
        }, status=status.HTTP_200_OK)


class ReadinessCheckView(APIView):
    """
    Readiness probe verifying that core dependencies (PostgreSQL database, Redis cache/broker) are operational.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        health_status = {
            'status': 'HEALTHY',
            'service': 'jamia-islamia-api',
            'checks': {
                'database': 'UNKNOWN',
                'cache_redis': 'UNKNOWN',
            }
        }
        all_ok = True

        # 1. Database Connectivity Check
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1;')
                row = cursor.fetchone()
                if row and row[0] == 1:
                    health_status['checks']['database'] = 'HEALTHY'
                else:
                    health_status['checks']['database'] = 'UNHEALTHY'
                    all_ok = False
        except Exception as db_err:
            logger.error(f"Readiness check failed database probe: {db_err}")
            health_status['checks']['database'] = f'FAILED: {str(db_err)}'
            all_ok = False

        # 2. Redis / Cache Connectivity Check
        try:
            import redis
            redis_url = getattr(settings, 'CELERY_BROKER_URL', 'redis://localhost:6379/1')
            r = redis.from_url(redis_url, socket_timeout=2)
            if r.ping():
                health_status['checks']['cache_redis'] = 'HEALTHY'
            else:
                health_status['checks']['cache_redis'] = 'UNHEALTHY'
                all_ok = False
        except Exception as redis_err:
            # If redis is optional in local standalone, mark degraded or healthy based on environment
            if settings.DEBUG:
                health_status['checks']['cache_redis'] = 'DEGRADED_DEV'
            else:
                logger.error(f"Readiness check failed Redis probe: {redis_err}")
                health_status['checks']['cache_redis'] = f'FAILED: {str(redis_err)}'
                all_ok = False

        if not all_ok:
            health_status['status'] = 'UNHEALTHY'
            return JsonResponse(health_status, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return JsonResponse(health_status, status=status.HTTP_200_OK)
