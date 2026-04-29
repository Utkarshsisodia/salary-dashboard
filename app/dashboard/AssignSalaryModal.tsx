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
  DialogTrigger, // Make sure this is imported!
} from "@/components/ui/dialog";

export function AssignSalaryModal({
  employeeId,
  employeeName,
  trigger, // ADDED: Accepts a custom trigger like our Dropdown Menu
}: {
  employeeId: string;
  employeeName: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(assignSalary, null);

  useEffect(() => {
    if (state?.timestamp) {
      setOpen(false);
    }
  }, [state?.timestamp]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* If a custom trigger is provided (like our Dropdown Menu), render it. 
        Otherwise, render a standard button and open the modal manually via onClick! 
      */}
      {trigger ? (
        trigger
      ) : (
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => setOpen(true)}
        >
          Update Salary
        </Button>
      )}

      <DialogContent className="sm:max-w-106.25">
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
