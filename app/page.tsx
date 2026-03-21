'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import TopicGrid from '@/components/TopicGrid';
import DifficultySelector from '@/components/DifficultySelector';
import { Topic, Difficulty } from '@/types';
import { ArrowRight, Sparkles, Play, MessageSquare } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');

  const handleStartPractice = () => {
    if (!selectedTopic) return;
    router.push(`/practice?topic=${selectedTopic}&difficulty=${selectedDifficulty}`);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Your AI Interview{' '}
          <span className="text-primary">Prep Coach</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Practice coding interviews with AI-generated problems, real code execution, 
          and personalized feedback. Track your progress and crush your next interview.
        </p>
        <div className="flex justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>AI-Generated Problems</span>
          </div>
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span>Real Code Execution</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Personalized Feedback</span>
          </div>
        </div>
      </div>

      {/* Topic Selection */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-center">Choose a Topic</h2>
        <TopicGrid selected={selectedTopic} onSelect={setSelectedTopic} />
      </div>

      {/* Difficulty Selection */}
      <div className="mb-12 text-center">
        <h2 className="text-xl font-semibold mb-4">Select Difficulty</h2>
        <div className="flex justify-center">
          <DifficultySelector selected={selectedDifficulty} onSelect={setSelectedDifficulty} />
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={handleStartPractice}
          disabled={!selectedTopic}
          className="text-lg px-8 py-6"
        >
          Start Practice
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        {!selectedTopic && (
          <p className="text-sm text-muted-foreground mt-3">
            Select a topic to get started
          </p>
        )}
      </div>
    </div>
  );
}