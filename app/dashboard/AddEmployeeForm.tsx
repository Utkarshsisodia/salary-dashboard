"use client";

import { useAction } from "next-safe-action/hooks";
import { addEmployee } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export function AddEmployeeForm() {
  const formRef = useRef<HTMLFormElement>(null);

  // useAction gives us everything we need, plus a handy onSuccess callback!
  const { execute, status, result } = useAction(addEmployee, {
    onSuccess: () => {
      formRef.current?.reset();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // We pass the exact object our Zod schema expects
    execute({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as "admin" | "employee",
    });
  };

  const isPending = status === "executing";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="space-y-2 flex-1">
          <Label htmlFor="name">Full Name</Label>
          <Input name="name" type="text" placeholder="Jane Doe" />
          <div className="text-xs text-red-500 min-h-4">
            {result.validationErrors?.name?._errors?.[0]}
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <Label htmlFor="email">Email</Label>
          <Input name="email" type="email" placeholder="jane@company.com" />
          <div className="text-xs text-red-500 min-h-4">
            {result.validationErrors?.email?._errors?.[0]}
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <Label htmlFor="password">Temp Password</Label>
          <Input name="password" type="password" placeholder="Secret123!" />
          <div className="text-xs text-red-500 min-h-4">
            {result.validationErrors?.password?._errors?.[0]}
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <Label htmlFor="role">Role</Label>
          <select
            name="role"
            defaultValue="employee"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
          <div className="text-xs text-red-500 min-h-4">
            {result.validationErrors?.role?._errors?.[0]}
          </div>
        </div>

        <div className="pt-7">
          <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
            {isPending ? "Saving..." : "Create User"}
          </Button>
        </div>
      </div>

      {result.serverError && (
        <p className="text-sm text-red-500 font-medium">{result.serverError}</p>
      )}

      {result.data?.successMessage && (
        <p className="text-sm text-green-600 font-medium">
          {result.data.successMessage}
        </p>
      )}
    </form>
  );
}