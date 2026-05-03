"use client";

import { useState, useActionState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { SubmissionResult } from "@conform-to/react";

import { assignSalary } from "./actions";
import { assignSalarySchema } from "./schemas"; // Make sure this is exported from schemas.ts!
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormState =
  | (SubmissionResult<string[]> & { successMessage?: string })
  | undefined
  | null;

export function AssignSalaryModal({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      router.push(pathname, { scroll: false });
    }
  };

  const [lastResult, formAction, isPending] = useActionState<
    FormState,
    FormData
  >(async (prevState, payload) => {
    const result = (await assignSalary(prevState, payload)) as FormState;

    if (
      result &&
      typeof result === "object" &&
      "successMessage" in result &&
      result.successMessage
    ) {
      setTimeout(() => handleClose(false), 800);
    }

    return result;
  }, undefined);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: assignSalarySchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Salary to {employeeName}</DialogTitle>
        </DialogHeader>

        <form
          {...getFormProps(form)}
          action={formAction}
          className="space-y-4 mt-4"
        >
          <input type="hidden" name="employeeId" value={employeeId} />

          <div className="space-y-2">
            <Label htmlFor={fields.baseAmount.id}>Base Amount (Annual ₹)</Label>
            <Input
              {...getInputProps(fields.baseAmount, { type: "number" })}
              min="0"
              step="0.01"
              placeholder="750000"
            />
            <div className="text-xs text-red-500 min-h-4">
              {fields.baseAmount.errors}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.bonus.id}>Bonus (₹)</Label>
            <Input
              {...getInputProps(fields.bonus, { type: "number" })}
              min="0"
              step="0.01"
              defaultValue={fields.bonus.initialValue || "0"}
            />
            <div className="text-xs text-red-500 min-h-4">
              {fields.bonus.errors}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.effectiveDate.id}>Effective Date</Label>
            <Input {...getInputProps(fields.effectiveDate, { type: "date" })} />
            <div className="text-xs text-red-500 min-h-4">
              {fields.effectiveDate.errors}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving..." : "Save Salary"}
          </Button>

          {form.errors && (
            <p className="text-sm text-red-500 font-medium text-center">
              {form.errors}
            </p>
          )}

          {lastResult?.successMessage && (
            <p className="text-sm text-green-600 font-medium text-center">
              {lastResult.successMessage}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
