INSERT INTO ${SCHEMA_NAME}.users (
  email,
  password_hash,
  name
) VALUES (
  'alice@example.com',
  '$2b$12$KIXQpQY9Q9Q9Q9Q9Q9Q9QeQ9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q',
  'Alice Martin'
) ON CONFLICT (email) DO NOTHING;;
