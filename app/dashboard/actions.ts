'use server';
import { db } from '@/db';
import { employees, salaries } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { signOut } from '@/auth';

export async function logOut() {
  await signOut({ redirectTo: '/login' });
}
export async function addEmployee(prevState: unknown, formData: FormData) {
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
    
  } catch (error:any) {
    // 23505 is the Postgres error code for a Unique Violation
    if (error.code === '23505') {
      return { error: 'An employee with this email already exists.' };
    }
    return { error: 'Failed to save employee to the database.' };
  }
}
export async function assignSalary(prevState: unknown, formData: FormData) {
  const employeeId = formData.get('employeeId') as string;
  const baseAmount = parseFloat(formData.get('baseAmount') as string);
  const bonus = parseFloat(formData.get('bonus') as string) || 0;
  const effectiveDate = formData.get('effectiveDate') as string;

  if (!employeeId || isNaN(baseAmount) || !effectiveDate) {
    return { error: 'Missing required fields.' };
  }

  try {
    await db.insert(salaries).values({
      employeeId,
      // Multiply by 100 to store as cents (e.g. $75,000.00 -> 7500000)
      baseAmount: Math.round(baseAmount * 100), 
      bonus: Math.round(bonus * 100),
      effectiveDate: new Date(effectiveDate),
    });

    revalidatePath('/dashboard');
    return { success: 'Salary assigned successfully!',timestamp: Date.now() };
  } catch (error) {
    console.error('Failed to assign salary:', error);
    return { error: 'Failed to assign salary to the database.' };
  }
}