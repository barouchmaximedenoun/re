import dotenv from 'dotenv';
import { getDb } from '@infra/db';

dotenv.config();

async function test() {
  //const result = await db.query('SELECT NOW()');
  const result = await getDb().query('SELECT NOW()');
  console.log(result.rows);
}

test();
