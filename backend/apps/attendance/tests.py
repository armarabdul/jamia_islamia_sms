from datetime import date
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.academic.models import AcademicYear, ClassRoom, Section
from apps.students.models import Student, Enrollment
from apps.attendance.models import AttendanceRecord

User = get_user_model()

class AttendanceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher_user = User.objects.create_user(
            username='teacher_att',
            password='TestPassword123!',
            role=User.Role.TEACHER
        )
        self.student_user = User.objects.create_user(
            username='student_att',
            password='TestPassword123!',
            role=User.Role.STUDENT
        )
        self.acad_year = AcademicYear.objects.create(
            name='2026-2027',
            start_date=date(2026, 6, 1),
            end_date=date(2027, 4, 30),
            is_current=True
        )
        self.classroom = ClassRoom.objects.create(name='Grade 5', numeric_level=5)
        self.section = Section.objects.create(class_room=self.classroom, name='A')
        self.student = Student.objects.create(
            user=self.student_user,
            admission_number='JI-TEST-01',
            first_name='Zaid',
            last_name='Khan'
        )
        self.enrollment = Enrollment.objects.create(
            student=self.student,
            academic_year=self.acad_year,
            class_room=self.classroom,
            section=self.section
        )

    def test_teacher_can_bulk_mark_attendance(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            'username': 'teacher_att',
            'password': 'TestPassword123!'
        })
        token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        payload = {
            'academic_year_id': str(self.acad_year.id),
            'class_room_id': str(self.classroom.id),
            'section_id': str(self.section.id),
            'date': '2026-09-03',
            'period_number': 0,
            'records': [
                {
                    'student_id': str(self.student.id),
                    'status': 'PRESENT',
                    'notes': 'On time'
                }
            ]
        }

        res = self.client.post('/api/v1/attendance/records/bulk-mark/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])

        # Verify DB record
        record = AttendanceRecord.objects.filter(student=self.student, date='2026-09-03').first()
        self.assertIsNotNone(record)
        self.assertEqual(record.status, AttendanceRecord.Status.PRESENT)

    def test_student_cannot_bulk_mark_attendance(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            'username': 'student_att',
            'password': 'TestPassword123!'
        })
        token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        payload = {
            'academic_year_id': str(self.acad_year.id),
            'class_room_id': str(self.classroom.id),
            'section_id': str(self.section.id),
            'date': '2026-09-03',
            'period_number': 0,
            'records': [{'student_id': str(self.student.id), 'status': 'PRESENT'}]
        }

        res = self.client.post('/api/v1/attendance/records/bulk-mark/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
