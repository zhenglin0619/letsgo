interface MichelinBadgeProps {
  stars: 1 | 2 | 3;
}

export default function MichelinBadge({ stars }: MichelinBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-red-200">
      {'★'.repeat(stars)} Michelin
    </span>
  );
}
