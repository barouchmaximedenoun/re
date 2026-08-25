#!/bin/bash
# case "$1" in
#     auth)
        # configuration auth
#         ;;
#     tenant)
        # configuration tenant
#         ;;
# esac

# go to directory where my script is, if succeed print working directory, result of command put it in SCRIPT_DIR
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTH_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

set -a
source "$AUTH_DIR/.env"
set +a

"$SCRIPT_DIR/../../../../../../../../infra/environment/db/postgres/setup/scripts/setup_database.sh" auth

TEMPLATE_DIR="$SCRIPT_DIR/../templates"

# envsubst < "$TEMPLATE_DIR/001_extensions.sql" | psql -U postgres
envsubst < "$TEMPLATE_DIR/002_tables.sql" | psql -d "$DB_NAME" -U "$MIGRATION_USER"
envsubst < "$TEMPLATE_DIR/006_seeds.sql" | psql -d "$DB_NAME" -U "$MIGRATION_USER"

