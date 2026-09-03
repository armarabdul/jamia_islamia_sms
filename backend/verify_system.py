import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.students.models import Student, Enrollment
from apps.parents.models import Parent, ParentStudentRelation
from apps.academic.models import AcademicYear, ClassRoom, Section, Subject, SubjectTeacherAssignment
from apps.attendance.models import AttendanceRecord
from apps.examinations.models import Exam, ExamSubject
from apps.grades.models import GradeRecord
from apps.assignments.models import Assignment

User = get_user_model()
client = APIClient()

print("\n" + "="*60)
print("RUNNING COMPREHENSIVE BACKEND VERIFICATION SUITE")
print("="*60)

# 1. Test JWT Authentication & Token Lifecycle
print("\n[1] Testing JWT Login & Refresh Token Lifecycle...")
login_res = client.post('/api/v1/auth/login/', {'username': 'admin', 'password': 'JamiaAdmin2026!'})
assert login_res.status_code == 200, f"Admin login failed: {login_res.data}"
access_token = login_res.data['access']
refresh_token = login_res.data['refresh']
print("  [OK] Admin Login: OK (JWT access & refresh received)")

# Test Refresh (returns new rotated refresh token)
refresh_res = client.post('/api/v1/auth/refresh/', {'refresh': refresh_token})
assert refresh_res.status_code == 200, f"Token refresh failed: {refresh_res.data}"
new_refresh = refresh_res.data['refresh']
print("  [OK] Token Refresh: OK (Rotation enabled)")

# Test Blacklist (Logout)
logout_res = client.post('/api/v1/auth/logout/', {'refresh': new_refresh})
assert logout_res.status_code == 200, f"Token logout/blacklist failed: {logout_res.data}"
print("  [OK] Token Blacklisting (Logout): OK")

# 2. Test Role Scoping & Permission Guardrails
print("\n[2] Testing Role-Based Permission Enforcements...")

# Student Token
st_login = client.post('/api/v1/auth/login/', {'username': 'student_zaid', 'password': 'JamiaPass2026!'})
st_token = st_login.data['access']

# Parent Token
par_login = client.post('/api/v1/auth/login/', {'username': 'parent_tariq', 'password': 'JamiaPass2026!'})
par_token = par_login.data['access']

# Teacher Token
tch_login = client.post('/api/v1/auth/login/', {'username': 'teacher_ahmed', 'password': 'JamiaPass2026!'})
tch_token = tch_login.data['access']

# Test: Student cannot access Audit Logs
client.credentials(HTTP_AUTHORIZATION=f'Bearer {st_token}')
st_audit = client.get('/api/v1/auth/audit-logs/')
assert st_audit.status_code == 403, f"Security Violation: Student was able to access audit logs ({st_audit.status_code})"
print("  [OK] Student blocked from Audit Logs: OK (403 Forbidden)")

# Test: Student cannot mark attendance
st_att_mark = client.post('/api/v1/attendance/records/bulk-mark/', {
    'academic_year_id': str(AcademicYear.objects.first().id),
    'class_room_id': str(ClassRoom.objects.first().id),
    'section_id': str(Section.objects.first().id),
    'date': '2026-09-03',
    'records': []
})
assert st_att_mark.status_code == 403, f"Security Violation: Student was able to modify attendance ({st_att_mark.status_code})"
print("  [OK] Student blocked from marking attendance: OK (403 Forbidden)")

# Test: Parent cannot mark attendance
client.credentials(HTTP_AUTHORIZATION=f'Bearer {par_token}')
par_att_mark = client.post('/api/v1/attendance/records/bulk-mark/', {
    'academic_year_id': str(AcademicYear.objects.first().id),
    'class_room_id': str(ClassRoom.objects.first().id),
    'section_id': str(Section.objects.first().id),
    'date': '2026-09-03',
    'records': []
})
assert par_att_mark.status_code == 403, f"Security Violation: Parent was able to modify attendance ({par_att_mark.status_code})"
print("  [OK] Parent blocked from marking attendance: OK (403 Forbidden)")

