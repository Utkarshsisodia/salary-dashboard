import { db } from "@/db";
import { user, salaries } from "@/db/schema";
import { desc } from "drizzle-orm";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { Calculator, ReceiptText } from "lucide-react";

import { PayrollActionButtons } from "./PayrollActionButtons";

export default async function PayrollPage() {
  const data = await db.query.user.findMany({
    with: {
      salaries: {
        orderBy: [desc(salaries.effectiveDate), desc(salaries.createdAt)],
        limit: 1,
      },
    },
  });

  const activePayroll = data.filter((emp) => emp.salaries.length > 0);

  const payrollDataForClient = activePayroll.map(emp => ({
    name: emp.name,
    email: emp.email,
    baseAmount: emp.salaries[0].baseAmount,
    bonus: emp.salaries[0].bonus
  }));

  const totalMonthlyBase = activePayroll.reduce(
    (sum, emp) => sum + emp.salaries[0].baseAmount / 12, 
    0
  );
  
  const totalBonuses = activePayroll.reduce(
    (sum, emp) => sum + emp.salaries[0].bonus, 
    0
  );

  const averageMonthlySalary = activePayroll.length > 0 
    ? totalMonthlyBase / activePayroll.length 
    : 0;

  return (
    <div className="space-y-6">
      
      <PayrollActionButtons data={payrollDataForClient} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Run Rate</CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalMonthlyBase)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated base payout per month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonuses (Active)</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalBonuses)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sum of all currently assigned bonuses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Monthly Salary</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(averageMonthlySalary)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {activePayroll.length} salaried employees
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Payroll Ledger</CardTitle>
          <CardDescription>
            A breakdown of monthly costs per employee based on their latest assigned salary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Annual Base</TableHead>
                <TableHead>Assigned Bonus</TableHead>
                <TableHead className="text-right">Est. Monthly Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activePayroll.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No active salaries found.
                  </TableCell>
                </TableRow>
              ) : (
                activePayroll.map((emp) => {
                  const currentSalary = emp.salaries[0];
                  const monthlyBase = currentSalary.baseAmount / 12;
                  
                  return (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">{emp.email}</div>
                      </TableCell>
                      <TableCell>{formatINR(currentSalary.baseAmount)}</TableCell>
                      <TableCell>
                        {currentSalary.bonus > 0 ? (
                          <Badge variant="secondary" className="font-normal text-emerald-600 bg-emerald-50">
                            {formatINR(currentSalary.bonus)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatINR(monthlyBase)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}