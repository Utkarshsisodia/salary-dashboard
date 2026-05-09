import { Skeleton } from '@/components/ui/skeleton';

function Loading() {
  return (
      <div className="space-y-6">
        <div className="flex justify-end gap-2 mb-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-100 w-full rounded-xl" />
      </div>
    );
}

export default Loading