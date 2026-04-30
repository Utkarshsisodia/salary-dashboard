"use server";

import { db } from "@/db";
import { employees, salaries, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { formatINR } from "@/lib/utils";
import { withAdminAuth } from "@/lib/safe-action";
import { parseWithZod } from "@conform-to/zod";
import { addEmployeeSchema } from "./schemas";

export async function logOut() {
  await signOut({ redirectTo: "/login" });
}


export const addEmployee = withAdminAuth(
  async (prevState: unknown, formData: FormData, session) => {
    const actorId = session.user.id;

    // 1. Automatically parse and validate the incoming FormData
    const submission = parseWithZod(formData, { schema: addEmployeeSchema });

    // 2. If validation fails, return the error states back to Conform
    if (submission.status !== "success") {
      return submission.reply();
    }

    // 3. Destructure the strongly-typed, validated data
    const { name, email, password: rawPassword, role } = submission.value;

    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(rawPassword, salt);

      await db.batch([
        db.insert(employees).values({ name, email, passwordHash, role }),
        db.insert(auditLogs).values({
          actorId,
          actionType: "CREATE_EMPLOYEE",
          description: `Created a new ${role} account for ${name} (${email}).`,
        }),
      ]);

      revalidatePath("/dashboard");

      // 4. Return success to reset the form, attaching a custom success message
      return {
        ...submission.reply({ resetForm: true }),
        successMessage: "Employee created successfully!",
      };
    } catch (error: unknown) {
      const dbError = error as { code?: string };
      if (dbError.code === "23505") {
        // Form-level error for duplicate emails
        return submission.reply({
          formErrors: ["An employee with this email already exists."],
        });
      }
      console.error("Failed to add employee:", error);
      return submission.reply({
        formErrors: ["Failed to save employee to the database."],
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

      // 1. Fetch the target employee FIRST since we can't do it inside the batch
      const targetEmployee = await db.query.employees.findFirst({
        where: eq(employees.id, employeeId),
        columns: { name: true },
      });

      if (!targetEmployee) {
        return { error: "Employee not found." };
      }

      // 2. Run both mutations in a single atomic HTTP request using db.batch
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
      return {
        success: "Salary assigned successfully!",
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Failed to assign salary:", error);
      return { error: "Failed to assign salary to the database." };
    }
  },
);
