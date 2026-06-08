interface ShimmerProps {
  className?: string;
}

export function ShimmerBlock({ className = '' }: ShimmerProps) {
  return <div className={`shimmer ${className}`} />;
}

export function ShimmerCard() {
  return (
    <div className="bento-card p-4 space-y-3">
      <ShimmerBlock className="h-48 w-full" />
      <ShimmerBlock className="h-4 w-2/3" />
      <ShimmerBlock className="h-3 w-1/2" />
      <ShimmerBlock className="h-3 w-1/3" />
    </div>
  );
}

export function ShimmerDishRow() {
  return (
    <div className="flex gap-3 items-start p-3 border-b border-[#E8E6E1]">
      <ShimmerBlock className="w-20 h-20 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <ShimmerBlock className="h-4 w-1/2" />
        <ShimmerBlock className="h-3 w-1/3" />
        <ShimmerBlock className="h-3 w-3/4" />
      </div>
    </div>
  );
}
