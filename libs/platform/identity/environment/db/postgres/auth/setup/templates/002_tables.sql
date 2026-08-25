CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.users (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  email TEXT UNIQUE,
  password_hash TEXT,
  name TEXT,
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ${SCHEMA_NAME}.oauth_accounts (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID REFERENCES ${SCHEMA_NAME}.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(provider, provider_user_id)
);