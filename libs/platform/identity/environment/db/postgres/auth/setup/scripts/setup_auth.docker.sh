#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTH_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

INFRA_DB_SETUP_DIR="${INFRA_DB_SETUP_DIR:?INFRA_DB_SETUP_DIR must be set}"

"$INFRA_DB_SETUP_DIR/scripts/setup_database.sh" auth

TEMPLATE_DIR="$AUTH_DIR/templates"

envsubst < "$TEMPLATE_DIR/002_tables.sql" \
    | PGPASSWORD="$MIGRATION_PASSWORD" \
      psql -h "$DB_HOST" -p "$DB_PORT" \
           -d "$DB_NAME" -U "$MIGRATION_USER"

envsubst < "$TEMPLATE_DIR/006_seeds.sql" \
    | PGPASSWORD="$MIGRATION_PASSWORD" \
      psql -h "$DB_HOST" -p "$DB_PORT" \
           -d "$DB_NAME" -U "$MIGRATION_USER"