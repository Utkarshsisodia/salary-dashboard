// app/dashboard/actions.ts
'use server';

import { db } from '@/db';
import { employees, salaries, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { signOut, auth } from '@/auth';
import { formatINR } from '@/lib/utils'; // For nicely formatted log descriptions

export async function logOut() {
  await signOut({ redirectTo: '/login' });
}

export async function addEmployee(prevState: unknown, formData: FormData) {
  // 1. Get the current logged-in admin's session
  const session = await auth();
  const actorId = session?.user?.id;

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

    // --- NEW: Write to the Audit Log ---
    if (actorId) {
      await db.insert(auditLogs).values({
        actorId,
        actionType: 'CREATE_EMPLOYEE',
        description: `Created a new ${role} account for ${name} (${email}).`,
      });
    }

    revalidatePath('/dashboard');
    return { success: 'Employee created successfully!' };
    
  } catch (error: unknown) {
    const dbError = error as { code?: string };
    if (dbError.code === '23505') {
      return { error: 'An employee with this email already exists.' };
    }
    return { error: 'Failed to save employee to the database.' };
  }
}

export async function assignSalary(prevState: unknown, formData: FormData) {
  // 1. Get the current logged-in admin's session
  const session = await auth();
  const actorId = session?.user?.id;

  const employeeId = formData.get('employeeId') as string;
  const baseAmount = parseFloat(formData.get('baseAmount') as string);
  const bonus = parseFloat(formData.get('bonus') as string) || 0;
  const effectiveDate = formData.get('effectiveDate') as string;

  if (!employeeId || isNaN(baseAmount) || !effectiveDate) {
    return { error: 'Missing required fields.' };
  }

  try {
    const baseInCents = Math.round(baseAmount * 100);
    const bonusInCents = Math.round(bonus * 100);

    await db.insert(salaries).values({
      employeeId,
      baseAmount: baseInCents, 
      bonus: bonusInCents,
      effectiveDate: new Date(effectiveDate),
    });

    // --- NEW: Write to the Audit Log ---
    if (actorId) {
      // Fetch the employee's name so our log description is human-readable
      const targetEmployee = await db.query.employees.findFirst({
        where: eq(employees.id, employeeId),
        columns: { name: true },
      });

      if (targetEmployee) {
        await db.insert(auditLogs).values({
          actorId,
          actionType: 'UPDATE_SALARY',
          description: `Assigned a base salary of ${formatINR(baseInCents)} with a ${formatINR(bonusInCents)} bonus to ${targetEmployee.name}.`,
        });
      }
    }

    revalidatePath('/dashboard');
    return { success: 'Salary assigned successfully!', timestamp: Date.now() };
  } catch (error) {
    console.error('Failed to assign salary:', error);
    return { error: 'Failed to assign salary to the database.' };
  }
}