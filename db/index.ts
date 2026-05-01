// db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables');
}

const sqlClient = neon(process.env.DATABASE_URL);

export const db = drizzle(sqlClient, { schema });

/**
 * Executes a query with RLS context using Drizzle's HTTP batching.
 * This sends both statements in a single stateless HTTP request!
 */
export const withRLS = async <T>(
  userId: string,
  // Extract the exact type Drizzle expects for a batch item
  query: Parameters<typeof db.batch>[0][number] 
): Promise<T> => {
  // Omit the first variable by leaving the space before the comma blank
  const [, result] = await db.batch([
    // 1. Set the RLS context
    db.execute(sql`SELECT set_config('app.current_user_id', ${userId}, true)`),
    // 2. Run the actual query
    query,
  ]);
  
  // Return only the result of the second query
  return result as T;
};