import { Pool, type PoolClient, type QueryResultRow } from 'pg';

let pool: Pool | undefined;

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  return new Pool({
    connectionString,
  });
}

export function getDb(): Pool {
  pool ??= createPool();

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[],
) {
  return getDb().query<T>(text, values);
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getDb().connect();

  try {
    await client.query('BEGIN');

    const result = await callback(client);

    await client.query('COMMIT');

    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function closeDb(): Promise<void> {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = undefined;
}
