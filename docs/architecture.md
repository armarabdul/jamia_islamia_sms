# Jamia Islamia - System Architecture

## Overview
The Jamia Islamia School Management System is designed as a **Modular Monolith** engineered for high reliability, data protection, strict multi-role permission boundaries, and bilingual (English & Urdu RTL) operational support.

## Architectural Layers
1. **Client Tier**:
   - **Web App**: React 18, TypeScript, Vite, TanStack Query v5, Tailwind/Vanilla CSS Design System with native CSS Logical Properties for bidirectional (LTR / RTL) layout.
   - **Mobile App**: React Native with Expo SDK 51, TypeScript, AsyncStorage offline mutation queue, and Expo Notifications for Android push delivery.
2. **Gateway & Proxy Tier**:
   - Nginx Reverse Proxy terminating SSL, handling static/media assets, and enforcing rate limiting on authentication routes.
3. **Application & Domain Tier (Django 5.1 REST Framework)**:
   - Modular domain apps (`accounts`, `schools`, `academic`, `students`, `parents`, `staff`, `attendance`, `examinations`, `grades`, `timetable`, `assignments`, `announcements`, `messaging`, `notifications`, `calendar`, `library`, `reports`, `imports`).
   - Clean separation of concerns with Service Layer for cross-cutting business actions (e.g., absence notification dispatching, CSV atomic dry-runs).
4. **Data & Storage Tier**:
   - **PostgreSQL 16**: Primary relational database with ACID compliance, foreign key constraints, and selective soft deletion.
   - **Redis 7**: Cache store for OpenAPI schema, session metadata, and Celery task broker.
   - **Celery Workers**: Asynchronous execution of push notification broadcasting and report generation.
