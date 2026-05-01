"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { parseWithZod } from "@conform-to/zod";
import { updatePasswordSchema } from "./schemas";

export async function updatePassword(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const submission = parseWithZod(formData, { schema: updatePasswordSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { currentPassword, newPassword } = submission.value;
  const userId = session.user.id;

  try {
    const user = await db.query.employees.findFirst({
      where: eq(employees.id, userId),
    });

    if (!user) return submission.reply({ formErrors: ["User not found."] });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return submission.reply({
        fieldErrors: { currentPassword: ["Incorrect current password."] }
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.update(employees)
      .set({ passwordHash: newHash })
      .where(eq(employees.id, userId));

    return {
      ...submission.reply({ resetForm: true }),
      successMessage: "Password updated successfully!",
    };
  } catch (error) {
    console.error("Failed to update password:", error);
    return submission.reply({ formErrors: ["An error occurred while updating."] });
  }
}