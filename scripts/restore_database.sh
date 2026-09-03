#!/bin/bash
# ==============================================================================
# Jamia Islamia - PostgreSQL Database Restore Script
# ==============================================================================
set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path-to-backup-file.sql.gz>"
    echo "Example: $0 /var/backups/jamia/database/jamia_db_backup_20260903_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "[ERROR] Backup file not found: ${BACKUP_FILE}" >&2
    exit 1
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-jamia_production_db}"
DB_USER="${DB_USER:-jamia_prod_user}"

echo "[WARNING] This operation will restore '${BACKUP_FILE}' into '${DB_NAME}'."
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "[INFO] Restore cancelled."
    exit 0
fi

echo "[INFO] Restoring database..."
gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD:-}" pg_restore -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists -v

echo "[SUCCESS] Database restoration completed successfully."
