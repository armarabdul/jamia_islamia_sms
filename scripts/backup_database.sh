#!/bin/bash
# ==============================================================================
# Jamia Islamia - Automated PostgreSQL Database Backup Script
# ==============================================================================
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/jamia/database}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/jamia_db_backup_${TIMESTAMP}.sql.gz"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-jamia_production_db}"
DB_USER="${DB_USER:-jamia_prod_user}"

mkdir -p "${BACKUP_DIR}"

echo "[INFO] Starting database backup for '${DB_NAME}' at ${TIMESTAMP}..."

# Execute pg_dump with gzip compression
PGPASSWORD="${DB_PASSWORD:-}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -F c -b -v | gzip > "${BACKUP_FILE}"

if [ -s "${BACKUP_FILE}" ]; then
    FILESIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "[SUCCESS] Database backup created successfully: ${BACKUP_FILE} (${FILESIZE})"
else
    echo "[ERROR] Database backup failed or created empty file." >&2
    exit 1
fi

# Apply retention policy
echo "[INFO] Cleaning up database backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "jamia_db_backup_*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -exec rm -f {} +
echo "[SUCCESS] Retention policy applied cleanly."
