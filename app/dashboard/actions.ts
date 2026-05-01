"use server";

import { db } from "@/db";
import { user, salaries, auditLogs } from "@/db/schema"; // Removed account
import { eq } from "drizzle-orm";
// Removed bcrypt & randomUUID
import { revalidatePath } from "next/cache";
import { formatINR } from "@/lib/utils";
import { withAdminAuth } from "@/lib/safe-action";
import { parseWithZod } from "@conform-to/zod";
import { addEmployeeSchema } from "./schemas";
import { auth } from "@/auth"; // Added auth

export const addEmployee = withAdminAuth(
  async (prevState: unknown, formData: FormData, session) => {
    const actorId = session.user.id;
    const submission = parseWithZod(formData, { schema: addEmployeeSchema });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const { name, email, password: rawPassword, role } = submission.value;

    try {
      // 1. Let Better Auth handle the secure creation and hashing!
      // (We intentionally DO NOT pass `headers()` so the Admin isn't logged out)
      const authResponse = await auth.api.signUpEmail({
        body: {
          name,
          email,
          password: rawPassword,
        },
      });

      if (!authResponse?.user) {
        return submission.reply({ formErrors: ["Failed to create identity."] });
      }

      const newUserId = authResponse.user.id;

      // 2. Run our custom business logic (Role & Auditing)
      await db.batch([
        db.update(user)
          .set({ role })
          .where(eq(user.id, newUserId)),
        db.insert(auditLogs).values({
          actorId,
          actionType: "CREATE_EMPLOYEE",
          description: `Created a new ${role} account for ${name} (${email}).`,
        }),
      ]);

      revalidatePath("/dashboard");
      return {
        ...submission.reply({ resetForm: true }),
        successMessage: "Employee created successfully!",
      };
    } catch (error: unknown) {
      console.error("Add Employee Error:", error);
      return submission.reply({ 
        formErrors: ["Failed to create employee. This email might already exist."] 
      });
    }
  },
);

export const assignSalary = withAdminAuth(
  async (prevState: unknown, formData: FormData, session) => {
    const actorId = session.user.id;
    const employeeId = formData.get("employeeId") as string;
    const baseAmount = parseFloat(formData.get("baseAmount") as string);
    const bonus = parseFloat(formData.get("bonus") as string) || 0;
    const effectiveDate = formData.get("effectiveDate") as string;

    if (!employeeId || isNaN(baseAmount) || !effectiveDate) {
      return { error: "Missing required fields." };
    }

    try {
      const baseInCents = Math.round(baseAmount * 100);
      const bonusInCents = Math.round(bonus * 100);

      const targetEmployee = await db.query.user.findFirst({
        where: eq(user.id, employeeId),
        columns: { name: true },
      });

      if (!targetEmployee) return { error: "Employee not found." };

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
      return { success: "Salary assigned successfully!", timestamp: Date.now() };
    } catch (error) {
      return { error: "Failed to assign salary to the database." };
    }
  },
);