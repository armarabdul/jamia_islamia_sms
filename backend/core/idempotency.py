import json
import hashlib
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from apps.accounts.models import IdempotencyRecord
from rest_framework_simplejwt.authentication import JWTAuthentication

class IdempotencyMiddleware(MiddlewareMixin):
    """
    Middleware that intercepts POST/PUT/PATCH requests bearing an X-Idempotency-Key header.
    If an idempotency key was previously processed for this user, returns the exact cached JSON response,
    preventing duplicate mutations from mobile offline queue retries.
    """
    def _get_header(self, request, name):
        meta_key = f"HTTP_{name.upper().replace('-', '_')}"
        return request.META.get(meta_key) or getattr(request, 'headers', {}).get(name)

    def _get_authenticated_user(self, request):
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            return user
        try:
            auth_header = self._get_header(request, 'Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                raw_token = auth_header.split(' ')[1]
                validated_token = JWTAuthentication().get_validated_token(raw_token)
                return JWTAuthentication().get_user(validated_token)
        except Exception:
            pass
        return None

    def process_request(self, request):
        if request.method not in ['POST', 'PUT', 'PATCH']:
            return None

        idempotency_key = self._get_header(request, 'X-Idempotency-Key')
        if not idempotency_key:
            return None

        user_obj = self._get_authenticated_user(request)

        query = {'key': idempotency_key}
        if user_obj:
            query['user'] = user_obj

        existing = IdempotencyRecord.objects.filter(**query).first()
        if existing:
            response = JsonResponse(existing.response_body, status=existing.status_code, safe=False)
            response['X-Idempotency-Replayed'] = 'true'
            return response

        return None

    def process_response(self, request, response):
        if request.method not in ['POST', 'PUT', 'PATCH']:
            return response

        idempotency_key = self._get_header(request, 'X-Idempotency-Key')
        if not idempotency_key:
            return response

        if getattr(response, 'headers', {}).get('X-Idempotency-Replayed') == 'true' or response.get('X-Idempotency-Replayed') == 'true':
            return response

        if 200 <= response.status_code < 300:
            user_obj = self._get_authenticated_user(request)
            
            # Extract response payload safely
            if hasattr(response, 'data') and response.data is not None:
                data = response.data
            else:
                try:
                    data = json.loads(response.content.decode('utf-8'))
                except Exception:
                    data = {'raw_response': 'ok'}

            try:
                req_hash = hashlib.sha256(request.path.encode('utf-8')).hexdigest()
                IdempotencyRecord.objects.update_or_create(
                    key=idempotency_key,
                    user=user_obj,
                    defaults={
                        'request_path': request.path,
                        'request_method': request.method,
                        'request_hash': req_hash,
                        'status_code': response.status_code,
                        'response_body': data,
                    }
                )
            except Exception:
                pass

        return response
