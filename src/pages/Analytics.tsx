import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/layouts/Layout';
import { useTasksContext } from '@/context/TasksContext';
import StatsSection from '@/components/StatsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
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
import type { LucideIcon } from 'lucide-react';

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
  const totalPomodoros = tasks.reduce((sum, task) => sum + task.pomodoroSessions, 0);

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

  const stats = useMemo(
    () => ({
      total: totalTasks,
      completed: completedTasks.length,
      inProgress: tasks.filter((task) => task.status === 'in-progress').length,
      overdue: tasks.filter((task) => task.dueDate && task.status !== 'completed' && new Date() > task.dueDate).length,
    }),
    [tasks, totalTasks, completedTasks.length]
  );

  type Indicator = {
    key: string;
    title: string;
    value: string;
    helper: string;
    icon: LucideIcon;
    iconBg: string;
  };

  const indicatorGroups: Array<{
    key: string;
    title: string;
    description: string;
    items: Indicator[];
  }> = [
    {
      key: 'progress',
      title: 'Progression & respect des délais',
      description: 'Comprenez votre avancement global et la tenue des échéances.',
      items: [
        {
          key: 'completion',
          title: 'Taux de complétion',
          value: `${completionRate}%`,
          helper: `${completedTasks.length} tâche${completedTasks.length > 1 ? 's' : ''} terminée${completedTasks.length > 1 ? 's' : ''} sur ${totalTasks || 0}`,
          icon: Gauge,
          iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300',
        },
        {
          key: 'lead',
          title: 'Temps moyen avant échéance',
          value: averageLeadTime !== null ? `${averageLeadTime > 0 ? '+' : ''}${averageLeadTime.toFixed(1)}j` : '—',
          helper: 'Basé sur les tâches terminées avec une date limite.',
          icon: CalendarClock,
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300',
        },
        {
          key: 'postponed',
          title: 'Tâches reportées',
          value: `${postponedTotal}`,
          helper: 'Nombre total de reports d’échéance effectués.',
          icon: ArrowUpRight,
          iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
        },
      ],
    },
    {
      key: 'activity',
      title: 'Activité planifiée & en cours',
      description: 'Suivez vos sessions de focus et l’engagement sur les tâches.',
      items: [
        {
          key: 'scheduled',
          title: 'Focus planifiés',
          value: `${scheduledTasks}`,
          helper: 'Tâches disposant d’un bloc dans le calendrier.',
          icon: Clock,
          iconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
        },
        {
          key: 'timers',
          title: 'Chronos actifs',
          value: `${activeTimers}`,
          helper: 'Tâches actuellement chronométrées.',
          icon: Flame,
          iconBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300',
        },
        {
          key: 'pomodoro',
          title: 'Pomodoros cumulés',
          value: `${totalPomodoros}`,
          helper: 'Sessions de focus terminées avec succès.',
          icon: CheckCircle,
          iconBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300',
        },
      ],
    },
  ];

  const { paletteConfig } = useTheme();

  const indicatorContent = (
    <div className="grid gap-6 xl:grid-cols-2">
      {indicatorGroups.map((group) => (
        <Card
          key={group.key}
          className={cn('p-6', paletteConfig.cardSurface)}
        >
          <div className="mb-5 space-y-1.5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {group.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {group.description}
            </p>
          </div>
          <div className="space-y-3">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="flex items-start justify-between gap-4 rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-900/60 px-4 py-3"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {item.title}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1.5">
                      {item.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                      {item.helper}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 ${item.iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );

  const focusContent = (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className={cn('p-6', paletteConfig.cardSurface)}>
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

      <Card className={cn('p-6', paletteConfig.cardSurface)}>
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
              {statusData.map((entry) => (
                <Cell key={`cell-${entry.label}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </Card>
    </div>
  );

  const analysisContent = (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className={cn('p-6', paletteConfig.cardSurface)}>
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

      <Card className={cn('p-6', paletteConfig.cardSurface)}>
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
  );

  const analyticsTabs = [
    {
      key: 'metrics',
      label: 'Indicateurs',
      description: 'Les métriques prioritaires regroupées par thématique.',
      content: indicatorContent,
    },
    {
      key: 'focus',
      label: 'Focus & productivité',
      description: 'Analyse du temps de concentration et de votre pipeline.',
      content: focusContent,
    },
    {
      key: 'analysis',
      label: 'Analyse détaillée',
      description: 'Zoom sur les projets et tags les plus gourmands.',
      content: analysisContent,
    },
  ] as const;

  const [activeTab, setActiveTab] = useState<(typeof analyticsTabs)[number]['key']>('metrics');

  return (
    <Layout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={cn('text-3xl font-bold bg-clip-text text-transparent', paletteConfig.headerGradient)}>
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

        <StatsSection stats={stats} />

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as (typeof analyticsTabs)[number]['key'])
          }
          className="space-y-6"
        >
          <TabsList
            className={cn(
              'flex w-full items-center gap-2 rounded-xl p-2 shadow-sm',
              paletteConfig.filterContainer
            )}
          >
            {analyticsTabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className={cn(
                  'flex-1 min-w-[200px] justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  paletteConfig.filterInactive,
                  paletteConfig.tabActive
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {analyticsTabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="space-y-4 focus-visible:outline-none">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {tab.label}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tab.description}</p>
              </div>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analytics;
