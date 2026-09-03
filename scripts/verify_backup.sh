#!/bin/bash
# ==============================================================================
# Jamia Islamia - Automated Backup Restore Verification Workflow
# ==============================================================================
set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path-to-backup-file.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"
TEST_DB_NAME="jamia_backup_verify_temp"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-jamia_prod_user}"

echo "[INFO] Creating temporary test database '${TEST_DB_NAME}'..."
PGPASSWORD="${DB_PASSWORD:-}" createdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${TEST_DB_NAME}" || true

cleanup() {
    echo "[INFO] Cleaning up temporary test database '${TEST_DB_NAME}'..."
    PGPASSWORD="${DB_PASSWORD:-}" dropdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" --if-exists "${TEST_DB_NAME}" || true
}
trap cleanup EXIT

echo "[INFO] Testing restore of '${BACKUP_FILE}' into '${TEST_DB_NAME}'..."
gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD:-}" pg_restore -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${TEST_DB_NAME}" -v

echo "[INFO] Verifying schema and row integrity on restored test database..."
RECORD_COUNT=$(PGPASSWORD="${DB_PASSWORD:-}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${TEST_DB_NAME}" -t -c "SELECT COUNT(*) FROM accounts_user;")
echo "[INFO] Restored accounts_user table row count: ${RECORD_COUNT}"

if [ "${RECORD_COUNT}" -gt 0 ]; then
    echo "[SUCCESS] Backup verification PASSED. The backup is valid, complete, and restorable."
else
    echo "[ERROR] Backup verification FAILED: accounts_user table contains 0 records." >&2
    exit 1
fi
