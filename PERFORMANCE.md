# Jamia Islamia - Database & Query Performance Guide

## Database Performance Tuning
1. **Connection Pooling**:
   - `CONN_MAX_AGE = 600` (Persistent connections up to 10 minutes)
   - `CONN_HEALTH_CHECKS = True`
2. **Composite Database Indexes**:
   - `AttendanceRecord`: `['class_room', 'section', 'date']`, `['section', 'date', 'period_number']`, `['academic_year', 'date']`, `['student', 'status']`, `['date', 'status']`
   - `Enrollment`: `['class_room', 'section', 'is_active']`, `['student', 'is_active']`, `['academic_year', 'is_active']`
   - `GradeRecord`: `['student', 'exam_subject']`
   - `IdempotencyRecord`: `['key', 'user']`
3. **Query Optimization & N+1 Elimination**:
   - `StudentAttendanceSummaryView`: Computes counts and statistics in a single SQL query using `Count('id', filter=Q(status=...))` aggregate rather than separate database hits.
   - `StudentViewSet`: Uses `select_related('user').prefetch_related('enrollments__class_room', 'enrollments__section')`.
   - `AttendanceRecordViewSet`: Uses `select_related('student', 'class_room', 'section', 'academic_year', 'marked_by')`.
4. **Redis Shared Caching**:
   - Caching layer for non-sensitive public configuration, API schema, and Celery broker queues.
