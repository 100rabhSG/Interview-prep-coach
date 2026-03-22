import { TestResult } from '@/types';
import { CheckCircle, XCircle, Clock, MemoryStick } from 'lucide-react';

interface TestResultsProps {
  results: TestResult[];
}

export default function TestResults({ results }: TestResultsProps) {
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  return (
    <div className="border-t overflow-y-auto p-4 space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Test Results:{' '}
          <span className={passed === total ? 'text-green-600' : 'text-red-600'}>
            {passed}/{total} passed
          </span>
        </h3>
      </div>

      {/* Individual test cases */}
      <div className="space-y-2">
        {results.map((result, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 text-sm ${
              result.passed
                ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
                : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {result.passed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">Test Case {i + 1}</span>
                {result.status && result.status !== 'Accepted' && (
                  <span className="text-xs text-muted-foreground">({result.status})</span>
                )}
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                {result.executionTime !== undefined && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {result.executionTime}s
                  </span>
                )}
                {result.memoryUsed !== undefined && (
                  <span className="flex items-center gap-1">
                    <MemoryStick className="h-3 w-3" />
                    {Math.round(result.memoryUsed / 1024)}MB
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1 font-mono text-xs">
              <div>
                <span className="text-muted-foreground">Input: </span>
                <span>{result.input}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Expected: </span>
                <span>{result.expectedOutput}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Output: </span>
                <span className={result.passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                  {result.actualOutput || '(no output)'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
