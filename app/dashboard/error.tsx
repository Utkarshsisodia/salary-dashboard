"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service like Sentry
    console.error("Dashboard caught an error:", error);
  }, [error]);

  return (
    <div className="flex h-[70vh] w-full items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-sm border-rose-100">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-rose-100 w-12 h-12 flex items-center justify-center rounded-full">
            <ShieldAlert className="h-6 w-6 text-rose-600" />
          </div>
          <CardTitle>Something went wrong!</CardTitle>
          <CardDescription>
            {error.message || "An unexpected error occurred while loading this page."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => reset()} className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}