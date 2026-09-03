# Jamia Islamia - Backup and Disaster Recovery Guide

## Backup Strategy

### 1. PostgreSQL Database Backups
- **Tool**: `scripts/backup_database.sh`
- **Mechanism**: `pg_dump -F c -b -v | gzip`
- **Schedule**: Every night at 02:00 AM via cron.
- **Retention**: 30 days daily backups, 12 months monthly snapshots.

```bash
# Manual Database Backup
bash scripts/backup_database.sh
```

### 2. Media Files Snapshot
- **Tool**: `scripts/backup_media.sh`
- **Mechanism**: `tar -czf` of `MEDIA_ROOT`
- **Schedule**: Nightly at 02:30 AM via cron.

```bash
# Manual Media Backup
bash scripts/backup_media.sh
```

---

## Restoration & Verification Workflow

### 1. Restore Database from Backup
```bash
bash scripts/restore_database.sh /var/backups/jamia/database/jamia_db_backup_20260903_120000.sql.gz
```

### 2. Automated Restore Verification
Tests the validity of a backup by restoring into a temporary database, checking row counts, and verifying table integrity:
```bash
bash scripts/verify_backup.sh /var/backups/jamia/database/jamia_db_backup_20260903_120000.sql.gz
```
