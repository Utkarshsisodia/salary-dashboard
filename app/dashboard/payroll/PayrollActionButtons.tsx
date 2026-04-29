// app/dashboard/payroll/PayrollActionButtons.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Calculator } from "lucide-react";
import { formatINR } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PayrollData = {
  name: string;
  email: string;
  baseAmount: number;
  bonus: number;
}[];

export function PayrollActionButtons({ data }: { data: PayrollData }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleExportCSV = () => {
    const headers = [
      "Employee Name",
      "Email",
      "Annual Base",
      "Assigned Bonus",
      "Est. Monthly Payout",
    ];

    const rows = data.map((emp) => {
      const monthlyBase = emp.baseAmount / 12;
      // We must wrap values in quotes so the commas in formatINR don't break the CSV columns
      const quote = (val: string) => `"${val}"`;

      return [
        quote(emp.name),
        quote(emp.email),
        quote(formatINR(emp.baseAmount)),
        quote(formatINR(emp.bonus)),
        quote(formatINR(monthlyBase)),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `payroll_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRunPayroll = async () => {
    setIsProcessing(true);
    // Simulate a network request for processing payments
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setSuccessMessage(
      `Successfully processed payroll for ${data.length} employees.`,
    );

    // Reset state after 3 seconds so the dialog can be closed cleanly
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  return (
    <div className="flex justify-end gap-2 mb-2">
      <Button variant="outline" onClick={handleExportCSV}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>

      <Dialog>
        <DialogTrigger render={<Button />}>
          <Calculator className="mr-2 h-4 w-4" />
          Run Payroll
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Company Payroll</DialogTitle>
            <DialogDescription>
              Are you sure you want to run payroll for {data.length} active
              employees? This will lock the current period and initiate fund
              transfers.
            </DialogDescription>
          </DialogHeader>

          {successMessage ? (
            <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium text-center">
              {successMessage}
            </div>
          ) : (
            <DialogFooter>
              <Button onClick={handleRunPayroll} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Confirm & Run"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
