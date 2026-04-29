import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import bcrypt from 'bcryptjs';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables manually for this script
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log('Seeding database...');

  // Hash the password 'admin123'
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  try {
    await db.insert(schema.employees).values({
      email: 'admin@company.com',
      passwordHash: passwordHash,
      name: 'Admin User',
      role: 'admin',
    });
    console.log('Admin user created successfully!');
    console.log('Email: admin@company.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

main();