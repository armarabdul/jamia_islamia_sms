from datetime import time, date
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.academic.models import AcademicYear, ClassRoom, Section, Subject
from apps.students.models import Student, Enrollment
from apps.parents.models import Parent, ParentStudentRelation
from apps.timetable.models import TimetableEntry

User = get_user_model()

class TimetableScheduleAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher_user = User.objects.create_user(
            username='teacher_tt',
            password='TestPassword123!',
            role=User.Role.TEACHER
        )
        self.student_user = User.objects.create_user(
            username='student_tt',
            password='TestPassword123!',
            role=User.Role.STUDENT
        )
        self.student_user2 = User.objects.create_user(
            username='student_tt2',
            password='TestPassword123!',
            role=User.Role.STUDENT
        )
        self.parent_user = User.objects.create_user(
            username='parent_tt',
            password='TestPassword123!',
            role=User.Role.PARENT
        )
        self.other_parent_user = User.objects.create_user(
            username='other_parent_tt',
            password='TestPassword123!',
            role=User.Role.PARENT
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
        self.section2 = Section.objects.create(class_room=self.classroom, name='B')
        self.subject = Subject.objects.create(name='Islamic Studies', code='IS501')

        self.student = Student.objects.create(
            user=self.student_user,
            admission_number='JI-TT-01',
            first_name='Zaid',
            last_name='Khan'
        )
        self.student2 = Student.objects.create(
            user=self.student_user2,
            admission_number='JI-TT-02',
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
            section=self.section2
        )
        ParentStudentRelation.objects.create(
            parent=self.parent_profile,
            student=self.student,
            relationship_type=ParentStudentRelation.RelationType.FATHER
        )

        self.timetable_entry = TimetableEntry.objects.create(
            academic_year=self.acad_year,
            class_room=self.classroom,
            section=self.section,
            subject=self.subject,
            teacher=self.teacher_user,
            day_of_week=0,
            period_number=1,
            start_time=time(8, 30),
            end_time=time(9, 15)
        )

    def test_parent_can_view_own_child_schedule(self):
        self.client.force_authenticate(user=self.parent_user)
        res = self.client.get(f'/api/v1/timetable/my-schedule/?student_id={self.student.id}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data.get('results', res.data)), 1)

    def test_parent_cannot_view_unrelated_child_schedule(self):
        self.client.force_authenticate(user=self.parent_user)
        res = self.client.get(f'/api/v1/timetable/my-schedule/?student_id={self.student2.id}')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_other_parent_cannot_view_first_parents_child_schedule(self):
        self.client.force_authenticate(user=self.other_parent_user)
        res = self.client.get(f'/api/v1/timetable/my-schedule/?student_id={self.student.id}')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_can_view_own_schedule(self):
        self.client.force_authenticate(user=self.student_user)
        res = self.client.get('/api/v1/timetable/my-schedule/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data.get('results', res.data)), 1)

    def test_teacher_can_view_own_schedule(self):
        self.client.force_authenticate(user=self.teacher_user)
        res = self.client.get('/api/v1/timetable/my-schedule/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data.get('results', res.data)), 1)
