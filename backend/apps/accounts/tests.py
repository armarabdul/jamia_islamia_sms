from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from core.validators import validate_secure_file_upload
from apps.accounts.models import IdempotencyRecord, DeviceToken

User = get_user_model()

class AuthenticationAndAuthorizationTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin_test',
            password='TestPassword123!',
            role=User.Role.ADMIN,
            is_staff=True
        )
        self.teacher = User.objects.create_user(
            username='teacher_test',
            password='TestPassword123!',
            role=User.Role.TEACHER
        )
        self.student = User.objects.create_user(
            username='student_test',
            password='TestPassword123!',
            role=User.Role.STUDENT
        )

    def tearDown(self):
        cache.clear()
        super().tearDown()

    def test_jwt_login_returns_token_and_role(self):
        res = self.client.post('/api/v1/auth/login/', {
            'username': 'admin_test',
            'password': 'TestPassword123!'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['role'], 'ADMIN')

    def test_token_refresh_and_rotation(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            'username': 'admin_test',
            'password': 'TestPassword123!'
        })
        refresh_token = login_res.data['refresh']
        
        refresh_res = self.client.post('/api/v1/auth/refresh/', {
            'refresh': refresh_token
        })
        self.assertEqual(refresh_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_res.data)
        self.assertIn('refresh', refresh_res.data)

    def test_student_cannot_access_audit_logs(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            'username': 'student_test',
            'password': 'TestPassword123!'
        })
        token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.get('/api/v1/auth/audit-logs/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_access_audit_logs(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            'username': 'admin_test',
            'password': 'TestPassword123!'
        })
        token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.get('/api/v1/auth/audit-logs/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_device_push_token_registration(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            'username': 'student_test',
            'password': 'TestPassword123!'
        })
        token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.post('/api/v1/auth/device-token/', {
            'token': 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
            'device_type': 'ANDROID',
            'device_name': 'Samsung Galaxy S22'
        })
        self.assertIn(res.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertTrue(DeviceToken.objects.filter(token='ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]').exists())

    def test_file_upload_security_validator(self):
        # Valid PDF file
        valid_pdf = SimpleUploadedFile("assignment.pdf", b"%PDF-1.4 sample content", content_type="application/pdf")
        validate_secure_file_upload(valid_pdf)  # Should not raise

        # Invalid .exe file
        invalid_exe = SimpleUploadedFile("malware.exe", b"MZ executable content", content_type="application/x-msdownload")
        with self.assertRaises(ValidationError):
            validate_secure_file_upload(invalid_exe)

        # File exceeding 10MB
        large_file = SimpleUploadedFile("huge.pdf", b"0" * (11 * 1024 * 1024), content_type="application/pdf")
        with self.assertRaises(ValidationError):
            validate_secure_file_upload(large_file)

    def test_idempotency_middleware_replays_response(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            'username': 'admin_test',
            'password': 'TestPassword123!'
        })
        token = login_res.data['access']
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {token}',
            HTTP_X_IDEMPOTENCY_KEY='test_idempotency_key_12345'
        )

        # First request
        res1 = self.client.post('/api/v1/auth/device-token/', {
            'token': 'ExponentPushToken[key_test_11111]',
            'device_type': 'ANDROID'
        })
        self.assertIn(res1.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

        # Second request with SAME idempotency key
        res2 = self.client.post('/api/v1/auth/device-token/', {
            'token': 'ExponentPushToken[key_test_11111]',
            'device_type': 'ANDROID'
        })
        self.assertIn(res2.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertEqual(res2.headers.get('X-Idempotency-Replayed'), 'true')

    def test_liveness_and_readiness_health_probes(self):
        live_res = self.client.get('/api/health/liveness/')
        self.assertEqual(live_res.status_code, status.HTTP_200_OK)
        self.assertEqual(live_res.json().get('status'), 'HEALTHY')

        ready_res = self.client.get('/api/health/readiness/')
        self.assertIn(ready_res.status_code, [status.HTTP_200_OK, status.HTTP_503_SERVICE_UNAVAILABLE])

    def test_daily_attendance_summary_celery_task(self):
        from apps.attendance.tasks import generate_daily_attendance_summary
        result = generate_daily_attendance_summary(target_date_str='2026-09-03')
        self.assertIn(result['status'], ['SUCCESS', 'SKIPPED'])
