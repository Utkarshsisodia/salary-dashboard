import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables');
}

const sqlClient = neon(process.env.DATABASE_URL);

export const db = drizzle(sqlClient, { schema });


export const withRLS = async <T>(
  userId: string,
  query: Parameters<typeof db.batch>[0][number] 
): Promise<T> => {
  const [, result] = await db.batch([
    db.execute(sql`SELECT set_config('app.current_user_id', ${userId}, true)`),
    query,
  ]);
  
  return result as T;
};