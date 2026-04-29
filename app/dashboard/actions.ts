'use server';
import { db } from '@/db';
import { employees } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { signOut } from '@/auth';

export async function logOut() {
  await signOut({ redirectTo: '/login' });
}
export async function addEmployee(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const rawPassword = formData.get('password') as string;
  const role = formData.get('role') as 'admin' | 'employee';

  if (!name || !email || !rawPassword || !role) {
    return { error: 'All fields are required.' };
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    await db.insert(employees).values({
      name,
      email,
      passwordHash,
      role,
    });

    revalidatePath('/dashboard');
    return { success: 'Employee created successfully!' };
    
  } catch (error: any) {
    // 23505 is the Postgres error code for a Unique Violation
    if (error.code === '23505') {
      return { error: 'An employee with this email already exists.' };
    }
    return { error: 'Failed to save employee to the database.' };
  }
}