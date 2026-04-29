// app/dashboard/payslips/page.tsx
import { auth } from '@/auth';
import { db } from '@/db';
import { salaries } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default async function PayslipsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Fetch the logged-in employee's most recent salary
  const userSalaries = await db.query.salaries.findMany({
    where: eq(salaries.employeeId, session.user.id),
    orderBy: [desc(salaries.effectiveDate)],
    limit: 1,
  });

  const currentSalary = userSalaries[0];

  // If HR hasn't assigned them a salary yet, show an empty state
  if (!currentSalary) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Payslips</h2>
          <p className="text-muted-foreground">View and download your monthly compensation documents.</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <FileText className="h-12 w-12 text-zinc-300" />
            <div className="text-center">
              <h3 className="font-semibold text-lg">No Payslips Available</h3>
              <p className="text-sm text-muted-foreground">Your salary details have not been processed yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate monthly breakdowns based on the annual base
  const grossMonthly = currentSalary.baseAmount / 12;
  // Standard simulated Indian deductions: 12% PF on a generic 15k basic, plus 200 PT
  const mockedPF = 180000; // ₹1,800 in cents
  const mockedPT = 20000;  // ₹200 in cents
  const netMonthly = grossMonthly - mockedPF - mockedPT;

  // Generate the last 6 months for the UI demonstration
  const past6Months = Array.from({ length: 6 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i - 1); // Go back i+1 months
    return {
      id: `payslip-${i}`,
      monthYear: date.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
      status: 'Paid',
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Payslips</h2>
        <p className="text-muted-foreground">
          View and download your monthly compensation documents.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Vault</CardTitle>
          <CardDescription>
            Historical payslips are available for download typically by the 1st of the following month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pay Period</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {past6Months.map((period) => (
                <TableRow key={period.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-zinc-400" />
                    {period.monthYear}
                  </TableCell>
                  <TableCell>{formatINR(grossMonthly)}</TableCell>
                  <TableCell className="text-red-500/80">
                    -{formatINR(mockedPF + mockedPT)}
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-600">
                    {formatINR(netMonthly)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">
                      {period.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}