"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatINR } from "@/lib/utils";
import { type InferSelectModel } from "drizzle-orm";
import { salaries as salariesSchema } from "@/db/schema";

type Salary = InferSelectModel<typeof salariesSchema>;

export function EmployeeView({ salaries }: { salaries: Salary[] }) {
  // State to hold the current sorting order
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const sortedSalaries =
    sortOrder === "desc" ? salaries : [...salaries].reverse();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Your Salary History</CardTitle>

        {/* The Filter Menu */}
        <Select
          value={sortOrder}
          onValueChange={(value) => {
            if (value) setSortOrder(value as "desc" | "asc");
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Date: Newest First</SelectItem>
            <SelectItem value="asc">Date: Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        {sortedSalaries.length > 0 ? (
          <ul className="space-y-4">
            {sortedSalaries.map((salary) => (
              <li
                key={salary.id}
                className="flex justify-between border-b pb-2 last:border-0"
              >
                <span>
                  {new Date(salary.effectiveDate).toLocaleDateString("en-IN")}
                </span>
                <span className="font-medium text-emerald-600">
                  {formatINR(salary.baseAmount)}
                  {salary.bonus > 0 && (
                    <span className="text-zinc-500 text-sm ml-2">
                      (+ {formatINR(salary.bonus)} bonus)
                    </span>
                  )}
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
