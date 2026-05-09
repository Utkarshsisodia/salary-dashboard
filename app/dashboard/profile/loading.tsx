import { Skeleton } from "@/components/ui/skeleton";

function Loading() {
  return (
      <div className="space-y-6 pt-2">
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-75 w-full rounded-xl md:col-span-1" />
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-75 w-full rounded-xl" />
            <Skeleton className="h-75 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
}

export default Loading