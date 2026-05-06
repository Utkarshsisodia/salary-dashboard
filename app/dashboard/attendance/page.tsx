import { Suspense } from "react";
import { db, withRLS } from "@/db";
import { attendance } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceActionCard } from "./AttendanceActionCard";
import { getCachedSession } from "@/lib/session"; // 1. Import your cached session utility!
import { calculateHoursWorked, formatDate, formatTime, isCurrentMonth } from "@/lib/date-utils";

function AttendanceSkeleton() {
  // ... (keep your existing skeleton code)
  return (
    <div className="space-y-6 pt-2">
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}

// 2. Fetch the session INSIDE the Suspense-wrapped component
async function AttendanceData() {
  const session = await getCachedSession();
  if (!session?.user) redirect("/login");
  
  const userId = session.user.id;
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const records = await withRLS<typeof attendance.$inferSelect[]>(
    userId,
    db.query.attendance.findMany({
      where: eq(attendance.employeeId, userId),
      orderBy: [desc(attendance.date)],
    })
  );

  const todayRecord = records.find((r) => r.date === todayStr);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const totalDaysPresent = records.reduce((total, record) => {
    if (!record.clockOut || !isCurrentMonth(record.date)) return total;

    let diffMs = record.clockOut.getTime() - record.clockIn.getTime();
    if (record.breakStart && record.breakEnd) {
      diffMs -= record.breakEnd.getTime() - record.breakStart.getTime();
    }

    const diffHrs = calculateHoursWorked(
      record.clockIn,
      record.clockOut,
      record.breakStart,
      record.breakEnd,
    );
    if (diffHrs >= 8) return total + 1;
    if (diffHrs >= 4) return total + 0.5;
    return total;
  }, 0);

  return (
    <div className="space-y-6 pt-2">
      <div className="grid gap-6 md:grid-cols-2">
        <AttendanceActionCard todayRecord={todayRecord} />
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>
              {new Date().toLocaleString("default", { month: "long" })}{" "}
              {currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-40">
            <div className="text-center">
              <p className="text-5xl font-bold text-primary">
                {totalDaysPresent}
              </p>
              <p className="text-sm font-medium text-muted-foreground mt-2">
                Days Credited
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Includes half-days)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Attendance Ledger</CardTitle>
          <CardDescription>
            A chronological record of your recent punches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground h-24"
                  >
                    No attendance records found.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => {
                  let statusElement = (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-700"
                    >
                      Active
                    </Badge>
                  );

                  if (record.clockIn && record.clockOut) {
                    let diffMs =
                      record.clockOut.getTime() - record.clockIn.getTime();
                    if (record.breakStart && record.breakEnd) {
                      diffMs -=
                        record.breakEnd.getTime() - record.breakStart.getTime();
                    }
                    const diffHrs = diffMs / (1000 * 60 * 60);

                    if (diffHrs >= 8)
                      statusElement = (
                        <span className="font-semibold text-emerald-600">
                          {diffHrs.toFixed(1)}h (Full)
                        </span>
                      );
                    else if (diffHrs >= 4)
                      statusElement = (
                        <span className="font-semibold text-amber-500">
                          {diffHrs.toFixed(1)}h (Half)
                        </span>
                      );
                    else
                      statusElement = (
                        <span className="font-semibold text-rose-500">
                          {diffHrs.toFixed(1)}h (No Credit)
                        </span>
                      );
                  }

                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {formatDate(record.date)}
                      </TableCell>
                      <TableCell>{formatTime(record.clockIn)}</TableCell>
                      <TableCell>
                        {record.clockOut ? formatTime(record.clockOut) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {statusElement}
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

export default function AttendancePage() {
  return (
    <Suspense fallback={<AttendanceSkeleton />}>
      <AttendanceData />
    </Suspense>
  );
}
