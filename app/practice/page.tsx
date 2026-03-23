'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Topic, Difficulty, Language, Problem, TestResult, AIReview } from '@/types';
import { Button } from '@/components/ui/button';
import ProblemPanel from '@/components/ProblemPanel';
import CodeEditor from '@/components/CodeEditor';
import HintDialog from '@/components/HintDialog';
import TestResults from '@/components/TestResults';
import ReviewPanel from '@/components/ReviewPanel';
import { RefreshCw, BookOpen, Code2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const VALID_TOPICS: Topic[] = [
  'arrays', 'strings', 'linked-lists', 'trees', 'graphs',
  'dynamic-programming', 'sorting-searching', 'system-design',
];
const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export default function PracticePage() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get('topic') as Topic | null;
  const difficultyParam = searchParams.get('difficulty') as Difficulty | null;

  const topic = topicParam && VALID_TOPICS.includes(topicParam) ? topicParam : 'arrays';
  const difficulty = difficultyParam && VALID_DIFFICULTIES.includes(difficultyParam) ? difficultyParam : 'easy';

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('cpp');
  const [code, setCode] = useState('');
  const [allHints, setAllHints] = useState<string[]>([]);
  const [revealedHintCount, setRevealedHintCount] = useState(0);
  const [hintDialogOpen, setHintDialogOpen] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [review, setReview] = useState<AIReview | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePanel, setActivePanel] = useState<'problem' | 'code'>('problem');

  const generateProblem = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAllHints([]);
    setRevealedHintCount(0);
    setTestResults([]);
    setReview(null);
    try {
      const res = await fetch('/api/problems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, language }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate problem');
      }
      const data = await res.json();
      setProblem(data.problem);
      // Set starter code if available
      const starter = data.problem.starterCode?.[language];
      setCode(starter || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [topic, difficulty, language]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const handleRun = async () => {
    if (!problem) return;
    setIsRunning(true);
    setTestResults([]);
    try {
      const res = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          testCases: problem.testCases,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTestResults(data.testResults);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Code execution failed';
      toast.error('Run failed', { description: message });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem || testResults.length === 0) return;
    setIsSubmitting(true);
    setReview(null);
    setReviewOpen(true);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: problem.title,
          problemDescription: problem.description,
          userSolution: code,
          language,
          testResults: testResults.map((t) => ({
            input: t.input,
            expectedOutput: t.expectedOutput,
            actualOutput: t.actualOutput,
            passed: t.passed,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReview(data.review);
      setIsSubmitting(false);

      // Persist the completed session for authenticated users (guest mode is handled by the API).
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            difficulty,
            language,
            problem,
            userSolution: code,
            testResults,
            aiReview: data.review,
            hintsUsed: revealedHintCount,
          }),
        });
      } catch (saveErr) {
        // Keep review UX responsive even if persistence fails.
        console.error('Progress save error:', saveErr);
      }

      setReviewOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get AI review';
      toast.error('Review failed', { description: message });
      setReviewOpen(false);
      setIsSubmitting(false);
    }
  };

  // Loading state — show skeleton matching the real layout
  if (loading) {
    return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Panel — Problem Skeleton */}
        <div className="hidden md:block md:w-1/2 border-r overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-28" />
              </div>
              <Skeleton className="h-8 w-3/4" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-3" />
              <div className="space-y-1.5">
                <Skeleton className="h-8 w-full rounded" />
                <Skeleton className="h-8 w-full rounded" />
                <Skeleton className="h-8 w-3/4 rounded" />
              </div>
            </div>
            <Separator />
            <div>
              <Skeleton className="h-4 w-20 mb-3" />
              <div className="space-y-4">
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-28 w-full rounded-lg" />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>

        {/* Mobile skeleton */}
        <div className="flex-1 md:hidden p-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>

        {/* Right Panel — Editor Skeleton */}
        <div className="hidden md:flex md:w-1/2 flex-col">
          <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/30">
            <Skeleton className="h-9 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          <div className="flex-1 bg-[#1e1e1e] p-4">
            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-3/4 bg-gray-700" />
              <Skeleton className="h-4 w-1/2 bg-gray-700" />
              <Skeleton className="h-4 w-2/3 bg-gray-700" />
              <Skeleton className="h-4 w-1/3 bg-gray-700" />
              <Skeleton className="h-4 w-3/5 bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !problem) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || 'Failed to load problem'}</p>
          <Button onClick={generateProblem} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* Mobile Panel Switcher */}
      <div className="flex md:hidden border-b">
        <button
          onClick={() => setActivePanel('problem')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
            activePanel === 'problem'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Problem
        </button>
        <button
          onClick={() => setActivePanel('code')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
            activePanel === 'code'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground'
          )}
        >
          <Code2 className="h-4 w-4" />
          Code
        </button>
      </div>

      {/* Left Panel — Problem Description */}
      <div className={cn(
        'md:w-1/2 md:border-r overflow-y-auto p-4 md:p-6',
        activePanel === 'problem' ? 'flex-1 md:flex-none' : 'hidden md:block'
      )}>
        <ProblemPanel
          problem={problem}
          difficulty={difficulty}
          hintsUsed={revealedHintCount}
          onRequestHint={() => setHintDialogOpen(true)}
          onNewProblem={generateProblem}
        />
        <HintDialog
          open={hintDialogOpen}
          onOpenChange={setHintDialogOpen}
          problemTitle={problem.title}
          problemDescription={problem.description}
          allHints={allHints}
          revealedCount={revealedHintCount}
          onHintsLoaded={(hints) => setAllHints(hints)}
          onRevealNext={() => setRevealedHintCount((c) => Math.min(c + 1, 3))}
        />
      </div>

      {/* Right Panel — Code Editor */}
      <div className={cn(
        'md:w-1/2 flex flex-col',
        activePanel === 'code' ? 'flex-1 md:flex-none' : 'hidden md:flex'
      )}>
        <CodeEditor
          language={language}
          code={code}
          onLanguageChange={setLanguage}
          onCodeChange={setCode}
          onRun={handleRun}
          onSubmit={handleSubmit}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
        />
        {isRunning && (
          <div className="border-t overflow-y-auto p-4 space-y-3">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isRunning && testResults.length > 0 && <TestResults results={testResults} />}
      </div>

      <ReviewPanel
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        review={review}
        isLoading={isSubmitting}
      />
    </div>
  );
}