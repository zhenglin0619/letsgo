'use client';
import { useState, useId } from 'react';

interface StarRatingProps {
  value: number; // 0–5
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const uid = useId();
  const stars = 5;
  const filled = hovered !== null ? hovered : value;

  const sizeCls = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: stars }).map((_, i) => {
        const isFull = filled >= i + 1;
        const isHalf = !isFull && filled >= i + 0.5;
        const gradId = `${uid}-half-${i}`;
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(i + 1)}
            onMouseEnter={() => !readonly && setHovered(i + 1)}
            onMouseLeave={() => !readonly && setHovered(null)}
            className={`${sizeCls} relative flex-shrink-0 ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            aria-label={`${i + 1} star`}
          >
            <svg viewBox="0 0 24 24" className="w-full h-full">
              {isHalf && (
                <defs>
                  <linearGradient id={gradId}>
                    <stop offset="50%" stopColor="#C87A53" />
                    <stop offset="50%" stopColor="#E0DBD4" />
                  </linearGradient>
                </defs>
              )}
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={isFull ? '#C87A53' : isHalf ? `url(#${gradId})` : '#E0DBD4'}
                stroke="none"
              />
            </svg>
          </button>
        );
      })}
      <span className="ml-1.5 text-xs font-medium text-[#8A8A8A]">{value.toFixed(1)}</span>
    </div>
  );
}
