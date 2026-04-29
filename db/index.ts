import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Ensure the connection string is available
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables');
}

const sql = neon(process.env.DATABASE_URL);

// Export the db instance with the schema attached
export const db = drizzle(sql, { schema });