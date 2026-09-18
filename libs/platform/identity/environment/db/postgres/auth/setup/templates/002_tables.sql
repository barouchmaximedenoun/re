
-- ============================================================
-- AUTH TABLES
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.users (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,

    name TEXT,

    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    lock_until TIMESTAMPTZ,

    last_seen TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_last_seen
    ON ${SCHEMA_NAME}.users (last_seen);


-- ============================================================
-- LOGIN ATTEMPTS
--
-- Operational security data.
-- Old records are removed by the auth cleanup job.
-- ============================================================

CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.login_attempts (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    email TEXT NOT NULL UNIQUE,

    attempts INTEGER NOT NULL DEFAULT 0,

    lock_until TIMESTAMPTZ,

    last_attempt TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_lock_until
    ON ${SCHEMA_NAME}.login_attempts (lock_until);

CREATE INDEX IF NOT EXISTS idx_login_attempts_last_attempt
    ON ${SCHEMA_NAME}.login_attempts (last_attempt);


-- ============================================================
-- USER DEVICES
-- ============================================================

CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.user_devices (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    user_id UUID NOT NULL
        REFERENCES ${SCHEMA_NAME}.users(id)
        ON DELETE CASCADE,

    ip_address INET,

    user_agent TEXT,

    browser_name TEXT,

    os_name TEXT,

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user_id
    ON ${SCHEMA_NAME}.user_devices (user_id);

CREATE INDEX IF NOT EXISTS idx_user_devices_lookup
    ON ${SCHEMA_NAME}.user_devices (
        user_id,
        ip_address,
        browser_name,
        os_name
    );


-- ============================================================
-- DEVICE VERIFICATION OTPs
--
-- Short-lived operational data.
-- Expired/used records are removed by the cleanup job.
-- ============================================================

CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.device_verification_otps (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    user_id UUID NOT NULL
        REFERENCES ${SCHEMA_NAME}.users(id)
        ON DELETE CASCADE,

    device_id UUID NOT NULL
        REFERENCES ${SCHEMA_NAME}.user_devices(id)
        ON DELETE CASCADE,

    otp_code_hash TEXT NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    is_used BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_device_verification_otps_device_id
    ON ${SCHEMA_NAME}.device_verification_otps (device_id);

CREATE INDEX IF NOT EXISTS idx_device_verification_otps_user_id
    ON ${SCHEMA_NAME}.device_verification_otps (user_id);

CREATE INDEX IF NOT EXISTS idx_device_verification_otps_expires_at
    ON ${SCHEMA_NAME}.device_verification_otps (expires_at);


-- ============================================================
-- REFRESH TOKENS
--
-- PostgreSQL is the source of truth.
--
-- token_hash:
--   Hash of the opaque refresh token.
--   The raw refresh token is never stored in PostgreSQL.
--
-- family_id:
--   Identifies the refresh-token/session family.
--
-- parent_id:
--   Identifies the token from which this token was rotated.
--
-- This supports Refresh Token Rotation (RTR) and reuse detection.
-- ============================================================

CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    user_id UUID NOT NULL
        REFERENCES ${SCHEMA_NAME}.users(id)
        ON DELETE CASCADE,

    family_id UUID NOT NULL,

    parent_id UUID
        REFERENCES ${SCHEMA_NAME}.refresh_tokens(id)
        ON DELETE SET NULL,

    token_hash TEXT NOT NULL UNIQUE,

    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,

    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
    ON ${SCHEMA_NAME}.refresh_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family_id
    ON ${SCHEMA_NAME}.refresh_tokens (family_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_parent_id
    ON ${SCHEMA_NAME}.refresh_tokens (parent_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at
    ON ${SCHEMA_NAME}.refresh_tokens (expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_family
    ON ${SCHEMA_NAME}.refresh_tokens (user_id, family_id);


-- ============================================================
-- OAUTH ACCOUNTS
--
-- Kept now so the schema is ready for OAuth providers later.
-- ============================================================

CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.oauth_accounts (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    user_id UUID NOT NULL
        REFERENCES ${SCHEMA_NAME}.users(id)
        ON DELETE CASCADE,

    provider TEXT NOT NULL,

    provider_account_id TEXT NOT NULL,
--  access_token TEXT,
--  refresh_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (provider, provider_account_id)
);
