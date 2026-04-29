import { auth } from '@/auth';
import { db } from '@/db';
import { eq, desc, type InferSelectModel } from 'drizzle-orm';
import { employees as employeesSchema, salaries as salariesSchema } from '@/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeView } from './EmployeeView';
import { formatINR } from '@/lib/utils';
import { AddEmployeeForm } from './AddEmployeeForm';
import { AssignSalaryModal } from './AssignSalaryModal';

type Salary = InferSelectModel<typeof salariesSchema>;
type Employee = InferSelectModel<typeof employeesSchema>;
type EmployeeWithSalaries = Employee & { salaries: Salary[] };

export default async function DashboardPage() {
  const session = await auth();
  const { id, role } = session!.user;

  let data;
  if (role === 'admin') {
    data = await db.query.employees.findMany({
      orderBy: [desc(employeesSchema.createdAt)],
      limit: 3,
      with: {
        salaries: {
          orderBy: [desc(salariesSchema.effectiveDate), desc(salariesSchema.createdAt)],
        },
      },
    });
  } else {
    data = await db.query.salaries.findMany({
      where: eq(salariesSchema.employeeId, id as string),
      orderBy: [desc(salariesSchema.effectiveDate), desc(salariesSchema.createdAt)],
    });
  }

  return role === 'admin' ? (
    <AdminView employees={data as EmployeeWithSalaries[]} />
  ) : (
    <EmployeeView salaries={data as Salary[]} />
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
