from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.schools.models import School
from apps.academic.models import AcademicYear, ClassRoom, Section, Subject, SubjectTeacherAssignment
from apps.students.models import Student, Enrollment
from apps.parents.models import Parent, ParentStudentRelation
from apps.staff.models import Staff
from apps.attendance.models import AttendanceRecord
from apps.examinations.models import Exam, ExamSubject
from apps.grades.models import GradeScale, GradeRecord
from apps.timetable.models import TimetableEntry
from apps.assignments.models import Assignment, Submission
from apps.announcements.models import Announcement
from apps.library.models import Book, BookCopy
from apps.calendar.models import CalendarEvent

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds complete demonstration data for Jamia Islamia (Bhatkal) School Management System'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Beginning Jamia Islamia database seed...'))

        # 1. School Profile
        school, _ = School.objects.get_or_create(
            code='JI-BHATKAL',
            defaults={
                'name': 'Jamia Islamia',
                'name_urdu': 'جامعہ اسلامیہ',
                'address': 'Bhatkal, Karnataka, India',
                'address_urdu': 'بھٹکل، کرناٹک، بھارت',
                'phone': '+91 8386 220000',
                'email': 'info@jamiaislamia.edu',
                'website': 'https://jamiaislamia.edu.in',
                'settings': {
                    'working_days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'],
                    'weekend_day': 'Friday',
                    'default_language': 'en',
                    'available_languages': ['en', 'ur']
                }
            }
        )
        self.stdout.write(self.style.SUCCESS(f'[OK] Seeded School: {school.name}'))

        # 2. Academic Year
        acad_year, _ = AcademicYear.objects.get_or_create(
            name='2026-2027',
            defaults={
                'name_urdu': '۲۰۲۶-۲۰۲۷ء',
                'start_date': date(2026, 6, 1),
                'end_date': date(2027, 4, 30),
                'is_current': True
            }
        )

        # 3. Grade Scales
        scales_data = [
            ('A+', 90.0, 100.0, 4.0, 'Outstanding', 'بہترین'),
            ('A', 80.0, 89.99, 3.7, 'Excellent', 'بہت خوب'),
            ('B', 70.0, 79.99, 3.0, 'Very Good', 'عمدہ'),
            ('C', 60.0, 69.99, 2.0, 'Good', 'اچھا'),
            ('D', 40.0, 59.99, 1.0, 'Pass', 'کامیاب'),
            ('F', 0.0, 39.99, 0.0, 'Needs Improvement', 'مزید محنت درکار'),
        ]
        for letter, min_p, max_p, gp, rem_en, rem_ur in scales_data:
            GradeScale.objects.get_or_create(
                grade_letter=letter,
                defaults={
                    'min_percentage': min_p,
                    'max_percentage': max_p,
                    'grade_point': gp,
                    'remarks': rem_en,
                    'remarks_urdu': rem_ur
                }
            )

        # 4. Classes & Sections
        classes_info = [
            ('Grade 1', 'درجہ اول', 1),
            ('Grade 2', 'درجہ دوم', 2),
            ('Grade 3', 'درجہ سوم', 3),
            ('Grade 4', 'درجہ چہارم', 4),
            ('Grade 5', 'درجہ پنجم', 5),
            ('Grade 6', 'درجہ ششم', 6),
            ('Grade 7', 'درجہ ہفتم', 7),
            ('Grade 8', 'درجہ ہشتم', 8),
            ('Grade 9', 'درجہ نہم', 9),
            ('Grade 10', 'درجہ دہم', 10),
        ]
        created_classes = {}
        created_sections = {}
        for c_name, c_urdu, level in classes_info:
            cls_obj, _ = ClassRoom.objects.get_or_create(
                name=c_name,
                defaults={'name_urdu': c_urdu, 'numeric_level': level, 'school': school}
            )
            created_classes[c_name] = cls_obj
            for s_name, s_urdu in [('A', 'الف'), ('B', 'ب')]:
                sec_obj, _ = Section.objects.get_or_create(
                    class_room=cls_obj,
                    name=s_name,
                    defaults={'name_urdu': s_urdu, 'capacity': 40}
                )
                created_sections[f"{c_name}-{s_name}"] = sec_obj

        # 5. Subjects
        subjects_data = [
            ('Islamic Studies', 'اسلامیات', 'ISL-101', False, 5),
            ('Arabic Language', 'عربی زبان', 'ARB-101', False, 5),
            ('Quran & Tajweed', 'قرآن و تجوید', 'QUR-101', False, 4),
            ('Urdu', 'اردو', 'URD-101', False, 4),
            ('English', 'انگریزی', 'ENG-101', False, 4),
            ('Mathematics', 'ریاضی', 'MTH-101', False, 5),
            ('General Science', 'سائنس', 'SCI-101', False, 4),
            ('Social Studies', 'معاشرتی علوم', 'SST-101', False, 3),
        ]
        created_subjects = {}
        for s_name, s_urdu, code, elec, credits in subjects_data:
            subj, _ = Subject.objects.get_or_create(
                code=code,
                defaults={'name': s_name, 'name_urdu': s_urdu, 'is_elective': elec, 'credit_hours': credits}
            )
            created_subjects[code] = subj

        # 6. Users & Roles
        # Admin
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@jamiaislamia.edu',
                'first_name': 'Maulana',
                'last_name': 'Ibrahim',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'language_preference': 'en'
            }
        )
        admin_user.set_password('JamiaAdmin2026!')
        admin_user.save()

        # Teachers
        teachers_data = [
            ('teacher_ahmed', 'Maulana', 'Ahmed Nadvi', 'مولانا احمد ندوی', 'TEACH-001', 'Islamic Studies / Arabic', 'M.A. Islamic Studies (Nadwa)', 'en'),
            ('teacher_fatima', 'Fatima', 'Sultana', 'فاطمہ سلطانہ', 'TEACH-002', 'English Literature', 'M.A. English, B.Ed', 'en'),
            ('teacher_imran', 'Mohammed', 'Imran Kola', 'محمد عمران کولا', 'TEACH-003', 'Mathematics & Science', 'M.Sc. Mathematics', 'ur'),
        ]
        created_teachers = []
        for uname, fn, ln, fn_ur, code, dept_role, qual, lang in teachers_data:
            t_user, _ = User.objects.get_or_create(
                username=uname,
                defaults={
                    'email': f'{uname}@jamiaislamia.edu',
                    'first_name': fn,
                    'last_name': ln,
                    'role': User.Role.TEACHER,
                    'language_preference': lang
                }
            )
            t_user.set_password('JamiaPass2026!')
            t_user.save()

            Staff.objects.get_or_create(
                user=t_user,
                defaults={
                    'employee_code': code,
                    'qualification': qual,
                    'designation': 'Senior Teacher',
                    'department': Staff.Department.ACADEMIC,
                    'is_teaching': True
                }
            )
            created_teachers.append(t_user)

        # Assign class teacher and subjects
        sec_5a = created_sections.get('Grade 5-A')
        sec_5a.class_teacher = created_teachers[0]
        sec_5a.save()

        SubjectTeacherAssignment.objects.get_or_create(
            academic_year=acad_year,
            class_room=created_classes['Grade 5'],
            section=sec_5a,
            subject=created_subjects['ISL-101'],
            teacher=created_teachers[0]
        )
        SubjectTeacherAssignment.objects.get_or_create(
            academic_year=acad_year,
            class_room=created_classes['Grade 5'],
            section=sec_5a,
            subject=created_subjects['MTH-101'],
            teacher=created_teachers[2]
        )

        # Parents
        parents_data = [
            ('parent_tariq', 'Tariq', 'Siddiqui', 'طارق صدیقی', 'Amina Siddiqui', '+91 98450 11111', 'Business', 'Main Road, Bhatkal'),
            ('parent_salman', 'Salman', 'Ruknuddin', 'سلمان رکن الدین', 'Zainab Ruknuddin', '+91 98450 22222', 'Architect', 'Main Road, Bhatkal'),
        ]
        created_parents = []
        for uname, fn, ln, f_ur, m_name, phone, occ, addr in parents_data:
            p_user, _ = User.objects.get_or_create(
                username=uname,
                defaults={
                    'email': f'{uname}@gmail.com',
                    'first_name': fn,
                    'last_name': ln,
                    'role': User.Role.PARENT,
                    'phone_number': phone,
                    'language_preference': 'ur' if 'tariq' in uname else 'en'
                }
            )
            p_user.set_password('JamiaPass2026!')
            p_user.save()

            p_profile, _ = Parent.objects.get_or_create(
                user=p_user,
                defaults={
                    'father_name': f"{fn} {ln}",
                    'father_name_urdu': f_ur,
                    'mother_name': m_name,
                    'primary_phone': phone,
                    'occupation': occ,
                    'address': addr
                }
            )
            created_parents.append(p_profile)

        # Students
        students_data = [
            ('student_zaid', 'Zaid', 'Siddiqui', 'زید', 'صدیقی', 'JI-2026-001', 'MALE', date(2015, 4, 12), 'Grade 5', 'A', '101', created_parents[0]),
            ('student_maryam', 'Maryam', 'Siddiqui', 'مریم', 'صدیقی', 'JI-2026-002', 'FEMALE', date(2017, 8, 20), 'Grade 3', 'A', '102', created_parents[0]),
            ('student_bilal', 'Bilal', 'Ruknuddin', 'بلال', 'رکن الدین', 'JI-2026-003', 'MALE', date(2015, 11, 5), 'Grade 5', 'A', '103', created_parents[1]),
        ]
        created_students = []
        for uname, fn, ln, fn_ur, ln_ur, adm_no, gdr, dob, cls_n, sec_n, roll_no, par_prof in students_data:
            s_user, _ = User.objects.get_or_create(
                username=uname,
                defaults={
                    'email': f'{uname}@jamiaislamia.edu',
                    'first_name': fn,
                    'last_name': ln,
                    'role': User.Role.STUDENT,
                    'language_preference': 'en'
                }
            )
            s_user.set_password('JamiaPass2026!')
            s_user.save()

            st_obj, _ = Student.objects.get_or_create(
                admission_number=adm_no,
                defaults={
                    'user': s_user,
                    'first_name': fn,
                    'last_name': ln,
                    'first_name_urdu': fn_ur,
                    'last_name_urdu': ln_ur,
                    'gender': gdr,
                    'date_of_birth': dob,
                    'blood_group': 'B+',
                    'emergency_contact_name': par_prof.father_name,
                    'emergency_contact_phone': par_prof.primary_phone,
                    'address': par_prof.address,
                    'status': Student.Status.ACTIVE
                }
            )

            # Link with Parent
            ParentStudentRelation.objects.get_or_create(
                parent=par_prof,
                student=st_obj,
                defaults={'relationship_type': ParentStudentRelation.RelationType.FATHER, 'is_primary_contact': True}
            )

            # Enrollment
            sec_target = created_sections.get(f"{cls_n}-{sec_n}")
            Enrollment.objects.get_or_create(
                student=st_obj,
                academic_year=acad_year,
                defaults={
                    'class_room': created_classes[cls_n],
                    'section': sec_target,
                    'roll_number': roll_no,
                    'is_active': True
                }
            )
            created_students.append(st_obj)

        # 7. Timetable Slots
        days_schedule = [
            (0, 1, '08:30:00', '09:15:00', created_subjects['ISL-101'], created_teachers[0], 'Room 101'),
            (0, 2, '09:15:00', '10:00:00', created_subjects['ARB-101'], created_teachers[0], 'Room 101'),
            (0, 3, '10:15:00', '11:00:00', created_subjects['MTH-101'], created_teachers[2], 'Room 101'),
            (0, 4, '11:00:00', '11:45:00', created_subjects['ENG-101'], created_teachers[1], 'Room 101'),
        ]
        for d_num, p_num, st_t, en_t, subj, tch, room in days_schedule:
            TimetableEntry.objects.get_or_create(
                academic_year=acad_year,
                class_room=created_classes['Grade 5'],
                section=sec_5a,
                day_of_week=d_num,
                period_number=p_num,
                defaults={'subject': subj, 'teacher': tch, 'start_time': st_t, 'end_time': en_t, 'room_number': room}
            )

        # 8. Sample Attendance (Last 5 days)
        today = date.today()
        for offset in range(5):
            att_date = today - timedelta(days=offset)
            for idx, st in enumerate(created_students):
                st_status = AttendanceRecord.Status.PRESENT if (idx + offset) % 4 != 0 else AttendanceRecord.Status.ABSENT
                AttendanceRecord.objects.get_or_create(
                    student=st,
                    date=att_date,
                    period_number=0,
                    defaults={
                        'academic_year': acad_year,
                        'class_room': created_classes['Grade 5' if 'zaid' in st.first_name.lower() or 'bilal' in st.first_name.lower() else 'Grade 3'],
                        'section': sec_5a,
                        'status': st_status,
                        'marked_by': created_teachers[0]
                    }
                )

        # 9. Sample Exam & Grades
        mid_exam, _ = Exam.objects.get_or_create(
            name='Mid-Term Examination 2026',
            defaults={
                'name_urdu': 'ششماہی امتحانات ۲۰۲۶ء',
                'academic_year': acad_year,
                'start_date': date(2026, 9, 10),
                'end_date': date(2026, 9, 20),
                'is_published': True,
                'description': 'First semester mid-term comprehensive assessment.'
            }
        )

        ex_subj_isl, _ = ExamSubject.objects.get_or_create(
            exam=mid_exam,
            class_room=created_classes['Grade 5'],
            subject=created_subjects['ISL-101'],
            defaults={'exam_date': date(2026, 9, 10), 'total_marks': 100.00, 'passing_marks': 40.00}
        )
        ex_subj_mth, _ = ExamSubject.objects.get_or_create(
            exam=mid_exam,
            class_room=created_classes['Grade 5'],
            subject=created_subjects['MTH-101'],
            defaults={'exam_date': date(2026, 9, 12), 'total_marks': 100.00, 'passing_marks': 40.00}
        )

        # Grades for Zaid & Bilal
        GradeRecord.objects.get_or_create(
            exam_subject=ex_subj_isl,
            student=created_students[0],
            defaults={'marks_obtained': 94.00, 'remarks': 'Excellent recitation & understanding', 'entered_by': created_teachers[0]}
        )
        GradeRecord.objects.get_or_create(
            exam_subject=ex_subj_mth,
            student=created_students[0],
            defaults={'marks_obtained': 88.50, 'remarks': 'Good problem solving', 'entered_by': created_teachers[2]}
        )
        GradeRecord.objects.get_or_create(
            exam_subject=ex_subj_isl,
            student=created_students[2],
            defaults={'marks_obtained': 85.00, 'remarks': 'Very good work', 'entered_by': created_teachers[0]}
        )
        GradeRecord.objects.get_or_create(
            exam_subject=ex_subj_mth,
            student=created_students[2],
            defaults={'marks_obtained': 79.00, 'remarks': 'Consistent effort', 'entered_by': created_teachers[2]}
        )

        # 10. Sample Homework
        hw1, _ = Assignment.objects.get_or_create(
            title='Islamic Studies: Surah Al-Mulk Memorization',
            defaults={
                'title_urdu': 'اسلامیات: سورۃ الملک حفظ و تجوید',
                'description': 'Memorize first 10 verses of Surah Al-Mulk with proper tajweed rules.',
                'subject': created_subjects['ISL-101'],
                'class_room': created_classes['Grade 5'],
                'section': sec_5a,
                'teacher': created_teachers[0],
                'due_date': today + timedelta(days=3),
                'max_marks': 10.00
            }
        )

        Submission.objects.get_or_create(
            assignment=hw1,
            student=created_students[0],
            defaults={
                'submission_text': 'Completed memorization of verses 1 to 10 with audio recitation practice.',
                'status': Submission.Status.GRADED,
                'marks_obtained': 10.00,
                'feedback': 'Mashallah, excellent pronunciation and tajweed rules applied.',
                'graded_by': created_teachers[0]
            }
        )

        # 11. Sample Announcement
        Announcement.objects.get_or_create(
            title='Annual Seerat-un-Nabi Gathering',
            defaults={
                'title_urdu': 'سالانہ جلسہ سیرت النبی ﷺ',
                'content': 'We are pleased to invite all respected parents and students to the Annual Seerat Gathering at Jamia Islamia Auditorium.',
                'content_urdu': 'جامعہ اسلامیہ کے تمام معزز سرپرست حضرات اور طلبہ کرام کو سالانہ جلسہ سیرت النبی ﷺ میں شرکت کی پرخلوص دعوت دی جاتی ہے۔',
                'audience': Announcement.Audience.ALL,
                'author': admin_user,
                'is_pinned': True
            }
        )

        # 12. Sample Library Books
        book1, _ = Book.objects.get_or_create(
            title='Riyad as-Salihin (رياض الصالحين)',
            defaults={
                'title_urdu': 'ریاض الصالحین',
                'author': 'Imam Al-Nawawi',
                'author_urdu': 'امام نووی رحمۃ اللہ علیہ',
                'isbn': '978-0-12345-001',
                'category': Book.Category.HADITH,
                'total_copies': 5,
                'available_copies': 5,
                'shelf_location': 'Shelf H-02'
            }
        )
        for i in range(1, 4):
            BookCopy.objects.get_or_create(
                book=book1,
                accession_number=f'ACC-HAD-{i:03d}',
                defaults={'is_available': True}
            )

        # 13. Calendar Event
        CalendarEvent.objects.get_or_create(
            title='First Semester Mid-Term Examination',
            defaults={
                'title_urdu': 'ششماہی امتحانات',
                'event_type': CalendarEvent.EventType.EXAM,
                'start_date': date(2026, 9, 10),
                'end_date': date(2026, 9, 20),
                'description': 'Mid-term assessments for all classes.',
                'is_holiday': False
            }
        )

        self.stdout.write(self.style.SUCCESS('\n======================================================='))
        self.stdout.write(self.style.SUCCESS('JAMIA ISLAMIA DEMO SEED COMPLETED SUCCESSFULLY!'))
        self.stdout.write(self.style.SUCCESS('======================================================='))
        self.stdout.write(self.style.SUCCESS('Credentials summary:'))
        self.stdout.write('  [Admin]   username: admin           password: JamiaAdmin2026!')
        self.stdout.write('  [Teacher] username: teacher_ahmed   password: JamiaPass2026!')
        self.stdout.write('  [Teacher] username: teacher_fatima  password: JamiaPass2026!')
        self.stdout.write('  [Teacher] username: teacher_imran   password: JamiaPass2026!')
        self.stdout.write('  [Parent]  username: parent_tariq    password: JamiaPass2026!')
        self.stdout.write('  [Parent]  username: parent_salman   password: JamiaPass2026!')
        self.stdout.write('  [Student] username: student_zaid    password: JamiaPass2026!')
        self.stdout.write('  [Student] username: student_bilal   password: JamiaPass2026!')
        self.stdout.write(self.style.SUCCESS('=======================================================\n'))
