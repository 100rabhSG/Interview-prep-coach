'use client';

import { Language } from '@/types';
import Editor from '@monaco-editor/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Play, Send, Loader2 } from 'lucide-react';

interface CodeEditorProps {
  language: Language;
  code: string;
  onLanguageChange: (language: Language) => void;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
}

const languageConfig: Record<Language, { label: string; monacoLang: string }> = {
  python: { label: 'Python', monacoLang: 'python' },
  javascript: { label: 'JavaScript', monacoLang: 'javascript' },
  java: { label: 'Java', monacoLang: 'java' },
  cpp: { label: 'C++', monacoLang: 'cpp' },
};

export default function CodeEditor({
  language,
  code,
  onLanguageChange,
  onCodeChange,
  onRun,
  onSubmit,
  isRunning = false,
  isSubmitting = false,
}: CodeEditorProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar: Language Selector + Action Buttons */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/30">
        <Select value={language} onValueChange={(val) => onLanguageChange(val as Language)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(languageConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRun} disabled={isRunning || isSubmitting}>
            {isRunning ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            Run
          </Button>
          <Button size="sm" onClick={onSubmit} disabled={isRunning || isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-1" />
            )}
            Submit
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={languageConfig[language].monacoLang}
          value={code}
          onChange={(value) => onCodeChange(value || '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 4,
          }}
        />
      </div>
    </div>
  );
}
