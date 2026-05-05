"use client";

import { useAction } from "next-safe-action/hooks";
import { updatePassword } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const { execute, status, result } = useAction(updatePassword, {
    onSuccess: () => {
      formRef.current?.reset();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    execute({
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    });
  };

  const isPending = status === "executing";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input name="currentPassword" type="password" />
        <div className="text-xs text-red-500 min-h-4">
          {result.validationErrors?.currentPassword?._errors?.[0]}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input name="newPassword" type="password" />
        <div className="text-xs text-red-500 min-h-4">
          {result.validationErrors?.newPassword?._errors?.[0]}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input name="confirmPassword" type="password" />
        <div className="text-xs text-red-500 min-h-4">
          {result.validationErrors?.confirmPassword?._errors?.[0]}
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Updating..." : "Update Password"}
      </Button>

      {result.serverError && (
        <p className="text-sm text-red-500 font-medium">{result.serverError}</p>
      )}

      {result.data?.successMessage && (
        <p className="text-sm text-green-600 font-medium p-3 bg-green-50 rounded-lg border border-green-200">
          {result.data.successMessage}
        </p>
      )}
    </form>
  );
}