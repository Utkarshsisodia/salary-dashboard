"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation"; // Added useSearchParams
import { useAction } from "next-safe-action/hooks";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Hook into the search params
  const [open, setOpen] = useState(true);
  const timerRef = useRef<NodeJS.Timeout>(null);

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      const currentParams = new URLSearchParams(searchParams.toString());
      
      currentParams.delete("assignId");
      
      const queryString = currentParams.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      
      router.push(newUrl, { scroll: false });
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const { execute, status, result } = useAction(assignSalary, {
    onSuccess: () => {
      timerRef.current = setTimeout(() => handleClose(false), 800);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    execute({
      employeeId,
      baseAmount: Number(formData.get("baseAmount")),
      bonus: Number(formData.get("bonus") || 0),
      effectiveDate: formData.get("effectiveDate") as string,
    });
  };
  
  const isPending = status === "executing";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Salary to {employeeName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="baseAmount">Base Amount (Annual ₹)</Label>
            <Input
              name="baseAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="750000"
            />
            <div className="text-xs text-red-500 min-h-4">
              {result.validationErrors?.baseAmount?._errors?.[0]}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonus">Bonus (₹)</Label>
            <Input
              name="bonus"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
            />
            <div className="text-xs text-red-500 min-h-4">
              {result.validationErrors?.bonus?._errors?.[0]}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="effectiveDate">Effective Date</Label>
            <Input name="effectiveDate" type="date" />
            <div className="text-xs text-red-500 min-h-4">
              {result.validationErrors?.effectiveDate?._errors?.[0]}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving..." : "Save Salary"}
          </Button>

          {result.serverError && (
            <p className="text-sm text-red-500 font-medium text-center">
              {result.serverError}
            </p>
          )}

          {result.data?.successMessage && (
            <p className="text-sm text-green-600 font-medium text-center">
              {result.data.successMessage}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}