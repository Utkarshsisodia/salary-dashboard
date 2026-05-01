// db/seed.ts
import * as dotenv from 'dotenv';

// 1. Load the environment variables FIRST
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('Seeding database with Better Auth...');

  try {
    // 2. Dynamically import everything else AFTER the env vars are loaded
    const { db } = await import('./index');
    const { user } = await import('./schema');
    const { eq } = await import('drizzle-orm');
    const { auth } = await import('../auth');

    // 3. Use Better Auth to securely create the user and hash the password
    const authResponse = await auth.api.signUpEmail({
      body: {
        name: 'Admin User',
        email: 'admin@company.com',
        password: 'admin123',
      },
    });

    if (!authResponse) {
        throw new Error("Failed to create user via Better Auth");
    }

    // 4. Update our custom 'role' column
    await db.update(user)
      .set({ role: 'admin' })
      .where(eq(user.email, 'admin@company.com'));

    console.log('Admin user created successfully!');
    console.log('Email: admin@company.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

main();