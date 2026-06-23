interface LoadingSkeletonProps {
  variant?: "list" | "detail" | "card";
}

export function LoadingSkeleton({ variant = "card" }: LoadingSkeletonProps) {
  if (variant === "list") {
    return (
      <div className="grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Loading auctions">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading auction">
        <div className="skeleton h-10 w-40" />
        <div className="neo-card space-y-3 p-4">
          <div className="skeleton h-9 w-2/3" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-4 w-1/4" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="neo-card h-64 p-4">
            <div className="skeleton mb-4 h-8 w-1/2" />
            <div className="skeleton mb-3 h-4 w-2/3" />
            <div className="skeleton mb-6 h-11 w-full" />
            <div className="skeleton h-11 w-full" />
          </div>
          <div className="neo-card h-64 p-4">
            <div className="skeleton mb-4 h-7 w-1/3" />
            <div className="skeleton h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card p-4" aria-busy="true">
      <div className="skeleton mb-3 h-7 w-2/3" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton mt-2 h-4 w-1/3" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="neo-card p-4">
      <div className="mb-3 flex justify-between gap-3">
        <div className="skeleton h-7 w-2/3" />
        <div className="skeleton h-6 w-16" />
      </div>
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton mt-2 h-4 w-1/3" />
    </div>
  );
}
