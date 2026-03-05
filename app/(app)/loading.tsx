import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="p-4 space-y-6 pb-6">
      <header className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-16" />
      </header>

      {/* Skeleton BalanceCard */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Skeleton BalanceSynthese */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </main>
  );
}
