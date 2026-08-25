#!/bin/bash

# DEVELOPMENT ONLY
# Completely destroys and recreates the database.

set -euo pipefail

DB_NAME="auth"

echo "WARNING: this will DELETE database '$DB_NAME'."
read -r -p "Type '$DB_NAME' to continue: " CONFIRM

if [[ "$CONFIRM" != "$DB_NAME" ]]; then
    echo "Reset cancelled."
    exit 1
fi

psql -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME WITH (FORCE);"

echo "Database '$DB_NAME' deleted."
