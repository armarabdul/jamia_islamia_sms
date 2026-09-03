# Jamia Islamia - Offline & Low-Data Mode Architecture

## Overview
Teachers and parents in low-connectivity areas need seamless operation without application disruption.

## Offline Architecture Components
1. **Local Persistent Cache (AsyncStorage / SQLite)**:
   - Read-only data (active timetable schedules, assigned homework, attendance history, and published report cards) are cached locally on fetch.
2. **Offline Mutation Queue**:
   - When offline, user actions (such as marking attendance or submitting grades) are saved into `OfflineSyncManager.enqueueAction()`.
   - Each mutation receives a unique UUID idempotency key (`X-Idempotency-Key`).
3. **Background Sync Engine**:
   - As soon as network connectivity is restored, the `OfflineSyncManager.processSyncQueue()` worker drains the queue in FIFO order.
   - Successful actions are acknowledged by the backend and removed from local storage.
   - Any validation or conflict error updates the status to `FAILED` with human-readable error messages for teacher review.
