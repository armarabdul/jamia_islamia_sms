# Jamia Islamia - Security Architecture & Hardening Guide

## Security Principles
1. **Zero-Trust Network Model**:
   - Database (PostgreSQL) and Cache/Broker (Redis) are contained in private Docker networks and not exposed to the public Internet.
   - Nginx operates as the single SSL-terminating ingress gateway.
2. **Server-Side Authorization & Idempotency**:
   - `IsAdminUserRole`, `IsTeacherUserRole`, `IsParentUserRole`, `IsStudentUserRole` enforce strict permission boundaries at the controller level.
   - `IdempotencyMiddleware` prevents duplicate mutation actions and replay attacks.
3. **File Upload Security**:
   - Extension whitelisting (`.pdf`, `.jpg`, `.jpeg`, `.png`, `.docx`).
   - Max file size ceiling of 10 MB.
   - Rejection of executable MIME types.
4. **Authentication Protection**:
   - DRF `LoginRateThrottle` enforcers 5 attempts/min to prevent brute-force attacks.
   - JWT tokens: 60-120 min access lifetimes, automatic rotation on refresh, and blacklisting on logout.
5. **Security Headers**:
   - `SECURE_BROWSER_XSS_FILTER = True`
   - `X_FRAME_OPTIONS = 'DENY'`
   - `SECURE_CONTENT_TYPE_NOSNIFF = True`
   - `SECURE_HSTS_SECONDS = 31536000`
   - `SESSION_COOKIE_SECURE = True`
   - `CSRF_COOKIE_SECURE = True`
