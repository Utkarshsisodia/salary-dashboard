import { auth } from "@/auth";
import { db } from "@/db";
import { attendance } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AttendanceActionCard } from "./AttendanceActionCard";

export default async function AttendancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const employeeId = session.user.id;
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const records = await db.query.attendance.findMany({
    where: eq(attendance.employeeId, employeeId),
    orderBy: [desc(attendance.date)],
  });

  const todayRecord = records.find(r => r.date === todayStr);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const totalDaysPresent = records.reduce((total, record) => {
    const d = new Date(record.date);
    const isThisMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    
    if (!isThisMonth || !record.clockOut) return total;
    
    const diffHrs = (record.clockOut.getTime() - record.clockIn.getTime()) / (1000 * 60 * 60);
    
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
              {new Date().toLocaleString('default', { month: 'long' })} {currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-40">
            <div className="text-center">
               <p className="text-5xl font-bold text-primary">{totalDaysPresent}</p>
               <p className="text-sm font-medium text-muted-foreground mt-2">Days Credited</p>
               <p className="text-xs text-muted-foreground mt-1">(Includes half-days)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Attendance Ledger</CardTitle>
          <CardDescription>A chronological record of your recent punches.</CardDescription>
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
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => {
                  let statusElement = <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none font-normal">Active</Badge>;
                  
                  if (record.clockIn && record.clockOut) {
                    const diffMs = record.clockOut.getTime() - record.clockIn.getTime();
                    const diffHrs = diffMs / (1000 * 60 * 60);
                    
                    if (diffHrs >= 8) {
                      statusElement = <span className="font-semibold text-emerald-600">{diffHrs.toFixed(1)}h (Full)</span>;
                    } else if (diffHrs >= 4) {
                      statusElement = <span className="font-semibold text-amber-500">{diffHrs.toFixed(1)}h (Half Day)</span>;
                    } else {
                      statusElement = <span className="font-semibold text-rose-500">{diffHrs.toFixed(1)}h (No Credit)</span>;
                    }
                  }

                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {new Date(record.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        {record.clockIn.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        {record.clockOut 
                          ? record.clockOut.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) 
                          : "-"}
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