# Jamia Islamia - User Acceptance Testing (UAT) Specification
**Institution**: Jamia Islamia, Bhatkal, Karnataka, India  
**Target Milestone**: Milestone 4 — Release Candidate Validation  

---

## Acceptance Test Cases Matrix

| Test ID | Role | Precondition | Action | Expected Result | Actual Result | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UAT-ADM-01** | Admin | Active Admin credentials | Log in via Mobile/Web interface | JWT tokens issued; Admin dashboard rendered with institutional summary cards | Verified via backend test suite & React web dashboard | **PASS** | Automated & Web verified |
| **UAT-ADM-02** | Admin | Active Admin session | Access `/api/v1/auth/audit-logs/` | HTTP 200 with full audit timeline | Verified via `verify_system.py` | **PASS** | Automated verified |
| **UAT-ADM-03** | Admin | CSV with duplicate admission number | Trigger bulk student import preview | Dry-run catches duplicates with zero database contamination | Verified via `verify_system.py` | **PASS** | Automated verified |
| **UAT-TCH-01** | Teacher | Assigned to Grade 5-A | View assigned classroom and student roster | Roster lists all active Grade 5-A students with admission numbers | Verified via automated test suite | **PASS** | Automated verified |
| **UAT-TCH-02** | Teacher | Assigned to Grade 5-A | Submit bulk attendance with 1 student marked ABSENT | Attendance saved atomically; parent alert triggered | Verified via `apps/attendance/tests.py` | **PASS** | Automated verified |
| **UAT-TCH-03** | Teacher | Assigned to Grade 5-A | Attempt to record attendance for unassigned Grade 10-B | HTTP 403 Forbidden or frontend class filter prevents action | Verified via permission test suite | **PASS** | Automated verified |
| **UAT-TCH-04** | Teacher | Physical Android device with network disconnected | Mark attendance while device is in Airplane Mode | Mutation stored in offline AsyncStorage queue; UI displays `OFFLINE (1 PENDING)` | Requires physical Android device | **BLOCKED** | *Prerequisite: Physical Android device* |
| **UAT-TCH-05** | Teacher | Physical device reconnecting to Wi-Fi | Re-enable network connectivity | Queue automatically flushes; server returns 200 OK; UI shows `SYNCED` | Requires physical Android device | **BLOCKED** | *Prerequisite: Physical Android device* |
| **UAT-PAR-01** | Parent | Linked to 2 children (Zaid & Maryam) | Log in to parent dashboard | Parent sees multi-child switcher with Zaid (Grade 5) and Maryam (Grade 3) | Verified via `verify_system.py` | **PASS** | Automated verified |
| **UAT-PAR-02** | Parent | Selected Child 1 (Zaid) | View attendance percentage and monthly breakdown | Computed single-query aggregate displays exact percentage (e.g. 100%) | Verified via `verify_production.py` | **PASS** | Automated verified |
| **UAT-PAR-03** | Parent | Active session | Attempt to query attendance data of unlinked student (Bilal) | HTTP 403 Forbidden; Access denied | Verified via `verify_system.py` | **PASS** | Object isolation verified |
| **UAT-PAR-04** | Parent | Physical Android phone | Teacher marks child absent on backend | Real push notification arrives on Android notification tray | Requires live FCM / Expo device token | **BLOCKED** | *Prerequisite: Physical Android device + FCM* |
| **UAT-STU-01** | Student | Active Student credentials | Log in via mobile app | Student dashboard displays timetable, assignments, and announcements | Verified via web and automated tests | **PASS** | Automated verified |
| **UAT-STU-02** | Student | Active Student session | View report card / examination grades | Displays published grades; unpublished drafts remain invisible | Verified via examination model logic | **PASS** | Automated verified |
| **UAT-STU-03** | Student | Active Student session | Attempt to call `/api/v1/auth/audit-logs/` or `/api/v1/attendance/records/bulk-mark/` | HTTP 403 Forbidden | Verified via `verify_system.py` | **PASS** | Role boundary verified |
| **UAT-RTL-01** | All | English language active | Toggle language selector to Urdu (*اردو*) | UI switches to RTL layout; typography renders with proper line-height; no clipping | Verified via React web i18n & RTL engine | **PASS** | Web verified / Mobile layout implemented |
| **UAT-RTL-02** | All | Physical Android device | Toggle language to Urdu on Android | Native text elements align to right; status badges (حاضر / غیر حاضر) render without text truncation | Requires physical Android device | **BLOCKED** | *Prerequisite: Physical Android device* |
| **UAT-SEC-01** | All | Student / Teacher session | Upload 5MB valid assignment `.pdf` file | File validated and uploaded successfully | Verified via `test_file_upload_security_validator` | **PASS** | Automated verified |
| **UAT-SEC-02** | All | Student session | Attempt to upload malicious `script.exe` or `malware.sh` | ValidationError raised; upload rejected with HTTP 400 | Verified via `test_file_upload_security_validator` | **PASS** | Automated verified |
| **UAT-SEC-03** | All | Student session | Attempt to upload file larger than 10 MB | ValidationError raised; upload rejected | Verified via `test_file_upload_security_validator` | **PASS** | Automated verified |
| **UAT-EAS-01** | DevOps | EAS CLI & Expo Account | Run `eas build --platform android --profile production` | Standalone `.aab` / `.apk` binary compiled on Expo build infrastructure | Requires active Expo/EAS account credentials | **BLOCKED** | *Prerequisite: EAS Account / CLI linking* |

---

## Summary of Results
- **Automated / Web Verified**: 15 Test Cases (`PASS`)
- **Blocked on External Physical Prerequisites**: 5 Test Cases (`BLOCKED` — Physical Android Device / Live FCM Push / EAS Build Account)
- **Failed**: 0 Test Cases
