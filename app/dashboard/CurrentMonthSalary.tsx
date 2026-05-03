import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import { Banknote, CalendarDays, TrendingUp } from "lucide-react";

type CurrentMonthSalaryProps = {
  monthlyBase: number;
  dailyRate: number;
  expectedWorkingDays: number;
  validDaysPresent: number;
  estimatedPayout: number;
};

export function CurrentMonthSalary({
  monthlyBase,
  dailyRate,
  expectedWorkingDays,
  validDaysPresent,
  estimatedPayout,
}: CurrentMonthSalaryProps) {
  const progressPercentage = expectedWorkingDays > 0 
    ? Math.min(100, (validDaysPresent / expectedWorkingDays) * 100) 
    : 0;

  const monthName = new Date().toLocaleString('default', { month: 'long' });

  if (monthlyBase === 0) {
    return null; // Don't show if HR hasn't assigned a salary yet
  }

  return (
    <Card className="shadow-sm border-primary/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Banknote className="h-5 w-5 text-emerald-600" />
              Live Salary Accrual
            </CardTitle>
            <CardDescription>Estimated payout for {monthName} based on attendance</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Standard Monthly Base</p>
            <p className="text-lg font-semibold text-foreground">{formatINR(monthlyBase)}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-emerald-600">{formatINR(estimatedPayout)} Earned</span>
            <span className="text-muted-foreground">{validDaysPresent} / {expectedWorkingDays} Days</span>
          </div>
          <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-in-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border">
            <div className="p-2 bg-white rounded-lg border shadow-sm">
              <CalendarDays className="h-4 w-4 text-zinc-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Calculated Daily Rate</p>
              <p className="font-semibold text-sm">{formatINR(dailyRate)} <span className="font-normal text-zinc-400 text-xs">/day</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border">
            <div className="p-2 bg-white rounded-lg border shadow-sm">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Current Est. Payout</p>
              <p className="font-bold text-emerald-600 text-sm">{formatINR(estimatedPayout)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}