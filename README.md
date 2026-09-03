# 🏫 Jamia Islamia School Management System
### *Nawayath Colony, Bhatkal, Karnataka, India*

[![Built with Python](https://img.shields.io/badge/Backend-Django_5_&_DRF-092E20?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![Built with React](https://img.shields.io/badge/Frontend-React_18_&_TypeScript-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![Mobile App](https://img.shields.io/badge/Mobile-React_Native_&_Expo-000020?style=for-the-badge&logo=expo)](https://expo.dev/)
[![i18n](https://img.shields.io/badge/Bilingual-English_&_Urdu_RTL-059669?style=for-the-badge)](https://react.i18next.com/)

---

## 🌟 Overview
A production-grade, modular monolith School Management System purpose-built for **Jamia Islamia (Bhatkal)**. The platform provides role-tailored workflows for Administrators, Teachers, Students, and Parents with native English and Urdu (RTL) support from the foundation up.

---

## 🚀 Key Features & Modules
- **🏛️ School & Academic Management**: Academic years, grade levels (Grade 1-10 / درجات اول تا دہم), sections, curriculum subjects, and teacher allocations.
- **👨‍🎓 Comprehensive Student & Parent Portals**: Historical enrollment tracking, parent accounts with seamless multi-child switching.
- **📋 High-Speed Attendance Engine**: Bulk daily and period-wise attendance registers for teachers with offline queueing and instant parent absence notifications.
- **📊 Exams, Grading & Bilingual Report Cards**: Assessment scheduling, batch marks entry matrix, result publication pipeline, and printable bilingual progress report cards with institutional seal.
- **⏰ Timetable & Schedules**: Interactive period schedule viewer for students, parents, and teachers.
- **📝 Homework & Submissions**: Assignment distribution, student upload portal, and teacher grading with feedback.
- **📢 Announcements & Scoped Messaging**: Target-audience-filtered notices and secure, authenticated Teacher-Parent/Student communication channels.
- **📚 Library Management**: Catalog of Islamic sciences (Tafseer, Hadith, Fiqh, Arabic) and school reference books with loan checkouts and returns.
- **🛡️ Safe CSV Import & Export**: Dry-run preview with row-level validation error detection and rollback before committing to database.
- **📱 Android App with Offline Sync Engine**: Persistent local mutation queue with background synchronization upon reconnecting.

---

## 🔑 Demo Login Credentials

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `JamiaAdmin2026!` | Full ERP administrative & import access |
| **Teacher** | `teacher_ahmed` | `JamiaPass2026!` | Senior Teacher (Islamic Studies / Arabic) |
| **Teacher** | `teacher_fatima` | `JamiaPass2026!` | English Faculty |
| **Teacher** | `teacher_imran` | `JamiaPass2026!` | Mathematics & Science Faculty |
| **Parent** | `parent_tariq` | `JamiaPass2026!` | Parent of Zaid (Grade 5) & Maryam (Grade 3) |
| **Parent** | `parent_salman` | `JamiaPass2026!` | Parent of Bilal (Grade 5) |
| **Student** | `student_zaid` | `JamiaPass2026!` | Student (Admission: JI-2026-001) |
| **Student** | `student_bilal` | `JamiaPass2026!` | Student (Admission: JI-2026-003) |

---

## 🛠️ Quickstart & Local Setup

### 1. Backend (Django REST Framework)
```bash
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 127.0.0.1:8000
```
- API Endpoint: `http://127.0.0.1:8000/api/v1/`
- Interactive Swagger UI: `http://127.0.0.1:8000/api/docs/`
- Admin Panel: `http://127.0.0.1:8000/admin/`

### 2. Web Application (React + Vite + TypeScript)
```bash
cd web
npm install
npm run dev
```
- Web Application: `http://localhost:3000/`

### 3. Mobile Application (React Native + Expo)
```bash
cd mobile
npm install
npx expo start
```

### 4. Running Backend Tests & System Verification
```bash
cd backend
python manage.py test apps.accounts.tests apps.attendance.tests
python verify_production.py
```

### 5. Multi-Environment Docker Deployments

#### Local Development
```bash
docker compose -f docker-compose.yml up --build
```

#### Staging Environment
```bash
docker compose -f docker-compose.staging.yml up -d --build
docker compose -f docker-compose.staging.yml exec backend python manage.py migrate
docker compose -f docker-compose.staging.yml exec backend python manage.py collectstatic --noinput
```

#### Production Deployment
```bash
docker compose -f docker-compose.production.yml up -d --build
docker compose -f docker-compose.production.yml exec backend python manage.py migrate --noinput
docker compose -f docker-compose.production.yml exec backend python manage.py collectstatic --noinput
```

### 6. Automated Backup & Restore
```bash
# Automated database backup (PostgreSQL)
bash scripts/backup_database.sh

# Automated media backup
bash scripts/backup_media.sh

# Verify backup validity & test restore
bash scripts/verify_backup.sh /var/backups/jamia/database/jamia_db_backup_latest.sql.gz
```

---

## 📚 Complete Documentation Suite
- [Production Deployment Guide](file:///c:/Users/Home/Downloads/jamia_islamia_nawayath/DEPLOYMENT.md)
- [Staging Environment Guide](file:///c:/Users/Home/Downloads/jamia_islamia_nawayath/STAGING.md)
- [Backup & Disaster Recovery](file:///c:/Users/Home/Downloads/jamia_islamia_nawayath/BACKUP_AND_RESTORE.md)
- [Security & Hardening Guide](file:///c:/Users/Home/Downloads/jamia_islamia_nawayath/SECURITY.md)
- [Performance & Database Guide](file:///c:/Users/Home/Downloads/jamia_islamia_nawayath/PERFORMANCE.md)
- [System Architecture](file:///c:/Users/Home/Downloads/jamia_islamia_nawayath/docs/architecture.md)
- [Database Schema & ERD](file:///c:/Users/Home/Downloads/jamia_islamia_nawayath/docs/database.md)
- [Internationalization & RTL](file:///c:/Users/Home/Downloads/jamia_islamia_nawayath/docs/internationalization.md)
- [Offline Sync Architecture](file:///c:/Users/Home/Downloads/jamia_islamia_nawayath/docs/offline-sync.md)

---

## 🏛️ Institution Details
- **School Name**: Jamia Islamia (*جامعہ اسلامیہ*)
- **Address**: Nawayath Colony, Bhatkal, Karnataka, India - 581320
- **Website**: https://jamiaislamia.edu.in
- **Email**: info@jamiaislamia.edu