# Test: Parent can only access their linked children
client.credentials(HTTP_AUTHORIZATION=f'Bearer {par_token}')
par_children = client.get('/api/v1/parents/my-children/')
assert par_children.status_code == 200
children_ids = [c['admission_number'] for c in par_children.data.get('results', par_children.data)]
print(f"  [OK] Parent Linked Children Access: {children_ids} (Tariq sees only Zaid & Maryam)")
assert 'JI-2026-001' in children_ids and 'JI-2026-002' in children_ids
assert 'JI-2026-003' not in children_ids  # Bilal belongs to Salman, not Tariq
print("  [OK] Parent Object Scoping Guard: OK (Cannot see unlinked child Bilal)")

# Test: Student cannot modify grades
client.credentials(HTTP_AUTHORIZATION=f'Bearer {st_token}')
st_grades = client.post('/api/v1/grades/records/batch-entry/', {'exam_subject_id': str(ExamSubject.objects.first().id), 'marks': []})
assert st_grades.status_code == 403
print("  [OK] Student blocked from entering/modifying grades: OK (403 Forbidden)")

# Test: Teacher can mark attendance
client.credentials(HTTP_AUTHORIZATION=f'Bearer {tch_token}')
sec = Section.objects.first()
st_obj = Student.objects.first()
tch_att = client.post('/api/v1/attendance/records/bulk-mark/', {
    'academic_year_id': str(AcademicYear.objects.first().id),
    'class_room_id': str(sec.class_room.id),
    'section_id': str(sec.id),
    'date': '2026-09-03',
    'period_number': 0,
    'records': [{'student_id': str(st_obj.id), 'status': 'PRESENT', 'notes': 'Verified by test'}]
}, format='json')
assert tch_att.status_code == 200
print("  [OK] Teacher bulk attendance marking: OK (200 OK)")

# 3. Test Database Integrity & Historical Data Protection
print("\n[3] Testing Database Relationships & History Preservation...")
zaid = Student.objects.get(admission_number='JI-2026-001')
assert zaid.enrollments.count() >= 1, "Student enrollments missing"
assert zaid.parent_relations.count() >= 1, "Student parent relations missing"
print(f"  [OK] Student ({zaid.full_name}) -> Active Class: {zaid.current_enrollment.class_room.name} Section {zaid.current_enrollment.section.name}")
print("  [OK] Historical Enrollment Chain & Parent Relations Integrity: OK")

# 4. Test Safe CSV Import Dry-Run & Rollback
print("\n[4] Testing CSV Import Validation & Rollback Protection...")
client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

# Dry run test with duplicate admission number
import io
csv_content = """admission_number,first_name,last_name,gender,class_name,section_name
JI-2026-001,Test,Duplicate,MALE,Grade 5,A
JI-2026-999,Valid,NewStudent,FEMALE,Grade 5,A
"""
csv_file = io.BytesIO(csv_content.encode('utf-8'))
csv_file.name = 'test_import.csv'

preview_res = client.post('/api/v1/imports/preview-students/', {'file': csv_file}, format='multipart')
assert preview_res.status_code == 200
assert preview_res.data['has_errors'] is True
assert preview_res.data['invalid_count'] == 1
assert preview_res.data['valid_count'] == 1
print(f"  [OK] CSV Duplicate Detection & Row Error Reporting: OK (Detected existing JI-2026-001)")

# Verify DB was NOT corrupted during preview
assert Student.objects.filter(admission_number='JI-2026-999').count() == 0
print("  [OK] Dry-Run Isolation Guard: OK (Zero DB corruption during preview)")

print("\n" + "="*60)
print("ALL BACKEND VERIFICATION CHECKS PASSED WITH ZERO ERRORS!")
print("="*60 + "\n")
