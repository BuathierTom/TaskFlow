import React, { useMemo } from 'react';
import { useTasksContext } from '@/context/TasksContext';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Timer, Clock, CheckCircle } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

const FocusSummaryWidget: React.FC = () => {
  const { tasks } = useTasksContext();
  const { paletteConfig } = useTheme();

  const { totalMinutes, pomodoros, activeTimers } = useMemo(() => {
    const totalSeconds = tasks.reduce((sum, task) => sum + task.trackedSeconds, 0);
    const pomodoroSessions = tasks.reduce((sum, task) => sum + task.pomodoroSessions, 0);
    const runningTimers = tasks.filter((task) => task.activeTimer).length;
    return {
      totalMinutes: Math.round(totalSeconds / 60),
      pomodoros: pomodoroSessions,
      activeTimers: runningTimers,
    };
  }, [tasks]);

  const focusTasksToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter((task) => {
      if (!task.updatedAt || task.status !== 'completed') return false;
      const updated = new Date(task.updatedAt);
      updated.setHours(0, 0, 0, 0);
      return updated.getTime() === today.getTime();
    }).length;
  }, [tasks]);

  return (
    <Card className={cn('border-0 shadow-sm', paletteConfig.cardSurface)}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Flame className={cn('h-5 w-5', paletteConfig.accentIcon)} />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Focus du jour
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Un coup d’œil sur votre rythme de concentration.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-200">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200/70 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/40 px-3 py-2">
            <Clock className="h-4 w-4" />
            <div>
              <div className="font-semibold">{totalMinutes} min</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Focus cumulés</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200/70 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/40 px-3 py-2">
            <Timer className="h-4 w-4" />
            <div>
              <div className="font-semibold">{activeTimers}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Chronos actifs</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200/70 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/40 px-3 py-2">
            <CheckCircle className="h-4 w-4" />
            <div>
              <div className="font-semibold">{focusTasksToday}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Tâches finies (aujourd’hui)</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200/70 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/40 px-3 py-2">
            <Flame className="h-4 w-4" />
            <div>
              <div className="font-semibold">{pomodoros}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Pomodoros cumulés</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FocusSummaryWidget;
