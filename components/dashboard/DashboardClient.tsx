'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp, Target, CheckCircle2, BarChart3, RefreshCw, Percent, ArrowRight,
} from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Radar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  ArcElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

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

const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

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
  const [days, setDays] = useState('30');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/progress?days=${days}&limit=50`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to load dashboard');
      setData(body as ProgressResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const topicChartData = useMemo(() => {
    if (!data) return null;
    const labels = data.aggregates.byTopic.map((t) => topicLabelMap[t.topic] || t.topic);
    const values = data.aggregates.byTopic.map((t) => Number(((t.count ? t.solved / t.count : 0) * 100).toFixed(1)));
    return {
      labels,
      datasets: [
        {
          label: 'Solve Rate %',
          data: values,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        },
      ],
    };
  }, [data]);

  const difficultyChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.aggregates.byDifficulty.map((d) => d.difficulty.toUpperCase()),
      datasets: [
        {
          label: 'Solved Count',
          data: data.aggregates.byDifficulty.map((d) => d.solved),
          backgroundColor: [
            'rgba(34, 197, 94, 0.75)',
            'rgba(245, 158, 11, 0.75)',
            'rgba(239, 68, 68, 0.75)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  const progressChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.aggregates.byDate.map((d) => d.date.slice(5)),
      datasets: [
        {
          label: 'Sessions',
          data: data.aggregates.byDate.map((d) => d.count),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          tension: 0.25,
          fill: true,
        },
        {
          label: 'Solved',
          data: data.aggregates.byDate.map((d) => d.solved),
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.25,
          fill: true,
        },
      ],
    };
  }, [data]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
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

  if (data.summary.total === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <BarChart3 className="h-16 w-16 text-muted-foreground/40" />
          <h2 className="text-xl font-semibold">No practice data yet</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Complete your first practice session to start seeing analytics, charts, and progress tracking here.
          </p>
          <Button asChild className="mt-2">
            <Link href="/">
              Start Practicing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your practice analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.summary.total}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Solved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.summary.solved}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4 text-amber-500" />
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {typeof data.summary.averageScore === 'number' ? data.summary.averageScore.toFixed(1) : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Percent className="h-4 w-4 text-violet-500" />
              Solve Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {data.summary.total > 0
                ? `${((data.summary.solved / data.summary.total) * 100).toFixed(0)}%`
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts — only rendered when data exists */}
      {(topicChartData && topicChartData.labels.length > 0) ||
       (difficultyChartData && difficultyChartData.labels.length > 0) ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {topicChartData && topicChartData.labels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Topic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-72">
                  <Radar
                    data={topicChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        r: {
                          beginAtZero: true,
                          suggestedMax: 100,
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {difficultyChartData && difficultyChartData.labels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Difficulty Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-72">
                  <Doughnut
                    data={difficultyChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {progressChartData && progressChartData.labels.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-72">
              <Line
                data={progressChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Hint when no charts have data at all */}
      {!(topicChartData && topicChartData.labels.length > 0) &&
       !(difficultyChartData && difficultyChartData.labels.length > 0) &&
       !(progressChartData && progressChartData.labels.length > 0) && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center gap-3 py-8">
            <BarChart3 className="h-5 w-5 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Charts will appear here once you complete a few practice sessions.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Topic Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.aggregates.byTopic.length === 0 && (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
            {data.aggregates.byTopic.map((topic) => {
              const solveRate = topic.count ? Math.round((topic.solved / topic.count) * 100) : 0;
              return (
                <div key={topic.topic} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{topicLabelMap[topic.topic] || topic.topic}</p>
                      <p className="text-xs text-muted-foreground">
                        {topic.solved}/{topic.count} solved
                      </p>
                    </div>
                    <ScoreBadge score={topic.avgScore ?? undefined} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={solveRate} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-9 text-right">{solveRate}%</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Difficulty Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.aggregates.byDifficulty.length === 0 && (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
            {data.aggregates.byDifficulty.map((d) => {
              const solveRate = d.count ? Math.round((d.solved / d.count) * 100) : 0;
              return (
                <div key={d.difficulty} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize text-sm">{d.difficulty}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.solved}/{d.count} solved
                      </p>
                    </div>
                    <ScoreBadge score={d.avgScore ?? undefined} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={solveRate} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-9 text-right">{solveRate}%</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {data.sessions.length === 0 && (
            <p className="text-sm text-muted-foreground">No sessions found in the selected range.</p>
          )}
          {data.sessions.map((s) => (
            <div
              key={s._id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg px-3 py-3 hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{s.problem?.title || 'Untitled Problem'}</p>
                <p className="text-xs text-muted-foreground">
                  {topicLabelMap[s.topic] || s.topic} &middot; {s.language} &middot; {formatDate(s.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-xs">{s.difficulty}</Badge>
                <Badge variant={s.status === 'solved' ? 'default' : 'secondary'} className="capitalize text-xs">
                  {s.status}
                </Badge>
                <ScoreBadge score={s.aiReview?.score} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Insights row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-red-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-red-400" />
              Weak Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakestTopic ? (
              <div className="space-y-2">
                <p className="text-sm">
                  Focus more on <span className="font-semibold">{topicLabelMap[weakestTopic.topic] || weakestTopic.topic}</span>
                  {' '}&mdash; only {weakestTopic.solved}/{weakestTopic.count} solved
                  ({weakestTopic.count > 0 ? Math.round((weakestTopic.solved / weakestTopic.count) * 100) : 0}% rate).
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/practice?topic=${weakestTopic.topic}`}>
                    Practice {topicLabelMap[weakestTopic.topic] || weakestTopic.topic}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not enough data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Strongest Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strongestTopic ? (
              <p className="text-sm">
                You&apos;re doing great at <span className="font-semibold">{topicLabelMap[strongestTopic.topic] || strongestTopic.topic}</span>
                {' '}&mdash; {strongestTopic.solved}/{strongestTopic.count} solved
                ({strongestTopic.count > 0 ? Math.round((strongestTopic.solved / strongestTopic.count) * 100) : 0}% rate).
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Not enough data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}