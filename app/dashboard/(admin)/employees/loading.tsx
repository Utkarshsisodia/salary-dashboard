import { Skeleton } from '@/components/ui/skeleton';
import React from 'react'

function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b bg-zinc-50/50 dark:bg-zinc-900/50">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <div className="space-y-2 w-1/3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-20 rounded-3xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between px-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-4xl" />
            <Skeleton className="h-8 w-20 rounded-4xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loading