from datetime import date
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.academic.models import AcademicYear, ClassRoom, Section
from apps.students.models import Student, Enrollment
from apps.parents.models import Parent, ParentStudentRelation
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
        self.student_user2 = User.objects.create_user(
            username='student_att2',
            password='TestPassword123!',
            role=User.Role.STUDENT
        )
        self.parent_user = User.objects.create_user(
            username='parent_att',
            password='TestPassword123!',
            role=User.Role.PARENT
        )
        self.other_parent_user = User.objects.create_user(
            username='other_parent_att',
            password='TestPassword123!',
            role=User.Role.PARENT
        )
        self.admin_user = User.objects.create_user(
            username='admin_att',
            password='TestPassword123!',
            role=User.Role.ADMIN
        )
        self.parent_profile = Parent.objects.create(
            user=self.parent_user,
            primary_phone='+919900112233'
        )
        self.other_parent_profile = Parent.objects.create(
            user=self.other_parent_user,
            primary_phone='+919900112244'
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
        self.student2 = Student.objects.create(
            user=self.student_user2,
            admission_number='JI-TEST-02',
            first_name='Bilal',
            last_name='Ahmad'
        )
        self.enrollment = Enrollment.objects.create(
            student=self.student,
            academic_year=self.acad_year,
            class_room=self.classroom,
            section=self.section
        )
        self.enrollment2 = Enrollment.objects.create(
            student=self.student2,
            academic_year=self.acad_year,
            class_room=self.classroom,
            section=self.section
        )
        ParentStudentRelation.objects.create(
            parent=self.parent_profile,
            student=self.student,
            relationship_type=ParentStudentRelation.RelationType.FATHER
        )

    def test_teacher_can_bulk_mark_attendance(self):
        self.client.force_authenticate(user=self.teacher_user)
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
        self.client.force_authenticate(user=self.student_user)
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

    def test_parent_can_view_own_child_attendance_summary(self):
        self.client.force_authenticate(user=self.parent_user)
        res = self.client.get(f'/api/v1/attendance/student-summary/{self.student.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(str(res.data['student_id']), str(self.student.id))

    def test_parent_cannot_view_unrelated_child_attendance_summary(self):
        self.client.force_authenticate(user=self.parent_user)
        res = self.client.get(f'/api/v1/attendance/student-summary/{self.student2.id}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_other_parent_cannot_view_first_parents_child(self):
        self.client.force_authenticate(user=self.other_parent_user)
        res = self.client.get(f'/api/v1/attendance/student-summary/{self.student.id}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_can_view_own_attendance_summary(self):
        self.client.force_authenticate(user=self.student_user)
        res = self.client.get(f'/api/v1/attendance/student-summary/{self.student.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_student_cannot_view_other_student_attendance_summary(self):
        self.client.force_authenticate(user=self.student_user)
        res = self.client.get(f'/api/v1/attendance/student-summary/{self.student2.id}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_and_admin_can_view_any_student_summary(self):
        self.client.force_authenticate(user=self.teacher_user)
        res_teacher = self.client.get(f'/api/v1/attendance/student-summary/{self.student.id}/')
        self.assertEqual(res_teacher.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.get(f'/api/v1/attendance/student-summary/{self.student.id}/')
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
