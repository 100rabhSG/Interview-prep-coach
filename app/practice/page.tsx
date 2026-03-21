'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Topic, Difficulty, Language, Problem } from '@/types';
import { Button } from '@/components/ui/button';
import ProblemPanel from '@/components/ProblemPanel';
import CodeEditor from '@/components/CodeEditor';
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
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);

  const generateProblem = useCallback(async () => {
    setLoading(true);
    setError(null);
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
          hintsUsed={hintsUsed}
          onRequestHint={() => setHintsUsed((prev) => Math.min(prev + 1, 3))}
          onNewProblem={generateProblem}
        />
      </div>

      {/* Right Panel — Code Editor */}
      <div className="w-1/2 flex flex-col">
        <CodeEditor
          language={language}
          code={code}
          onLanguageChange={setLanguage}
          onCodeChange={setCode}
          onRun={() => { /* Phase 5: Code execution */ }}
          onSubmit={() => { /* Phase 6: AI review */ }}
        />
      </div>
    </div>
  );
}