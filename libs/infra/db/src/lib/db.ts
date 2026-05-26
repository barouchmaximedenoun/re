import {Pool} from "pg";

/* old deprecated
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
}); 
*/
export function getDb() {
    return  new Pool({
      connectionString: process.env.DATABASE_URL,
    });
}