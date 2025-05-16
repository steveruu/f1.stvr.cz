import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <Card className="p-5 bg-black/40 backdrop-blur-sm border-gray-800 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-800"></div>
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-3.5 rounded-full bg-gray-800" />
          <Skeleton className="h-4 w-1/3 bg-gray-800" />
        </div>
        <Skeleton className="h-6 w-3/4 bg-gray-800" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-3.5 rounded-full bg-gray-800" />
          <Skeleton className="h-4 w-1/2 bg-gray-800" />
        </div>
        <div className="mt-4 bg-black/20 rounded-md p-2 flex items-center">
          <Skeleton className="h-4 w-4 mr-2 rounded-full bg-gray-800" />
          <Skeleton className="h-4 w-2/3 bg-gray-800" />
        </div>
      </div>
    </Card>
  );
}
