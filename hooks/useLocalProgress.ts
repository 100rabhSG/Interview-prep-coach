'use client';

import { useState, useEffect, useCallback } from 'react';
import { Topic, Difficulty, Language, AIReview, TestResult, SessionStatus } from '@/types';

export interface LocalSession {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  language: Language;
  problem: {
    title: string;
  };
  userSolution: string;
  testResults: TestResult[];
  aiReview: AIReview | null;
  hintsUsed: number;
  status: SessionStatus;
  score: number | null;
  createdAt: string;
}

const STORAGE_KEY = 'prep-coach-guest-progress';

function getSessions(): LocalSession[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveSessions(sessions: LocalSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function useLocalProgress() {
  const [sessions, setSessions] = useState<LocalSession[]>([]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const addSession = useCallback((session: Omit<LocalSession, 'id' | 'createdAt'>) => {
    const newSession: LocalSession = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newSession, ...getSessions()];
    saveSessions(updated);
    setSessions(updated);
    return newSession;
  }, []);

  const updateSession = useCallback((id: string, updates: Partial<LocalSession>) => {
    const current = getSessions();
    const updated = current.map((s) => (s.id === id ? { ...s, ...updates } : s));
    saveSessions(updated);
    setSessions(updated);
  }, []);

  const getStats = useCallback(() => {
    const all = getSessions();
    const solved = all.filter((s) => s.status === 'solved');
    const scores = solved.map((s) => s.score).filter((s): s is number => s !== null);

    return {
      totalSolved: solved.length,
      totalAttempted: all.length,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    };
  }, []);

  return { sessions, addSession, updateSession, getStats };
}
