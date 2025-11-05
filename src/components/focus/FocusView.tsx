import React, { useEffect, useMemo, useState } from 'react';
import { Task } from '@/types/Task';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  PlayCircle,
  PauseCircle,
  Clock,
  Flame,
  Zap,
  TrendingUp,
  Tag,
  Briefcase,
} from 'lucide-react';

interface FocusViewProps {
  tasks: Task[];
  onStartTimer: (id: string) => void;
  onPauseTimer: (id: string) => void;
  onCompletePomodoro: (id: string, durationSeconds: number) => void;
}

const formatSeconds = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

const FocusView: React.FC<FocusViewProps> = ({
  tasks,
  onStartTimer,
  onPauseTimer,
  onCompletePomodoro,
}) => {
  const [pomodoroDuration, setPomodoroDuration] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(pomodoroDuration);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const activeTask = tasks.find((task) => task.activeTimer);

  useEffect(() => {
    if (activeTask && !selectedTaskId) {
      setSelectedTaskId(activeTask.id);
    }
  }, [activeTask, selectedTaskId]);

  useEffect(() => {
    let interval: number | undefined;
    if (isPomodoroRunning) {
      interval = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (selectedTaskId) {
              onCompletePomodoro(selectedTaskId, pomodoroDuration);
            }
            setIsPomodoroRunning(false);
            return pomodoroDuration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isPomodoroRunning, pomodoroDuration, onCompletePomodoro, selectedTaskId]);

  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const weekEnd = useMemo(() => endOfWeek(new Date(), { weekStartsOn: 1 }), []);

  const weeklyLogs = useMemo(() => {
    return tasks.flatMap((task) =>
      task.timeLogs
        .filter((log) =>
          isWithinInterval(new Date(log.start), {
            start: weekStart,
            end: weekEnd,
          })
        )
        .map((log) => ({
          task,
          duration: log.durationSeconds,
        }))
    );
  }, [tasks, weekStart, weekEnd]);

  const weeklyTotals = useMemo(() => {
    const total = weeklyLogs.reduce((sum, log) => sum + log.duration, 0);
    const tagsMap = new Map<string, number>();
    const projectMap = new Map<string, number>();

    weeklyLogs.forEach(({ task, duration }) => {
      if (task.tags.length > 0) {
        task.tags.forEach((tag) => {
          tagsMap.set(tag, (tagsMap.get(tag) || 0) + duration);
        });
      }
      if (task.project) {
        projectMap.set(task.project, (projectMap.get(task.project) || 0) + duration);
      }
    });

    return {
      total,
      tags: Array.from(tagsMap.entries())
        .map(([label, seconds]) => ({ label, seconds }))
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 5),
      projects: Array.from(projectMap.entries())
        .map(([label, seconds]) => ({ label, seconds }))
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 5),
    };
  }, [weeklyLogs]);

  const sortedFocusTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => task.status !== 'completed')
      .sort((a, b) => {
        if (a.activeTimer) return -1;
        if (b.activeTimer) return 1;
        if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
        if (b.status === 'in-progress' && a.status !== 'in-progress') return 1;
        const priorityRank = { high: 0, medium: 1, low: 2 };
        return priorityRank[a.priority] - priorityRank[b.priority];
      })
      .slice(0, 6);
  }, [tasks]);

  const pomodoroMinutes = Math.floor(remainingSeconds / 60);
  const pomodoroSeconds = remainingSeconds % 60;

  const totalPomodoroSessions = tasks.reduce((sum, task) => sum + task.pomodoroSessions, 0);
  const totalPomodoroSeconds = tasks.reduce((sum, task) => sum + task.pomodoroSeconds, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
            <Clock className="h-3 w-3" />
            Focus en cours
          </div>
          {activeTask ? (
            <div className="mt-3">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {activeTask.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {activeTask.project || 'Sans projet'} · {activeTask.priority === 'high' ? 'Haute' : activeTask.priority === 'medium' ? 'Moyenne' : 'Faible'} priorité
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="mt-3 flex items-center gap-2"
                onClick={() => onPauseTimer(activeTask.id)}
              >
                <PauseCircle className="h-4 w-4" />
                Pause
              </Button>
            </div>
          ) : (
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Lancez un focus pour accumuler du temps de concentration.
            </div>
          )}
        </Card>

        <Card className="p-5 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
            <TrendingUp className="h-3 w-3" />
            Focus hebdo
          </div>
          <div className="mt-3">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatSeconds(weeklyTotals.total)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              cumulés cette semaine (lun - dim)
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {weeklyTotals.tags.slice(0, 2).map((tagStat) => (
              <div key={tagStat.label}>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>#{tagStat.label}</span>
                  <span>{formatSeconds(tagStat.seconds)}</span>
                </div>
                <Progress value={(tagStat.seconds / weeklyTotals.total) * 100 || 0} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
            <Flame className="h-3 w-3 text-orange-500" />
            Pomodoro
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                {pomodoroMinutes.toString().padStart(2, '0')}:{pomodoroSeconds.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">min:s</div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Sessions complétées: {totalPomodoroSessions} · {formatSeconds(totalPomodoroSeconds)}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button
                size="sm"
                variant={isPomodoroRunning ? 'destructive' : 'default'}
                onClick={() => setIsPomodoroRunning((prev) => !prev)}
                className="flex items-center gap-2"
                disabled={!selectedTaskId}
              >
                {isPomodoroRunning ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                {isPomodoroRunning ? 'Pause' : 'Start'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsPomodoroRunning(false);
                  setRemainingSeconds(pomodoroDuration);
                }}
              >
                Reset
              </Button>
            </div>

            <div className="mt-3 space-y-2">
              <Select
                value={String(pomodoroDuration)}
                onValueChange={(value) => {
                  const duration = Number(value);
                  setPomodoroDuration(duration);
                  setRemainingSeconds(duration);
                }}
              >
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Durée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(25 * 60)}>25 min (Focus)</SelectItem>
                  <SelectItem value={String(50 * 60)}>50 min (Deep Work)</SelectItem>
                  <SelectItem value={String(15 * 60)}>15 min (Sprint)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Associer à une tâche" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Priorités du moment
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Classement intelligent basé sur le statut, la priorité et le suivi temps.
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {sortedFocusTasks.length} sélectionnées
          </Badge>
        </div>
        <div className="mt-4 space-y-3">
          {sortedFocusTasks.map((task) => {
            const isRunning = Boolean(task.activeTimer);
            return (
              <div
                key={task.id}
                className="rounded-lg border border-gray-200/60 dark:border-gray-800/60 bg-gray-50/60 dark:bg-gray-800/60 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {task.title}
                    </h5>
                    <Badge
                      variant="secondary"
                      className={task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}
                    >
                      {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Faible'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {task.status === 'todo' ? 'À faire' : task.status === 'in-progress' ? 'En cours' : 'Terminée'}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {task.project && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {task.project}
                      </span>
                    )}
                    {task.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {task.tags.join(', ')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatSeconds(task.trackedSeconds)}
                    </span>
                    {task.pomodoroSessions > 0 && (
                      <span className="flex items-center gap-1 text-orange-500">
                        <Flame className="h-3 w-3" />
                        {task.pomodoroSessions} × pomodoro
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isRunning ? 'destructive' : 'default'}
                    className="flex items-center gap-2"
                    onClick={() => (isRunning ? onPauseTimer(task.id) : onStartTimer(task.id))}
                  >
                    {isRunning ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                    {isRunning ? 'Pause' : 'Focus'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTaskId(task.id)}
                    className={selectedTaskId === task.id ? 'border-orange-500 text-orange-600' : ''}
                  >
                    Pomodoro
                  </Button>
                </div>
              </div>
            );
          })}
          {sortedFocusTasks.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Toutes vos tâches sont terminées. Profitez-en pour planifier la semaine prochaine !
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
            <Tag className="h-3 w-3" />
            Temps par tag (semaine)
          </div>
          <div className="mt-3 space-y-2">
            {weeklyTotals.tags.length === 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Aucun tag enregistré cette semaine.
              </div>
            )}
            {weeklyTotals.tags.map((tagStat) => (
              <div key={tagStat.label}>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>#{tagStat.label}</span>
                  <span>{formatSeconds(tagStat.seconds)}</span>
                </div>
                <Progress value={(tagStat.seconds / weeklyTotals.total) * 100 || 0} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
            <Briefcase className="h-3 w-3" />
            Temps par projet (semaine)
          </div>
          <div className="mt-3 space-y-2">
            {weeklyTotals.projects.length === 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Pas encore de temps attribué à un projet cette semaine.
              </div>
            )}
            {weeklyTotals.projects.map((projectStat) => (
              <div key={projectStat.label}>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{projectStat.label}</span>
                  <span>{formatSeconds(projectStat.seconds)}</span>
                </div>
                <Progress value={(projectStat.seconds / weeklyTotals.total) * 100 || 0} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FocusView;
