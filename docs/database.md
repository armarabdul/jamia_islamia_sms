# Jamia Islamia - Database Design & Schema

## Entity Relationship Overview
The database schema is organized around core academic and administrative domains:

- **School & Academic Structure**:
  - `School`: Institution profile, contact information, JSON settings.
  - `AcademicYear`: Term periods, active year marker with exclusive current constraint.
  - `ClassRoom`: Grade level hierarchy (e.g., Grade 1 to 10).
  - `Section`: Classroom divisions (A, B) linked to Class Teacher.
  - `Subject`: Curriculum courses with Urdu translations and credit hours.
  - `SubjectTeacherAssignment`: Section + Subject + Teacher mapping.

- **People & Identity**:
  - `User`: Custom auth model with roles (`ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `STAFF`) and language preference.
  - `Student`: Admission number (unique index), biographical details, blood group, emergency contacts.
  - `Enrollment`: Tracks student's progression per academic year without destroying historical grade records.
  - `Parent`: Contact details, occupations.
  - `ParentStudentRelation`: Multi-child linkage with primary contact designation.
  - `Staff`: Employee code, qualification, designation, department, and teaching flag.

- **Academics & Evaluation**:
  - `AttendanceRecord`: Section + Student + Date + Period number unique constraint with `PRESENT`, `ABSENT`, `LATE`, `EXCUSED` status.
  - `Exam` & `ExamSubject`: Examination terms and schedules.
  - `GradeRecord`: Marks obtained, auto-calculated grade letters, and remarks.
  - `Assignment` & `Submission`: Homework posting and student file submissions with grading.

- **Communication & Institution**:
  - `Announcement`: Audience-targeted notice board.
  - `Conversation` & `Message`: Role-restricted communication channels.
  - `Notification`: In-app & push notification records.
  - `Book`, `BookCopy`, `BookTransaction`: Library management.
  - `AuditLog`: Security audit trail capturing IP addresses, resource IDs, and changes.
