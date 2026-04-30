"use client";

import { useState, useActionState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { assignSalary } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ActionState = {
  error?: string;
  success?: string;
  timestamp?: number;
} | null;

export function AssignSalaryModal({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // Open by default since it only renders when the URL param is present
  const [open, setOpen] = useState(true);

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Clear the query parameter without scrolling to the top of the page
      router.push(pathname, { scroll: false });
    }
  };

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prevState, formData) => {
      // FIX: Cast the result here before trying to read .success
      const result = (await assignSalary(prevState, formData)) as ActionState;

      if (result?.success) {
        handleClose(false);
      }

      return result;
    },
    null,
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Salary to {employeeName}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-4">
          <input type="hidden" name="employeeId" value={employeeId} />

          <div className="space-y-2">
            <Label htmlFor="baseAmount">Base Amount (Annual ₹)</Label>
            <Input
              id="baseAmount"
              name="baseAmount"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="750000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonus">Bonus (₹)</Label>
            <Input
              id="bonus"
              name="bonus"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="effectiveDate">Effective Date</Label>
            <Input
              id="effectiveDate"
              name="effectiveDate"
              type="date"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving..." : "Save Salary"}
          </Button>

          {state?.error && (
            <p className="text-sm text-red-500 font-medium text-center">
              {state.error}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
