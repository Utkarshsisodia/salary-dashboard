"use client";

import { useActionState } from "react";
import {
  useForm,
  getFormProps,
  getInputProps,
  getSelectProps,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { SubmissionResult } from "@conform-to/react";
import { addEmployee } from "./actions";
import { addEmployeeSchema } from "./schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FormState =
  | (SubmissionResult<string[]> & { successMessage?: string })
  | undefined
  | null;

export function AddEmployeeForm() {
  const [lastResult, formAction, isPending] = useActionState<
    FormState,
    FormData
  >(
    addEmployee as unknown as (
      state: FormState,
      payload: FormData,
    ) => Promise<FormState>,
    undefined,
  );

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: addEmployeeSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <form
      {...getFormProps(form)}
      action={formAction}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="space-y-2 flex-1">
          <Label htmlFor={fields.name.id}>Full Name</Label>
          <Input
            {...getInputProps(fields.name, { type: "text" })}
            placeholder="Jane Doe"
          />
          <div className="text-xs text-red-500 min-h-4">
            {fields.name.errors}
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <Label htmlFor={fields.email.id}>Email</Label>
          <Input
            {...getInputProps(fields.email, { type: "email" })}
            placeholder="jane@company.com"
          />
          <div className="text-xs text-red-500 min-h-4">
            {fields.email.errors}
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <Label htmlFor={fields.password.id}>Temp Password</Label>
          <Input
            {...getInputProps(fields.password, { type: "password" })}
            placeholder="Secret123!"
          />
          <div className="text-xs text-red-500 min-h-4">
            {fields.password.errors}
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <Label htmlFor={fields.role.id}>Role</Label>
          <select
            {...getSelectProps(fields.role)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
          <div className="text-xs text-red-500 min-h-4">
            {fields.role.errors}
          </div>
        </div>

        <div className="pt-7">
          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Create User"}
          </Button>
        </div>
      </div>

      {form.errors && (
        <p className="text-sm text-red-500 font-medium">{form.errors}</p>
      )}

      {lastResult?.successMessage && (
        <p className="text-sm text-green-600 font-medium">
          {lastResult?.successMessage}
        </p>
      )}
    </form>
  );
}
