export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'STAFF';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone_number?: string;
  language_preference: 'en' | 'ur';
  profile_picture?: string | null;
}

export interface Student {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  first_name_urdu: string;
  last_name_urdu: string;
  full_name: string;
  full_name_urdu: string;
  gender: 'MALE' | 'FEMALE';
  date_of_birth?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'GRADUATED';
  current_enrollment?: {
    id: string;
    academic_year_name: string;
    class_room: string;
    class_name: string;
    section: string;
    section_name: string;
    roll_number: string;
  };
}

export interface TeacherStaff {
  id: string;
  user: string;
  username: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  employee_code: string;
  qualification: string;
  designation: string;
  department: string;
  is_teaching: boolean;
}

export interface ClassRoom {
  id: string;
  name: string;
  name_urdu: string;
  numeric_level: number;
  sections: Section[];
}

export interface Section {
  id: string;
  class_room: string;
  class_name: string;
  name: string;
  name_urdu: string;
  capacity: number;
  teacher_name?: string;
}

export interface Subject {
  id: string;
  name: string;
  name_urdu: string;
  code: string;
  credit_hours: number;
}

export interface AttendanceRecord {
  id: string;
  student: string;
  student_name: string;
  student_name_urdu: string;
  admission_number: string;
  roll_number?: string;
  date: string;
  period_number: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
}

export interface Exam {
  id: string;
  name: string;
  name_urdu: string;
  academic_year_name: string;
  start_date: string;
  end_date: string;
  is_published: boolean;
  description?: string;
  exam_subjects?: ExamSubject[];
}

export interface ExamSubject {
  id: string;
  exam: string;
  class_room: string;
  class_name: string;
  subject: string;
  subject_name: string;
  subject_code: string;
  exam_date: string;
  total_marks: number;
  passing_marks: number;
}

export interface ReportCard {
  student: {
    id: string;
    admission_number: string;
    name: string;
    name_urdu: string;
    class_name: string;
    section_name: string;
    roll_number: string;
  };
  exam: {
    id: string;
    name: string;
    name_urdu: string;
    academic_year: string;
  };
  results: {
    subject_id: string;
    subject_name: string;
    subject_name_urdu: string;
    marks_obtained: number;
    total_marks: number;
    passing_marks: number;
    grade: string;
    is_absent: boolean;
    remarks: string;
    is_passed: boolean;
  }[];
  summary: {
    total_obtained: number;
    total_maximum: number;
    percentage: number;
    overall_grade: string;
    overall_remarks: string;
    overall_remarks_urdu: string;
    is_overall_passed: boolean;
  };
}

export interface Assignment {
  id: string;
  title: string;
  title_urdu: string;
  description: string;
  subject: string;
  subject_name: string;
  subject_name_urdu: string;
  class_room: string;
  class_name: string;
  section: string;
  section_name: string;
  teacher_name: string;
  due_date: string;
  max_marks: number;
  submission_count?: number;
  my_submission?: Submission | null;
}

export interface Submission {
  id: string;
  assignment: string;
  student: string;
  student_name: string;
  admission_number: string;
  submission_text: string;
  attachment?: string | null;
  status: 'SUBMITTED' | 'GRADED' | 'LATE' | 'RESUBMISSION_REQUESTED';
  marks_obtained?: number | null;
  feedback?: string;
}

export interface Announcement {
  id: string;
  title: string;
  title_urdu: string;
  content: string;
  content_urdu: string;
  audience: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'CLASS';
  author_name: string;
  is_pinned: boolean;
  published_at: string;
}

export interface TimetableSlot {
  id: string;
  class_name: string;
  section_name: string;
  subject_name: string;
  subject_name_urdu: string;
  teacher_name: string;
  day_of_week: number;
  day_name: string;
  period_number: number;
  start_time: string;
  end_time: string;
  room_number?: string;
}

export interface Book {
  id: string;
  title: string;
  title_urdu: string;
  author: string;
  author_urdu: string;
  isbn: string;
  category: string;
  category_display: string;
  total_copies: number;
  available_copies: number;
  shelf_location: string;
}
