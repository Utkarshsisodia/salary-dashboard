// app/dashboard/audit/page.tsx
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AuditLogsPage() {
  // Fetch logs with the name of the person who performed the action
  const logs = await db.query.auditLogs.findMany({
    orderBy: [desc(auditLogs.createdAt)],
    limit: 100, // Keep it from fetching millions of rows later
    with: {
      actor: true,
    },
  });

  // Helper to color-code the action badges
  const getBadgeVariant = (actionType: string) => {
    if (actionType.includes('CREATE') || actionType.includes('ADD')) {
      return 'default'; // Uses primary color
    }
    if (actionType.includes('DELETE') || actionType.includes('REMOVE')) {
      return 'destructive'; // Uses red
    }
    if (actionType.includes('UPDATE') || actionType.includes('ASSIGN')) {
      return 'secondary'; // Uses the secondary muted color
    }
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
        <p className="text-muted-foreground">
          A chronological record of administrative actions across the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>Showing the 100 most recent system events.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead className="w-[200px]">Actor</TableHead>
                <TableHead className="w-[150px]">Action</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No activity logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.actor?.name || 'System User'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(log.actionType)}>
                        {log.actionType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.description}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}