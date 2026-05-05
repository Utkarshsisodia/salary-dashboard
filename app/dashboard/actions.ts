"use server";

import { db } from "@/db";
import { user, salaries, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { formatINR } from "@/lib/utils";
import { adminActionClient } from "@/lib/safe-action";
import { addEmployeeSchema, assignSalarySchema } from "./schemas";
import { auth } from "@/auth";

export const addEmployee = adminActionClient
  .schema(addEmployeeSchema)
  .action(async ({ parsedInput, ctx }) => {
    // 1. Zod already validated this, and ctx.user is guaranteed by our middleware!
    const { name, email, password: rawPassword, role } = parsedInput;
    const actorId = ctx.user.id;

    try {
      const authResponse = await auth.api.signUpEmail({
        body: { name, email, password: rawPassword },
      });

      if (!authResponse?.user) {
        throw new Error("Failed to create identity.");
      }

      const newUserId = authResponse.user.id;

      await db.batch([
        db.update(user).set({ role }).where(eq(user.id, newUserId)),
        db.insert(auditLogs).values({
          actorId,
          actionType: "CREATE_EMPLOYEE",
          description: `Created a new ${role} account for ${name} (${email}).`,
        }),
      ]);

      revalidatePath("/dashboard");
      return { successMessage: "Employee created successfully!" };
      
    } catch (error) {
      console.error("Add Employee Error:", error);
      throw new Error("Failed to create employee. This email might already exist.");
    }
  });

export const assignSalary = adminActionClient
  .schema(assignSalarySchema)
  .action(async ({ parsedInput, ctx }) => {
    const { employeeId, baseAmount, bonus, effectiveDate } = parsedInput;
    const actorId = ctx.user.id;

    try {
      const baseInCents = Math.round(baseAmount * 100);
      const bonusInCents = Math.round(bonus * 100);

      const targetEmployee = await db.query.user.findFirst({
        where: eq(user.id, employeeId),
        columns: { name: true },
      });

      if (!targetEmployee) {
        throw new Error("Employee not found.");
      }

      await db.batch([
        db.insert(salaries).values({
          employeeId,
          baseAmount: baseInCents,
          bonus: bonusInCents,
          effectiveDate: new Date(effectiveDate),
        }),
        db.insert(auditLogs).values({
          actorId,
          actionType: "UPDATE_SALARY",
          description: `Assigned a base salary of ${formatINR(baseInCents)} with a ${formatINR(bonusInCents)} bonus to ${targetEmployee.name}.`,
        }),
      ]);

      revalidatePath("/dashboard");
      return { successMessage: "Salary assigned successfully!" };
      
    } catch (error) {
      console.error("Assign Salary Error:", error); // Now it's used!
      throw new Error("Failed to assign salary to the database.");
    }
  });