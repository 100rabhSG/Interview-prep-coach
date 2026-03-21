import { Problem, Difficulty } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Lightbulb, Clock, MemoryStick, RefreshCw } from 'lucide-react';

interface ProblemPanelProps {
  problem: Problem;
  difficulty: Difficulty;
  hintsUsed: number;
  onRequestHint: () => void;
  onNewProblem: () => void;
}

const difficultyConfig: Record<Difficulty, { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  hard: { label: 'Hard', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function ProblemPanel({
  problem,
  difficulty,
  hintsUsed,
  onRequestHint,
  onNewProblem,
}: ProblemPanelProps) {
  const diffConfig = difficultyConfig[difficulty];

  return (
    <div className="space-y-6">
      {/* Header: Title + Difficulty Badge + New Problem */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Badge className={diffConfig.className}>{diffConfig.label}</Badge>
          <Button variant="ghost" size="sm" onClick={onNewProblem}>
            <RefreshCw className="h-4 w-4 mr-1" />
            New Problem
          </Button>
        </div>
        <h1 className="text-2xl font-bold">{problem.title}</h1>
      </div>

      <Separator />

      {/* Description */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap leading-relaxed">{problem.description}</p>
      </div>

      {/* Constraints */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Constraints</h3>
        <ul className="space-y-1">
          {problem.constraints.map((constraint, i) => (
            <li key={i} className="text-sm font-mono bg-muted/50 rounded px-3 py-1.5">
              {constraint}
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Examples */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Examples</h3>
        <div className="space-y-4">
          {problem.examples.map((example, i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Example {i + 1}</p>
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Input: </span>
                <code className="text-sm font-mono">{example.input}</code>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Output: </span>
                <code className="text-sm font-mono">{example.output}</code>
              </div>
              {example.explanation && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Explanation: </span>
                  <span className="text-sm text-muted-foreground">{example.explanation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Complexity + Hints */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {problem.optimalComplexity.time}
          </span>
          <span className="flex items-center gap-1">
            <MemoryStick className="h-3.5 w-3.5" />
            {problem.optimalComplexity.space}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRequestHint}
          disabled={hintsUsed >= 3}
        >
          <Lightbulb className="h-4 w-4 mr-1" />
          Hint ({hintsUsed}/3)
        </Button>
      </div>
    </div>
  );
}
