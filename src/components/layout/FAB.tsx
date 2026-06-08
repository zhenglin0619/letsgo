'use client';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fab fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full bg-[#C87A53] text-white flex items-center justify-center"
      aria-label="Quick add"
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  );
}
