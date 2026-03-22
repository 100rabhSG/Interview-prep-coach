'use client';

import { useState } from 'react';
import { AIReview } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
  AlertTriangle,
  Zap,
  Eye,
  EyeOff,
  Star,
} from 'lucide-react';

interface ReviewPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: AIReview | null;
}

function ScoreBadge({ score }: { score: number }) {
  const variant = score >= 8 ? 'default' : score >= 5 ? 'secondary' : 'destructive';
  return (
    <Badge variant={variant} className="text-lg px-3 py-1">
      <Star className="h-4 w-4 mr-1" />
      {score}/10
    </Badge>
  );
}

export default function ReviewPanel({
  open,
  onOpenChange,
  review,
}: ReviewPanelProps) {
  const [showSolution, setShowSolution] = useState(false);

  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[80%] !max-w-[80%] !max-h-[85%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            AI Code Review
            <ScoreBadge score={review.score} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-4 pb-8">
          {/* Correctness */}
          <section>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Correctness
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {review.correctness}
            </p>
          </section>

          <Separator />

          {/* Complexity Analysis */}
          <section>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Complexity Analysis
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Time</p>
                <p className="text-sm font-mono">{review.timeComplexity}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Space</p>
                <p className="text-sm font-mono">{review.spaceComplexity}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Issues Found */}
          <section>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
              {review.issues.length > 0 ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              Issues Found ({review.issues.length})
            </h3>
            {review.issues.length > 0 ? (
              <ul className="space-y-2">
                {review.issues.map((issue, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{issue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No issues found!</p>
            )}
          </section>

          <Separator />

          {/* Optimizations */}
          <section>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Optimizations ({review.optimizations.length})
            </h3>
            {review.optimizations.length > 0 ? (
              <ul className="space-y-2">
                {review.optimizations.map((opt, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <HardDrive className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{opt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your solution is already well-optimized!
              </p>
            )}
          </section>

          <Separator />

          {/* Optimal Solution */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-500" />
                Optimal Solution
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSolution(!showSolution)}
              >
                {showSolution ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Show
                  </>
                )}
              </Button>
            </div>
            {showSolution ? (
              <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-xs">
                <code>{review.optimalSolution}</code>
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Try to optimize your solution first before viewing the optimal one.
              </p>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
