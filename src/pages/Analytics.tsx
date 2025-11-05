import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/layouts/Layout';
import { useTasksContext } from '@/context/TasksContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import {
  CalendarClock,
  ChartBar,
  Gauge,
  ArrowUpRight,
  Flame,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { format, isSameDay, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const palette = [
  '#2563eb',
  '#22c55e',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#0ea5e9',
];

const focusChartConfig = {
  minutes: {
    label: 'Minutes de focus',
    color: '#2563eb',
  },
};

const statusChartConfig = {
  value: {
    label: 'Tâches',
    color: '#22c55e',
  },
};

const Analytics = () => {
  const { tasks } = useTasksContext();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'completed');
  const completionRate = totalTasks ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const activeTimers = tasks.filter((task) => task.activeTimer).length;
  const scheduledTasks = tasks.filter((task) => task.scheduledAt).length;
  const totalTrackedSeconds = tasks.reduce((sum, task) => sum + task.trackedSeconds, 0);
  const postponedTotal = tasks.reduce((sum, task) => sum + task.postponedCount, 0);

  const averageLeadTime = useMemo(() => {
    const withDueDate = completedTasks.filter((task) => task.dueDate);
    if (!withDueDate.length) {
      return null;
    }
    const totalLead = withDueDate.reduce((sum, task) => {
      if (!task.dueDate) return sum;
      const delta = task.dueDate.getTime() - task.updatedAt.getTime();
      return sum + delta;
    }, 0);
    const averageMs = totalLead / withDueDate.length;
    return averageMs / (1000 * 60 * 60 * 24); // days
  }, [completedTasks]);

  const lastSevenDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => subDays(new Date(), 6 - index));
  }, []);

  const focusData = useMemo(() => {
    return lastSevenDays.map((day) => {
      const totalSeconds = tasks.reduce((sum, task) => {
        const daySeconds = task.timeLogs
          .filter((log) => isSameDay(new Date(log.start), day))
          .reduce((acc, log) => acc + log.durationSeconds, 0);
        return sum + daySeconds;
      }, 0);
      return {
        day: format(day, 'EEE', { locale: fr }),
        minutes: Math.round(totalSeconds / 60),
      };
    });
  }, [lastSevenDays, tasks]);

  const statusData = useMemo(() => {
    const mapping = [
      { status: 'todo', label: 'À faire', color: '#94a3b8' },
      { status: 'in-progress', label: 'En cours', color: '#f59e0b' },
      { status: 'completed', label: 'Terminées', color: '#22c55e' },
    ] as const;

    return mapping.map((entry) => ({
      label: entry.label,
      value: tasks.filter((task) => task.status === entry.status).length,
      fill: entry.color,
    }));
  }, [tasks]);

  const projectData = useMemo(() => {
    const projectMap = new Map<string, number>();
    tasks.forEach((task) => {
      if (!task.project) {
        return;
      }
      projectMap.set(task.project, (projectMap.get(task.project) || 0) + task.trackedSeconds);
    });

    return Array.from(projectMap.entries())
      .map(([name, seconds], index) => ({
        name,
        value: Math.round(seconds / 60),
        fill: palette[index % palette.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [tasks]);

  const tagData = useMemo(() => {
    const tagMap = new Map<string, number>();
    tasks.forEach((task) => {
      if (!task.tags.length) {
        return;
      }
      task.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + task.trackedSeconds);
      });
    });

    return Array.from(tagMap.entries())
      .map(([name, seconds], index) => ({
        name,
        value: Math.round(seconds / 60),
        fill: palette[(index + 2) % palette.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [tasks]);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Insights & Statistiques
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visualisez votre progression, votre rythme de focus et les tendances par projet.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/">Retour aux tâches</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Taux de complétion
                </p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                  {completionRate}%
                </p>
              </div>
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/40 p-3">
                <Gauge className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              {completedTasks.length} tâche{completedTasks.length > 1 ? 's' : ''} terminée{completedTasks.length > 1 ? 's' : ''} sur {totalTasks}.
            </p>
          </Card>

          <Card className="p-5 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Temps moyen avant échéance
                </p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                  {averageLeadTime !== null ? `${averageLeadTime > 0 ? '+' : ''}${averageLeadTime.toFixed(1)}j` : '—'}
                </p>
              </div>
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-3">
                <CalendarClock className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Mesuré sur les tâches terminées avec échéance.
            </p>
          </Card>

          <Card className="p-5 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Tâches reportées
                </p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                  {postponedTotal}
                </p>
              </div>
              <div className="rounded-full bg-amber-100 dark:bg-amber-900/40 p-3">
                <ArrowUpRight className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Nombre de fois où les échéances ont été décalées.
            </p>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Focus des 7 derniers jours
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Minutes cumulées de suivi de temps par jour.
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {Math.round(totalTrackedSeconds / 60)} min cumulées
              </Badge>
            </div>
            <ChartContainer config={focusChartConfig} className="w-full h-[260px]">
              <LineChart data={focusData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </Card>

          <Card className="p-6 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Répartition par statut
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Visualisez votre pipeline de tâches actuel.
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                <ChartBar className="h-3 w-3 mr-1" />
                {totalTasks} tâches
              </Badge>
            </div>
            <ChartContainer config={statusChartConfig} className="w-full h-[260px]">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${entry.label}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Focus par projet
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Minutes de travail cumulées pour vos projets principaux.
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Flame className="h-3 w-3 mr-1" />
                Top {projectData.length || 0}
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={projectData} layout="vertical">
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" hide />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" width={120} />
                <RechartsTooltip />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {projectData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Tags les plus chronophages
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Visualisez les thématiques qui consomment le plus de temps.
                </p>
              </div>
            </div>
            {tagData.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Ajoutez des tags à vos tâches pour débloquer cette vue.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={tagData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                    {tagData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
              {tagData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    #{entry.name}
                  </span>
                  <span>{entry.value} min</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Focus planifiés
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                  {scheduledTasks}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/40 p-3">
                <CalendarClock className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Chronos actifs
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                  {activeTimers}
                </p>
              </div>
              <div className="rounded-full bg-rose-100 dark:bg-rose-900/40 p-3">
                <Flame className="h-5 w-5 text-rose-600 dark:text-rose-300" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Pomodoro cumulés
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                  {tasks.reduce((sum, task) => sum + task.pomodoroSessions, 0)}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 dark:bg-orange-900/40 p-3">
                <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
