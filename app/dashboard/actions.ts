'use server';

import { db } from '@/db';
import { employees, salaries, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { signOut } from '@/auth';
import { formatINR } from '@/lib/utils';
import { withAdminAuth } from '@/lib/safe-action';

export async function logOut() {
  await signOut({ redirectTo: '/login' });
}

export const addEmployee = withAdminAuth(async (prevState: unknown, formData: FormData, session) => {
  const actorId = session.user.id;
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

    // Run both inserts within a transaction
    await db.transaction(async (tx) => {
      await tx.insert(employees).values({
        name,
        email,
        passwordHash,
        role,
      });

      await tx.insert(auditLogs).values({
        actorId,
        actionType: 'CREATE_EMPLOYEE',
        description: `Created a new ${role} account for ${name} (${email}).`,
      });
    });

    revalidatePath('/dashboard');
    return { success: 'Employee created successfully!' };
    
  } catch (error: unknown) {
    const dbError = error as { code?: string };
    if (dbError.code === '23505') {
      return { error: 'An employee with this email already exists.' };
    }
    console.error('Failed to add employee:', error);
    return { error: 'Failed to save employee to the database.' };
  }
});

export const assignSalary = withAdminAuth(async (prevState: unknown, formData: FormData, session) => {
  const actorId = session.user.id;
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

    // Run salary insertion and audit logging within a transaction
    await db.transaction(async (tx) => {
      await tx.insert(salaries).values({
        employeeId,
        baseAmount: baseInCents, 
        bonus: bonusInCents,
        effectiveDate: new Date(effectiveDate),
      });

      // Must use 'tx' to query within the transaction boundary
      const targetEmployee = await tx.query.employees.findFirst({
        where: eq(employees.id, employeeId),
        columns: { name: true },
      });

      if (targetEmployee) {
        await tx.insert(auditLogs).values({
          actorId,
          actionType: 'UPDATE_SALARY',
          description: `Assigned a base salary of ${formatINR(baseInCents)} with a ${formatINR(bonusInCents)} bonus to ${targetEmployee.name}.`,
        });
      }
    });

    revalidatePath('/dashboard');
    return { success: 'Salary assigned successfully!', timestamp: Date.now() };
  } catch (error) {
    console.error('Failed to assign salary:', error);
    return { error: 'Failed to assign salary to the database.' };
  }
});