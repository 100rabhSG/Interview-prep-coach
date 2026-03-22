'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Target, CheckCircle2, BarChart3, RefreshCw } from 'lucide-react';

type SessionItem = {
  _id: string;
  topic: string;
  difficulty: string;
  language: string;
  status: string;
  hintsUsed?: number;
  createdAt: string;
  updatedAt: string;
  aiReview?: { score?: number };
  problem?: { title?: string };
};

type AggregateTopic = {
  topic: string;
  count: number;
  solved: number;
  avgScore: number | null;
};

type AggregateDifficulty = {
  difficulty: string;
  count: number;
  solved: number;
  avgScore: number | null;
};

type ProgressResponse = {
  sessions: SessionItem[];
  summary: {
    total: number;
    solved: number;
    averageScore: number | null;
  };
  aggregates: {
    byTopic: AggregateTopic[];
    byDifficulty: AggregateDifficulty[];
    byDate: Array<{ date: string; count: number; solved: number }>;
  };
};

const topicLabelMap: Record<string, string> = {
  arrays: 'Arrays',
  strings: 'Strings',
  'linked-lists': 'Linked Lists',
  trees: 'Trees',
  graphs: 'Graphs',
  'dynamic-programming': 'Dynamic Programming',
  'sorting-searching': 'Sorting & Searching',
  'system-design': 'System Design',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ScoreBadge({ score }: { score?: number }) {
  if (typeof score !== 'number') return <Badge variant="outline">N/A</Badge>;
  const variant = score >= 8 ? 'default' : score >= 5 ? 'secondary' : 'destructive';
  return <Badge variant={variant}>{score}/10</Badge>;
}

export default function DashboardClient() {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/progress?days=30&limit=50');
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to load dashboard');
      setData(body as ProgressResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const strongestTopic = useMemo(() => {
    if (!data?.aggregates.byTopic?.length) return null;
    return [...data.aggregates.byTopic].sort((a, b) => {
      const aRate = a.count ? a.solved / a.count : 0;
      const bRate = b.count ? b.solved / b.count : 0;
      return bRate - aRate;
    })[0];
  }, [data]);

  const weakestTopic = useMemo(() => {
    if (!data?.aggregates.byTopic?.length) return null;
    const candidates = data.aggregates.byTopic.filter((t) => t.count > 0);
    if (!candidates.length) return null;
    return [...candidates].sort((a, b) => {
      const aRate = a.count ? a.solved / a.count : 0;
      const bRate = b.count ? b.solved / b.count : 0;
      return aRate - bRate;
    })[0];
  }, [data]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Could not load dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-destructive">{error || 'Unknown error'}</p>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your recent progress (last 30 days)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{data.summary.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Solved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{data.summary.solved}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" />
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {typeof data.summary.averageScore === 'number' ? data.summary.averageScore.toFixed(1) : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Strongest Topic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base font-medium">
              {strongestTopic ? topicLabelMap[strongestTopic.topic] || strongestTopic.topic : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Topic Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.aggregates.byTopic.length === 0 && (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
            {data.aggregates.byTopic.map((topic) => (
              <div key={topic.topic} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                <div>
                  <p className="font-medium">{topicLabelMap[topic.topic] || topic.topic}</p>
                  <p className="text-xs text-muted-foreground">
                    {topic.solved}/{topic.count} solved
                  </p>
                </div>
                <ScoreBadge score={topic.avgScore ?? undefined} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Difficulty Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.aggregates.byDifficulty.length === 0 && (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
            {data.aggregates.byDifficulty.map((d) => (
              <div key={d.difficulty} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                <div>
                  <p className="font-medium capitalize">{d.difficulty}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.solved}/{d.count} solved
                  </p>
                </div>
                <ScoreBadge score={d.avgScore ?? undefined} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.sessions.length === 0 && (
            <p className="text-sm text-muted-foreground">No sessions found in the selected range.</p>
          )}
          {data.sessions.map((s) => (
            <div
              key={s._id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b pb-3 last:border-b-0"
            >
              <div>
                <p className="font-medium">{s.problem?.title || 'Untitled Problem'}</p>
                <p className="text-xs text-muted-foreground">
                  {topicLabelMap[s.topic] || s.topic} • {s.language} • {formatDate(s.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{s.difficulty}</Badge>
                <Badge variant={s.status === 'solved' ? 'default' : 'secondary'} className="capitalize">
                  {s.status}
                </Badge>
                <ScoreBadge score={s.aiReview?.score} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weak Area</CardTitle>
        </CardHeader>
        <CardContent>
          {weakestTopic ? (
            <p className="text-sm">
              Focus more on <span className="font-semibold">{topicLabelMap[weakestTopic.topic] || weakestTopic.topic}</span>
              {' '}({weakestTopic.solved}/{weakestTopic.count} solved).
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Not enough data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
