'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2, ChevronRight } from 'lucide-react';

interface HintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problemTitle: string;
  problemDescription: string;
  hints: string[];
  onHintReceived: (hint: string) => void;
}

const hintLevelLabels = [
  'Approach Direction',
  'Algorithm / Data Structure',
  'Pseudocode Outline',
];

export default function HintDialog({
  open,
  onOpenChange,
  problemTitle,
  problemDescription,
  hints,
  onHintReceived,
}: HintDialogProps) {
  const [loading, setLoading] = useState(false);

  const nextLevel = (hints.length + 1) as 1 | 2 | 3;

  const fetchHint = async () => {
    if (hints.length >= 3) return;
    setLoading(true);
    try {
      const res = await fetch('/api/problems/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle,
          problemDescription,
          hintLevel: nextLevel,
        }),
      });
      if (!res.ok) throw new Error('Failed to fetch hint');
      const data = await res.json();
      onHintReceived(data.hint);
    } catch (err) {
      console.error('Hint error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Hints ({hints.length}/3)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Show revealed hints */}
          {hints.map((hint, i) => (
            <div key={i} className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Level {i + 1}: {hintLevelLabels[i]}
              </p>
              <div className="bg-muted/50 rounded-lg p-3 text-sm whitespace-pre-wrap">
                {hint}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {hints.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hints revealed yet. Each hint gives more detail about the solution.
            </p>
          )}

          {/* Get next hint button */}
          {hints.length < 3 && (
            <Button
              onClick={fetchHint}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              Get Hint {nextLevel}: {hintLevelLabels[nextLevel - 1]}
            </Button>
          )}

          {hints.length >= 3 && (
            <p className="text-xs text-muted-foreground text-center">
              All hints revealed.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
