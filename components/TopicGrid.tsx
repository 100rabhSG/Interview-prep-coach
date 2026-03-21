'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Topic } from '@/types';

const TOPICS: Array<{ id: Topic; label: string; icon: string; description: string }> = [
  { id: 'arrays', label: 'Arrays', icon: '📊', description: 'Array manipulation, searching, sorting' },
  { id: 'strings', label: 'Strings', icon: '🔤', description: 'String processing, pattern matching' },
  { id: 'linked-lists', label: 'Linked Lists', icon: '🔗', description: 'Singly/doubly linked lists' },
  { id: 'trees', label: 'Trees', icon: '🌳', description: 'BST, binary trees, traversals' },
  { id: 'graphs', label: 'Graphs', icon: '🕸️', description: 'BFS, DFS, shortest paths' },
  { id: 'dynamic-programming', label: 'Dynamic Programming', icon: '🧩', description: 'Memoization, tabulation' },
  { id: 'sorting-searching', label: 'Sorting & Searching', icon: '🔍', description: 'Binary search, merge sort, etc.' },
  { id: 'system-design', label: 'System Design', icon: '🏗️', description: 'Architecture, scalability, design patterns' },
];

interface TopicGridProps {
  selected: Topic | null;
  onSelect: (topic: Topic) => void;
}

export default function TopicGrid({ selected, onSelect }: TopicGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {TOPICS.map((topic) => (
        <Card
          key={topic.id}
          className={cn(
            'cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md',
            selected === topic.id
              ? 'border-primary ring-2 ring-primary'
              : 'border-border'
          )}
          onClick={() => onSelect(topic.id)}
        >
          <CardContent className="flex flex-col items-center text-center gap-2 p-6">
            <span className="text-3xl">{topic.icon}</span>
            <h3 className="font-semibold text-sm">{topic.label}</h3>
            <p className="text-xs text-muted-foreground">{topic.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
