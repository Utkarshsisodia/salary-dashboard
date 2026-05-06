import { Suspense } from "react";
import { db } from "@/db";
import { user, salaries } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/utils";
import { EmployeeRowActions } from "./EmployeeRowActions";
import { AssignSalaryModal } from "../AssignSalaryModal";

function EmployeesSkeleton() {
  return <Skeleton className="h-150 w-full rounded-xl" />;
}

async function EmployeesData({ searchParamsPromise }: { searchParamsPromise: Promise<{ assignId?: string }> }) {
  
  const searchParams = await searchParamsPromise;
  const assignId = searchParams.assignId;

  const data = await db.query.user.findMany({
    orderBy: [desc(user.createdAt)],
    with: {
      salaries: {
        orderBy: [desc(salaries.effectiveDate), desc(salaries.createdAt)],
      },
    },
  });

  const selectedEmployee = assignId ? data.find((e) => e.id === assignId) : null;

  return (
    <>
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
                <TableHead className="w-12.5"></TableHead>
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
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Employee</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {currentSalary ? (
                        <span className="font-semibold text-emerald-600">{formatINR(currentSalary.baseAmount)}</span>
                      ) : (
                        <span className="text-zinc-400 italic text-sm">Not Assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <EmployeeRowActions employeeId={employee.id} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedEmployee && (
        <AssignSalaryModal employeeId={selectedEmployee.id} employeeName={selectedEmployee.name} />
      )}
    </>
  );
}

export default function EmployeesPage(props: { searchParams: Promise<{ assignId?: string }> }) {
  return (
    <Suspense fallback={<EmployeesSkeleton />}>
      <EmployeesData searchParamsPromise={props.searchParams} />
    </Suspense>
  );
}