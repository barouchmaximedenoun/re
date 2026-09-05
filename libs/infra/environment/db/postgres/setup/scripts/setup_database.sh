#!/bin/bash
# stop on error, error if use var not defined, error in any part of pipe fail
# https://chatgpt.com/c/6a8951ad-d9ac-83eb-9629-f1746a7bacec 

set -euo pipefail

PREFIX="$1"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR/../templates"

#export DB_NAME SCHEMA_NAME
#export ADMIN_USER ADMIN_PASSWORD
#export APP_USER APP_PASSWORD
#export READONLY_USER READONLY_PASSWORD
#export MIGRATION_USER MIGRATION_PASSWORD

CURRENT_DB_USER="$(psql -d postgres -Atc 'SELECT current_user;')"
export CURRENT_DB_USER
echo "Using PostgreSQL admin user: $CURRENT_DB_USER"

# Create the database from the PostgreSQL administration database.
envsubst < "$TEMPLATE_DIR/001_create_database.sql" \
    | psql \
        -h "$PGHOST" \
        -p "$PGPORT" \
        -U "$PGUSER" \
        -d postgres

# Configure the target database.
envsubst < "$TEMPLATE_DIR/002_create_schema.sql" \
    | psql \
        -h "$PGHOST" \
        -p "$PGPORT" \
        -U "$PGUSER" \
        -d "$DB_NAME"

# Create roles/users and permissions.
envsubst < "$TEMPLATE_DIR/003_roles/001_create_roles.sql" \
    | psql \
        -h "$PGHOST" \
        -p "$PGPORT" \
        -U "$PGUSER" \
        -d "$DB_NAME"

envsubst < "$TEMPLATE_DIR/003_roles/002_admin_permissions.sql" \
    | psql \
        -h "$PGHOST" \
        -p "$PGPORT" \
        -U "$PGUSER" \
        -d "$DB_NAME"

envsubst < "$TEMPLATE_DIR/003_roles/003_migration_permissions.sql" \
    | psql \
        -h "$PGHOST" \
        -p "$PGPORT" \
        -U "$PGUSER" \
        -d "$DB_NAME"

envsubst < "$TEMPLATE_DIR/003_roles/004_rw_permissions.sql" \
    | psql \
        -h "$PGHOST" \
        -p "$PGPORT" \
        -U "$PGUSER" \
        -d "$DB_NAME"

envsubst < "$TEMPLATE_DIR/003_roles/005_ro_permissions.sql" \
    | psql \
        -h "$PGHOST" \
        -p "$PGPORT" \
        -U "$PGUSER" \
        -d "$DB_NAME"

envsubst < "$TEMPLATE_DIR/003_roles/006_default_privileges.sql" \
    | psql \
        -h "$PGHOST" \
        -p "$PGPORT" \
        -U "$PGUSER" \
        -d "$DB_NAME"

echo "Database setup completed successfully."

