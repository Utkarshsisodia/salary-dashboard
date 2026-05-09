import { Skeleton } from '@/components/ui/skeleton';

function Loading() {
  return (
      <div className="space-y-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="flex items-center p-3 border-b bg-zinc-50/50 dark:bg-zinc-900/50 gap-4">
            <Skeleton className="h-4 w-50" />
            <Skeleton className="h-4 w-50" />
            <Skeleton className="h-4 w-37.5" />
            <Skeleton className="h-4 w-full max-w-75" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="flex items-center p-3 gap-4">
                <div className="w-50">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="w-50">
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="w-37.5">
                  <Skeleton className="h-5 w-24 rounded-3xl" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-4 w-full max-w-100" />
                </div>
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
    );
}

export default Loading