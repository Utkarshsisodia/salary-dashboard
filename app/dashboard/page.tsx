import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { salaries, employees } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { logOut, addEmployee } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddEmployeeForm } from "./AddEmployeeForm";

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
          orderBy: [desc(salaries.effectiveDate)],
        },
      },
    });
  } else {
    // Employee only sees their own salary history
    data = await db.query.salaries.findMany({
      where: eq(salaries.employeeId, id),
      orderBy: [desc(salaries.effectiveDate)],
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {name}</p>
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
  );
}

// --- Sub-components (Kept in same file for rapid prototyping) ---

function AdminView({ employees }: { employees: any[] }) {
  return (
    <div className="space-y-8">
      {/* Add Employee Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <AddEmployeeForm />
        </CardContent>
      </Card>
    </div>
  );
}

function EmployeeView({ salaries }: { salaries: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Salary History</CardTitle>
      </CardHeader>
      <CardContent>
        {salaries.length > 0 ? (
          <ul className="space-y-4">
            {salaries.map((salary) => (
              <li
                key={salary.id}
                className="flex justify-between border-b pb-2 last:border-0"
              >
                <span>
                  {new Date(salary.effectiveDate).toLocaleDateString()}
                </span>
                <span className="font-medium">
                  ${(salary.baseAmount / 100).toLocaleString()}
                  {salary.bonus > 0 &&
                    ` (+ $${(salary.bonus / 100).toLocaleString()} bonus)`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No salary history available.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
