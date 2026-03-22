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
import { Loader2, RefreshCw } from 'lucide-react';

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
      console.error('Run error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem || testResults.length === 0) return;
    setIsSubmitting(true);
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
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Generating your problem...</p>
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
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Panel — Problem Description */}
      <div className="w-1/2 border-r overflow-y-auto p-6">
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
      <div className="w-1/2 flex flex-col">
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
        {testResults.length > 0 && <TestResults results={testResults} />}
      </div>

      <ReviewPanel
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        review={review}
      />
    </div>
  );
}