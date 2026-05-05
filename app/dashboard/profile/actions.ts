"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { protectedActionClient } from "@/lib/safe-action";
import { updatePasswordSchema } from "./schemas";

export const updatePassword = protectedActionClient
  .schema(updatePasswordSchema)
  .action(async ({ parsedInput }) => {
    const { currentPassword, newPassword } = parsedInput;

    try {
      await auth.api.changePassword({
        headers: await headers(),
        body: {
          newPassword: newPassword,
          currentPassword: currentPassword,
          revokeOtherSessions: true,
        },
      });

      return { successMessage: "Password updated successfully!" };
    } catch (error) {
      console.error("Failed to update password:", error);
      const err = error as { body?: { message?: string }; message?: string };
      throw new Error(err?.body?.message || err?.message || "Incorrect current password.");
    }
  });