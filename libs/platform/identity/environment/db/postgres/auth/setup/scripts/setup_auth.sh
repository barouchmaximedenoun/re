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

INFRA_DB_SETUP_DIR="$SCRIPT_DIR/../../../../../../../../infra/environment/db/postgres/setup"
export INFRA_DB_SETUP_DIR

"$SCRIPT_DIR/setup_auth.docker.sh"
