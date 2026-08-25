
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_roles WHERE rolname = '${ADMIN_ROLE}'
    ) THEN
        CREATE ROLE ${ADMIN_ROLE} NOLOGIN;
    END IF;
END
$$;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_roles WHERE rolname = '${MIGRATION_ROLE}'
    ) THEN
        CREATE ROLE ${MIGRATION_ROLE} NOLOGIN;
    END IF;
END
$$;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_roles WHERE rolname = '${RW_ROLE}'
    ) THEN
        CREATE ROLE ${RW_ROLE} NOLOGIN;
    END IF;
END
$$;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_roles WHERE rolname = '${RO_ROLE}'
    ) THEN
        CREATE ROLE ${RO_ROLE} NOLOGIN;
    END IF;
END
$$;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_roles WHERE rolname = '${ADMIN_USER}'
    ) THEN
        CREATE ROLE ${ADMIN_USER}
            LOGIN
            PASSWORD '${ADMIN_PASSWORD}';
    END IF;
END
$$;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_roles WHERE rolname = '${MIGRATION_USER}'
    ) THEN
        CREATE ROLE ${MIGRATION_USER}
            LOGIN
            PASSWORD '${MIGRATION_PASSWORD}';
    END IF;
END
$$;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_roles WHERE rolname = '${APP_USER}'
    ) THEN
        CREATE ROLE ${APP_USER}
            LOGIN
            PASSWORD '${APP_PASSWORD}';
    END IF;
END
$$;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_roles WHERE rolname = '${READONLY_USER}'
    ) THEN
        CREATE ROLE ${READONLY_USER}
            LOGIN
            PASSWORD '${READONLY_PASSWORD}';
    END IF;
END
$$;

GRANT ${ADMIN_ROLE} TO ${ADMIN_USER};

GRANT ${MIGRATION_ROLE} TO ${MIGRATION_USER};

GRANT ${RW_ROLE} TO ${APP_USER};

GRANT ${RO_ROLE} TO ${READONLY_USER};