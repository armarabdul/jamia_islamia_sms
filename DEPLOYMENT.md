# Jamia Islamia School Management System - Production Deployment Guide
**Institution**: Jamia Islamia, Nawayath Colony, Bhatkal, Karnataka, India

---

## 1. Production Architecture Overview

The system is deployed as a resilient, containerized multi-tier service:

```text
[Internet / Android / Web Clients]
                │
                ▼
      [Nginx Reverse Proxy] (SSL Termination, Rate Limiting, Static/Media)
                │
                ├──► [React Web Frontend Container] (SPA via Nginx)
                │
                └──► [Gunicorn WSGI App Server] (4 workers, 2 threads)
                            │
                            ├──► [Django 5.1 REST API Backend]
                            │         │
                            │         ├──► [PostgreSQL 16 DB] (Conn Pooling, Indexes)
                            │         │
                            │         └──► [Redis 7 Cache / Broker]
                            │                   │
                            │                   ├──► [Celery Worker]
                            │                   │
                            │                   └──► [Celery Beat Scheduler]
```

---

## 2. Server Prerequisites
- Ubuntu 22.04+ LTS / Debian 12 / RHEL 9
- Docker Engine 24.0+ and Docker Compose v2.20+
- Minimum Server Specs: 2 vCPU, 4GB RAM, 40GB SSD
- Domain DNS pointing to server IP (`jamiaislamia.edu.in`, `api.jamiaislamia.edu.in`)

---

## 3. Step-by-Step Production Deployment

### Step 1: Clone Repository & Configure Environment
```bash
git clone https://github.com/jamia-islamia/jamia-islamia-sms.git /opt/jamia_islamia
cd /opt/jamia_islamia

# Create production environment file from template
cp .env.production .env
```
*Edit `.env` with a secure random `DJANGO_SECRET_KEY` and strong `POSTGRES_PASSWORD`.*

### Step 2: Acquire & Place SSL Certificates
```bash
mkdir -p ./ssl
# Place your certs from Let's Encrypt / Certbot:
# ./ssl/jamiaislamia.crt
# ./ssl/jamiaislamia.key
```

### Step 3: Build & Launch Production Containers
```bash
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d
```

### Step 4: Run Database Migrations & Collect Static Files
```bash
docker compose -f docker-compose.production.yml exec backend python manage.py migrate --noinput
docker compose -f docker-compose.production.yml exec backend python manage.py collectstatic --noinput
```

### Step 5: Verify Health Probes
```bash
curl -f http://localhost/api/health/liveness/
# Output: {"status": "HEALTHY", "service": "jamia-islamia-api"}

curl -f http://localhost/api/health/readiness/
# Output: {"status": "HEALTHY", "checks": {"database": "HEALTHY", "cache_redis": "HEALTHY"}}
```

---

## 4. Gunicorn Tuning Guidelines

| Server RAM | CPU Cores | Recommended Gunicorn Workers | Threads per Worker |
| :--- | :--- | :--- | :--- |
| 2 GB | 1 Core | 2 Workers | 2 Threads |
| 4 GB | 2 Cores | 4 Workers | 2 Threads |
| 8 GB | 4 Cores | 8 Workers | 2 Threads |

Tune via `GUNICORN_WORKERS`, `GUNICORN_THREADS`, and `GUNICORN_TIMEOUT` in `.env`.

---

## 5. Rollback Procedure
If a deployment needs to be rolled back to the previous stable release:
```bash
# 1. Rollback code to previous git tag
git checkout tags/v1.0.0-stable

# 2. Rebuild and restart containers
docker compose -f docker-compose.production.yml up -d --build

# 3. If database schema was changed, restore previous database snapshot
bash scripts/restore_database.sh /var/backups/jamia/database/jamia_db_backup_pre_deploy.sql.gz
```
