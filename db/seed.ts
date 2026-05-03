import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  console.log('Seeding database with Better Auth...');

  try {
    const { db } = await import('./index');
    const { user } = await import('./schema');
    const { eq } = await import('drizzle-orm');
    const { auth } = await import('../auth');

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