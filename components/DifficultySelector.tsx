'use client';

import { cn } from '@/lib/utils';
import { Difficulty } from '@/types';

const DIFFICULTIES: Array<{ id: Difficulty; label: string; color: string }> = [
  { id: 'easy', label: 'Easy', color: 'bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20' },
  { id: 'medium', label: 'Medium', color: 'bg-orange-500/10 text-orange-500 border-orange-500/30 hover:bg-orange-500/20' },
  { id: 'hard', label: 'Hard', color: 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20' },
];

interface DifficultySelectorProps {
  selected: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

export default function DifficultySelector({ selected, onSelect }: DifficultySelectorProps) {
  return (
    <div className="flex gap-3">
      {DIFFICULTIES.map((diff) => (
        <button
          key={diff.id}
          onClick={() => onSelect(diff.id)}
          className={cn(
            'px-5 py-2 rounded-full text-sm font-medium border transition-colors',
            diff.color,
            selected === diff.id && 'ring-2 ring-offset-2 ring-offset-background',
            selected === diff.id && diff.id === 'easy' && 'ring-green-500',
            selected === diff.id && diff.id === 'medium' && 'ring-orange-500',
            selected === diff.id && diff.id === 'hard' && 'ring-red-500'
          )}
        >
          {diff.label}
        </button>
      ))}
    </div>
  );
}
