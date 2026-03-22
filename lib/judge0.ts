import { Language } from '@/types';

function getConfig() {
  const url = process.env.JUDGE0_API_URL;
  const key = process.env.JUDGE0_API_KEY;
  if (!url) throw new Error('Please define the JUDGE0_API_URL environment variable in .env.local');
  if (!key) throw new Error('Please define the JUDGE0_API_KEY environment variable in .env.local');
  return { url, key };
}

// Judge0 language IDs (CE variant)
const LANGUAGE_IDS: Record<Language, number> = {
  python: 71,      // Python 3.8.1
  javascript: 63,  // Node.js 12.14.0
  java: 62,        // Java (OpenJDK 13.0.1)
  cpp: 54,         // C++ (GCC 9.2.0)
};

export function getLanguageId(language: Language): number {
  return LANGUAGE_IDS[language];
}

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin: string;
  expected_output: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

interface Judge0Result {
  token: string;
  stdout: string | null;
  stderr: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

/**
 * Submit a batch of test cases to Judge0.
 * Returns an array of submission tokens.
 */
export async function submitBatch(
  code: string,
  language: Language,
  testCases: Array<{ input: string; expectedOutput: string }>
): Promise<string[]> {
  const submissions: Judge0Submission[] = testCases.map((tc) => ({
    source_code: code,
    language_id: getLanguageId(language),
    stdin: tc.input,
    expected_output: tc.expectedOutput,
    cpu_time_limit: 10,
    memory_limit: 128000,
  }));

  const { url, key } = getConfig();

  const res = await fetch(`${url}/submissions/batch?base64_encoded=false`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': key,
      'X-RapidAPI-Host': new URL(url).host,
    },
    body: JSON.stringify({ submissions }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Judge0 submission failed: ${res.status} ${text}`);
  }

  const data: Array<{ token: string }> = await res.json();
  return data.map((d) => d.token);
}

/**
 * Poll Judge0 for results of a batch submission.
 * Retries until all submissions are done or max attempts reached.
 */
export async function pollResults(
  tokens: string[],
  maxAttempts = 15,
  delayMs = 2000
): Promise<Judge0Result[]> {
  const { url, key } = getConfig();
  const tokenString = tokens.join(',');

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(
      `${url}/submissions/batch?tokens=${tokenString}&base64_encoded=false&fields=token,stdout,stderr,status,time,memory`,
      {
        headers: {
          'X-RapidAPI-Key': key,
          'X-RapidAPI-Host': new URL(url).host,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Judge0 polling failed: ${res.status}`);
    }

    const data: { submissions: Judge0Result[] } = await res.json();
    const allDone = data.submissions.every(
      (s) => s.status.id !== 1 && s.status.id !== 2 // 1=In Queue, 2=Processing
    );

    if (allDone) {
      return data.submissions;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error('Code execution timed out. Please try again.');
}

export { type Judge0Result };