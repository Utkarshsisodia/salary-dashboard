"use client";

import { useState, useActionState, useEffect } from "react";
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

export function AssignSalaryModal({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(assignSalary, null);

  // Automatically close the modal when the server action succeeds
  useEffect(() => {
    if (state?.timestamp) {
      // <-- Listen for the timestamp
      setOpen(false);
    }
  }, [state?.timestamp]);

  return (
    <>
      {/* 1. Standard Button toggles the 'open' state */}
      <Button
        variant="outline"
        className="w-full mt-4"
        onClick={() => setOpen(true)}
      >
        Update Salary
      </Button>

      {/* 2. Dialog listens to the 'open' state without needing a Trigger */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
                placeholder="75000"
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
    </>
  );
}
