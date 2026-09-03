#!/bin/bash
# ==============================================================================
# Jamia Islamia - Media Storage Backup Script
# ==============================================================================
set -euo pipefail

MEDIA_SOURCE_DIR="${MEDIA_ROOT:-./backend/media}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/jamia/media}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/jamia_media_backup_${TIMESTAMP}.tar.gz"

mkdir -p "${BACKUP_DIR}"

echo "[INFO] Starting media backup from '${MEDIA_SOURCE_DIR}'..."

if [ ! -d "${MEDIA_SOURCE_DIR}" ]; then
    echo "[WARN] Media source directory does not exist yet. Creating empty placeholder."
    mkdir -p "${MEDIA_SOURCE_DIR}"
fi

tar -czf "${BACKUP_FILE}" -C "$(dirname "${MEDIA_SOURCE_DIR}")" "$(basename "${MEDIA_SOURCE_DIR}")"

if [ -s "${BACKUP_FILE}" ]; then
    FILESIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "[SUCCESS] Media backup created successfully: ${BACKUP_FILE} (${FILESIZE})"
else
    echo "[ERROR] Media backup failed." >&2
    exit 1
fi

# Apply retention policy
find "${BACKUP_DIR}" -name "jamia_media_backup_*.tar.gz" -type f -mtime +"${RETENTION_DAYS}" -exec rm -f {} +
echo "[SUCCESS] Media retention policy applied."
