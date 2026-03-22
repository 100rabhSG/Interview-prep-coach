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

interface Judge0Result {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

function toBase64(str: string): string {
  return Buffer.from(str).toString('base64');
}

function fromBase64(str: string | null): string | null {
  if (!str) return null;
  return Buffer.from(str, 'base64').toString('utf-8');
}

/**
 * Submit test cases to Judge0 and wait for results.
 */
export async function executeCode(
  code: string,
  language: Language,
  testCases: Array<{ input: string; expectedOutput: string }>
): Promise<Judge0Result[]> {
  const { url, key } = getConfig();
  const langId = getLanguageId(language);

  // Submit each test case with wait=true and base64 encoding
  const results: Judge0Result[] = [];
  for (const tc of testCases) {
    const res = await fetch(`${url}/submissions?base64_encoded=true&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': new URL(url).host,
      },
      body: JSON.stringify({
        source_code: toBase64(code),
        language_id: langId,
        stdin: toBase64(tc.input),
        expected_output: toBase64(tc.expectedOutput),
        cpu_time_limit: 10,
        memory_limit: 128000,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Judge0 execution failed: ${res.status} ${text}`);
    }

    const data = await res.json();
    // Decode base64 response fields
    results.push({
      ...data,
      stdout: fromBase64(data.stdout),
      stderr: fromBase64(data.stderr),
      compile_output: fromBase64(data.compile_output),
    });
  }

  return results;
}

export { type Judge0Result };