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
  allHints: string[];
  revealedCount: number;
  onHintsLoaded: (hints: string[]) => void;
  onRevealNext: () => void;
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
  allHints,
  revealedCount,
  onHintsLoaded,
  onRevealNext,
}: HintDialogProps) {
  const [loading, setLoading] = useState(false);
  const revealedHints = allHints.slice(0, revealedCount);
  const nextLevel = revealedCount + 1;
  const hintsLoaded = allHints.length > 0;

  const fetchAndReveal = async () => {
    // If hints not loaded yet, fetch all 3 from API (1 Gemini call)
    if (!hintsLoaded) {
      setLoading(true);
      try {
        const res = await fetch('/api/problems/hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problemTitle, problemDescription }),
        });
        if (!res.ok) throw new Error('Failed to fetch hints');
        const data = await res.json();
        onHintsLoaded(data.hints);
      } catch (err) {
        console.error('Hint error:', err);
        return;
      } finally {
        setLoading(false);
      }
    }
    // Reveal the next hint
    onRevealNext();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Hints ({revealedCount}/3)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Show revealed hints */}
          {revealedHints.map((hint, i) => (
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
          {revealedCount === 0 && !loading && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hints revealed yet. Each hint gives more detail about the solution.
            </p>
          )}

          {/* Reveal next hint button */}
          {revealedCount < 3 && (
            <Button
              onClick={fetchAndReveal}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Generating hints...' : `Reveal Hint ${nextLevel}: ${hintLevelLabels[nextLevel - 1]}`}
            </Button>
          )}

          {revealedCount >= 3 && (
            <p className="text-xs text-muted-foreground text-center">
              All hints revealed.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}