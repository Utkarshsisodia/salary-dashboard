import { db } from "@/db";
import { employees, salaries } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { EmployeeRowActions } from './EmployeeRowActions';

export default async function EmployeesPage() {
  // Fetch employees with their salaries, sorted by newest salary first
  const data = await db.query.employees.findMany({
    orderBy: [desc(employees.createdAt)],
    with: {
      salaries: {
        orderBy: [desc(salaries.effectiveDate), desc(salaries.createdAt)],
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Directory</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Current Salary</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((employee) => {
              const currentSalary = employee.salaries?.[0];

              return (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell className="capitalize">
                    {employee.role === "admin" ? (
                      <Badge variant="destructive">Admin</Badge>
                    ) : (
                      <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                        Employee
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {currentSalary ? (
                      <span className="font-semibold text-emerald-600">
                        {formatINR(currentSalary.baseAmount)}
                      </span>
                    ) : (
                      <span className="text-zinc-400 italic text-sm">
                        Not Assigned
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <EmployeeRowActions 
                      employeeId={employee.id} 
                      employeeName={employee.name} 
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
