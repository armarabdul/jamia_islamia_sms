# Jamia Islamia - Staging Environment Guide

## Overview
The Staging environment mirrors the production architecture (PostgreSQL, Redis, Gunicorn, Celery Worker, Celery Beat, Nginx) while running in an isolated sandbox with separate database instances, mocked push notification tokens, and dedicated subdomains.

## Staging Characteristics
- **Domain**: `https://staging.jamiaislamia.edu.in`
- **Database**: `jamia_staging_db`
- **Secrets**: Dedicated staging credentials in `.env.staging`
- **Notifications**: Absence notifications and announcement alerts log to Celery worker stdout without dispatching real production pushes to parents.

## Startup Commands
```bash
docker compose -f docker-compose.staging.yml up -d --build
docker compose -f docker-compose.staging.yml exec backend python manage.py migrate
docker compose -f docker-compose.staging.yml exec backend python manage.py collectstatic --noinput
```
