// app/dashboard/page.tsx
import { auth } from "@/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { eq, desc, type InferSelectModel } from "drizzle-orm";
import {
  user as userSchema, // <-- Replaced employees with user
  salaries as salariesSchema,
  attendance as attendanceSchema,
} from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeView } from "./EmployeeView";
import { formatINR } from "@/lib/utils";
import { AddEmployeeForm } from "./AddEmployeeForm";
import { AssignSalaryModal } from "./AssignSalaryModal";
import { CurrentMonthSalary } from "./CurrentMonthSalary";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Salary = InferSelectModel<typeof salariesSchema>;
type Employee = InferSelectModel<typeof userSchema>; // <-- Updated here
type EmployeeWithSalaries = Employee & { salaries: Salary[] };

export default async function DashboardPage(props: {
  searchParams: Promise<{ assignId?: string }>;
}) {
  const searchParams = await props.searchParams;

  // Better Auth pattern
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { id, role } = session!.user;

  if (role === "admin") {
    const adminData = await db.query.user.findMany({
      // <-- Updated here
      orderBy: [desc(userSchema.createdAt)], // <-- Updated here
      limit: 3,
      with: {
        salaries: {
          orderBy: [
            desc(salariesSchema.effectiveDate),
            desc(salariesSchema.createdAt),
          ],
        },
      },
    });
    const selectedEmployee = searchParams.assignId
      ? adminData.find((e) => e.id === searchParams.assignId)
      : null;

    return (
      <>
        <AdminView employees={adminData} />
        {selectedEmployee && (
          <AssignSalaryModal
            employeeId={selectedEmployee.id}
            employeeName={selectedEmployee.name}
          />
        )}
      </>
    );
  }
  const salariesData = await db.query.salaries.findMany({
    where: eq(salariesSchema.employeeId, id as string),
    orderBy: [
      desc(salariesSchema.effectiveDate),
      desc(salariesSchema.createdAt),
    ],
  });
  const attendanceData = await db.query.attendance.findMany({
    where: eq(attendanceSchema.employeeId, id as string),
  });
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let expectedWorkingDays = 0;
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentYear, currentMonth, i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      expectedWorkingDays++;
    }
  }
  const validDaysPresent = attendanceData.reduce((total, record) => {
    const d = new Date(record.date);
    const isThisMonth =
      d.getMonth() === currentMonth && d.getFullYear() === currentYear;

    if (!isThisMonth || !record.clockOut) return total;

    const diffHrs =
      (record.clockOut.getTime() - record.clockIn.getTime()) / (1000 * 60 * 60);

    if (diffHrs >= 8) return total + 1;
    if (diffHrs >= 4) return total + 0.5;
    return total;
  }, 0);
  const currentSalary = salariesData[0];
  const monthlyBase = currentSalary ? currentSalary.baseAmount / 12 : 0;
  const dailyRate =
    expectedWorkingDays > 0 ? monthlyBase / expectedWorkingDays : 0;
  const estimatedPayout = Math.min(monthlyBase, validDaysPresent * dailyRate);
  return (
    <div className="space-y-6">
      <CurrentMonthSalary
        monthlyBase={monthlyBase}
        dailyRate={dailyRate}
        expectedWorkingDays={expectedWorkingDays}
        validDaysPresent={validDaysPresent}
        estimatedPayout={estimatedPayout}
      />

      <EmployeeView salaries={salariesData as Salary[]} />
    </div>
  );
}

function AdminView({ employees }: { employees: EmployeeWithSalaries[] }) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <AddEmployeeForm />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((emp) => (
          <Card key={emp.id}>
            <CardHeader>
              <CardTitle className="text-lg">{emp.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {emp.email} • <span className="capitalize">{emp.role}</span>
              </p>
            </CardHeader>
            <CardContent>
              {emp.salaries && emp.salaries.length > 0 ? (
                <div>
                  <p className="text-2xl font-bold">
                    {formatINR(emp.salaries[0].baseAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current Base Salary
                  </p>
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  No salary data
                </p>
              )}
              <Button
                variant="outline"
                className="w-full mt-4"
                nativeButton={false}
                render={
                  <Link href={`?assignId=${emp.id}`} scroll={false}>
                    Update Salary
                  </Link>
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
