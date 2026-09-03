# Jamia Islamia - Mobile Release Checklist & Prerequisite Tracker
**Application**: Jamia Islamia Mobile App (`edu.jamiaislamia.bhatkal`)  
**Target Release**: v1.0.0 (VersionCode: 1)  

---

## 1. Build & Release Preparation
- [x] **EAS Build Configuration (`mobile/eas.json`)**: Configured with `development`, `preview` (staging), and `production` profiles.
- [x] **Android Package Identifier**: Verified as `edu.jamiaislamia.bhatkal`.
- [x] **Version Code**: Set to `1`, version `1.0.0`.
- [x] **Adaptive Icons & Splash Screen**: Dark theme asset configuration present in `mobile/app.json`.
- [ ] **EAS Project Linking**: `BLOCKED` (Requires running `eas init` or providing `EAS_PROJECT_ID` with an active Expo account).
- [ ] **EAS Production Android Cloud Build**: `BLOCKED` (Requires running `eas build --platform android --profile production` via Expo CLI).

---

## 2. Backend & Network Connectivity
- [x] **Production API Endpoint Routing**: Configured in `mobile/src/services/api.ts` with `EXPO_PUBLIC_API_URL` environment support.
- [x] **Local Development & Wi-Fi IP Fallback**: In-app configuration modal allows entering local development IP for LAN testing.
- [x] **HTTPS Reverse Proxy & Health Probes**: Backend supports SSL termination with `/api/health/liveness/` and `/api/health/readiness/`.
- [x] **JWT Authentication & Token Rotation**: Auto-refresh on HTTP 401 with token blacklisting on logout.

---

## 3. Push Notifications Pipeline
- [x] **Device Push Token Endpoint**: `/api/v1/auth/device-token/` registers FCM/Expo tokens associated with user accounts.
- [x] **Notification Data Privacy**: Push notifications mask raw database IDs and sensitive medical/financial data.
- [x] **Asynchronous Celery Delivery**: Background dispatching via `apps.notifications.tasks.async_dispatch_push_notifications`.
- [ ] **Physical Android Push Delivery**: `BLOCKED` (Requires physical Android device connected to Expo Push / Firebase Cloud Messaging service).

---

## 4. Offline Synchronization Engine
- [x] **AsyncStorage Cache Layer**: Reads cached locally for offline browsing.
- [x] **Mutation Queue**: Offline actions queued with unique `id`, `url`, `method`, `data`, and `idempotencyKey`.
- [x] **Idempotency Replay Protection**: Backend `IdempotencyMiddleware` ignores replayed duplicate mutations.
- [ ] **Physical Airplane Mode Field Test**: `BLOCKED` (Requires physical Android device toggling Airplane mode).

---

## 5. Security & Validation
- [x] **File Upload Whitelisting**: Strict validation for `.pdf`, `.jpg`, `.jpeg`, `.png`, and `.docx` under 10 MB limit.
- [x] **Login Rate Limiting**: 5 attempts/min enforced on authentication endpoints.
- [x] **Object-Level Permissions**: Parents strictly isolated to their linked children.
- [x] **Audit Trail**: Security events logged to `AuditLog` table.
- [x] **Zero Secrets in Repository**: Environment separation enforced across `.env.development`, `.env.staging`, `.env.production`.

---

## 6. External Prerequisites Checklist for Deployment Team

To convert this **Release Candidate** into a live production rollout on Google Play / Physical Devices:

1. **Expo / EAS Account**:
   ```bash
   npm install -g eas-cli
   eas login
   cd mobile
   eas build:configure
   eas build --platform android --profile production
   ```
2. **Google Play Console / Keystore**:
   - Set up Google Play Developer account.
   - Upload Google Service Account JSON to EAS credentials.
3. **Physical Device Testing**:
   - Distribute the generated `.apk` (from `preview` profile) to Jamia Islamia administrators and teachers in Bhatkal for on-site Wi-Fi and offline testing.
