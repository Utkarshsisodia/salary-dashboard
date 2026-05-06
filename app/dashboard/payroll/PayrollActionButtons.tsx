"use client";

import { useState, useRef, useEffect } from "react";
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
  const timerRef = useRef<NodeJS.Timeout>(null);

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
      const sanitize = (val: string) => `"${val.replace(/"/g, '""')}"`;

      return [
        sanitize(emp.name),
        sanitize(emp.email),
        sanitize(formatINR(emp.baseAmount)),
        sanitize(formatINR(emp.bonus)),
        sanitize(formatINR(monthlyBase)),
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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleRunPayroll = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Artificial delay is fine
    setIsProcessing(false);
    setSuccessMessage(`Successfully processed payroll for ${data.length} employees.`);

    timerRef.current = setTimeout(() => {
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
