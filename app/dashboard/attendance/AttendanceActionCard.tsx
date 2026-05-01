'use client';

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, LogIn, LogOut, AlertTriangle } from "lucide-react";
import { toggleAttendance } from "./actions";

type TodayRecord = {
  id: string;
  clockIn: Date;
  clockOut: Date | null;
} | undefined;

export function AttendanceActionCard({ todayRecord }: { todayRecord: TodayRecord }) {
  const [isPending, startTransition] = useTransition();
  const [showWarning, setShowWarning] = useState(false);
  const [warningType, setWarningType] = useState<"half" | "none">("none");

  const isClockedIn = todayRecord !== undefined && todayRecord.clockOut === null;
  const isShiftComplete = todayRecord !== undefined && todayRecord.clockOut !== null;

  const executeToggle = () => {
    setShowWarning(false);
    startTransition(async () => {
      await toggleAttendance();
    });
  };

  const handleClockOutClick = () => {
    if (todayRecord?.clockIn) {
      const now = new Date();
      const clockInTime = new Date(todayRecord.clockIn);
      const diffHrs = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      if (diffHrs < 4) {
        setWarningType("none");
        setShowWarning(true);
        return;
      } else if (diffHrs < 8) {
        setWarningType("half");
        setShowWarning(true);
        return;
      }
    }
    executeToggle();
  };

  return (
    <>
      <Card className="flex flex-col justify-between shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Today&apos;s Status
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              {isShiftComplete ? (
                 <Badge variant="secondary" className="mt-1 bg-zinc-200 text-zinc-700 hover:bg-zinc-200">Shift Complete</Badge>
              ) : isClockedIn ? (
                <Badge variant="default" className="mt-1 bg-emerald-500 hover:bg-emerald-600">Active - Clocked In</Badge>
              ) : (
                <Badge variant="outline" className="mt-1">Not Clocked In</Badge>
              )}
            </div>
            
            {todayRecord && (
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Punch In</p>
                <p className="font-semibold">{new Date(todayRecord.clockIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            )}
          </div>

          <div>
            {isShiftComplete ? (
              <Button disabled className="w-full h-12 text-lg rounded-xl" variant="secondary">
                Completed for Today
              </Button>
            ) : isClockedIn ? (
              <Button 
                onClick={handleClockOutClick} 
                disabled={isPending}
                className="w-full h-12 text-lg rounded-xl bg-rose-500 hover:bg-rose-600"
              >
                <LogOut className="mr-2 h-5 w-5" /> 
                {isPending ? "Processing..." : "Clock Out"}
              </Button>
            ) : (
              <Button 
                onClick={executeToggle} 
                disabled={isPending}
                className="w-full h-12 text-lg rounded-xl"
              >
                <LogIn className="mr-2 h-5 w-5" /> 
                {isPending ? "Processing..." : "Clock In"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              Early Clock Out Warning
            </DialogTitle>
            <DialogDescription className="pt-2 text-base text-zinc-800">
              {warningType === "half" ? (
                <span>You have worked less than 8 hours today. Clocking out now will mark this as a <strong className="text-amber-600">Half-Day</strong> (0.5 days credit).</span>
              ) : (
                <span>You have worked less than 4 hours today. Clocking out now means this day <strong className="text-rose-600">will not be counted</strong> towards your attendance.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setShowWarning(false)}>
              Cancel
            </Button>
            <Button variant={warningType === "half" ? "default" : "destructive"} onClick={executeToggle}>
              Clock Out Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}