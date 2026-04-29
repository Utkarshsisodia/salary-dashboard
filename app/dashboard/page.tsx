import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { salaries, employees } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { logOut } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeView } from "./EmployeeView";
import { formatINR } from "@/lib/utils";
import { AddEmployeeForm } from "./AddEmployeeForm";
import { AssignSalaryModal } from "./AssignSalaryModal";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";

import { type InferSelectModel } from "drizzle-orm";
import {
  employees as employeesSchema,
  salaries as salariesSchema,
} from "@/db/schema";

type Salary = InferSelectModel<typeof salariesSchema>;
type Employee = InferSelectModel<typeof employeesSchema>;
type EmployeeWithSalaries = Employee & { salaries: Salary[] };

export default async function DashboardPage() {
  // 1. Secure the route: Fetch session on the server
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id, name, role } = session.user;

  // 2. Fetch data based on role
  let data;
  if (role === "admin") {
    // Admin sees everyone and their associated salaries
    data = await db.query.employees.findMany({
      orderBy: [desc(employees.createdAt)],
      with: {
        salaries: {
          orderBy: [desc(salaries.effectiveDate), desc(salaries.createdAt)],
        },
      },
    });
  } else {
    // Employee only sees their own salary history
    data = await db.query.salaries.findMany({
      where: eq(salaries.employeeId, id as string),
      orderBy: [desc(salaries.effectiveDate), desc(salaries.createdAt)],
    });
  }

  return (
    <SidebarProvider>
      {role === "admin" && <AdminSidebar />}

      <SidebarInset>
        <div className="flex-1 min-h-screen bg-zinc-50 p-8 w-full">
          <div className="mx-auto max-w-5xl space-y-6">
            <header className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-4">
                {role === "admin" && <SidebarTrigger />}
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground">Welcome back, {name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 border">
                  {role.toUpperCase()}
                </span>
                <form action={logOut}>
                  <Button variant="outline" size="sm" type="submit">
                    Sign Out
                  </Button>
                </form>
              </div>
            </header>

            <main>
              {role === "admin" ? (
                <AdminView employees={data as any} />
              ) : (
                <EmployeeView salaries={data as any} />
              )}
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// --- Sub-components (Kept in same file for rapid prototyping) ---

function AdminView({ employees }: { employees: EmployeeWithSalaries[] }) {
  return (
    <div className="space-y-8">
      {/* 1. The Add Employee Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <AddEmployeeForm />
        </CardContent>
      </Card>

      {/* 2. The Employee Grid (This was missing!) */}
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
              <AssignSalaryModal employeeId={emp.id} employeeName={emp.name} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
