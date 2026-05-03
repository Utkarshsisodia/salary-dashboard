"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { parseWithZod } from "@conform-to/zod";
import { updatePasswordSchema } from "./schemas";

export async function updatePassword(prevState: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: updatePasswordSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { currentPassword, newPassword } = submission.value;

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: true,
      },
    });

    return {
      ...submission.reply({ resetForm: true }),
      successMessage: "Password updated successfully!",
    };
  } catch (error: unknown) {
    console.error("Failed to update password:", error);
    
    const err = error as { body?: { message?: string }; message?: string };
    const errorMessage = err?.body?.message || err?.message || "Incorrect current password.";
    
    return submission.reply({
      fieldErrors: { currentPassword: [errorMessage] },
    });
  }
}