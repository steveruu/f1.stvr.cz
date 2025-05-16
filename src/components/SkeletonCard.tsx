
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <Card className="p-4 bg-f1-gray border-gray-800 shadow-md">
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/3 bg-gray-700" />
        <Skeleton className="h-6 w-3/4 bg-gray-700" />
        <Skeleton className="h-4 w-1/2 bg-gray-700" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-1/4 bg-gray-700" />
          <Skeleton className="h-4 w-1/4 bg-gray-700" />
        </div>
      </div>
    </Card>
  );
}
