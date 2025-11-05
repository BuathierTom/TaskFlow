import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  Tag,
  Briefcase,
  Timer,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, TaskPriority } from '@/types/Task';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStartTimer: (id: string) => void;
  onPauseTimer: (id: string) => void;
  isOverdue: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const priorityStyles: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

const statusConfigMap = {
  completed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: 'Terminée',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  'in-progress': {
    icon: <PlayCircle className="h-4 w-4" />,
    label: 'En cours',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
  todo: {
    icon: <Circle className="h-4 w-4" />,
    label: 'À faire',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  },
};

const formatTrackedTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${secs}s`;
};

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onUpdate,
  onDelete,
  onEdit,
  onStartTimer,
  onPauseTimer,
  isOverdue,
  className,
  style,
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!task.activeTimer) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, [task.activeTimer]);

  const totalTrackedSeconds = useMemo(() => {
    const base = task.trackedSeconds;
    if (task.activeTimer) {
      const startedAt = new Date(task.activeTimer.startedAt).getTime();
      const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
      return base + elapsed;
    }
    return base;
  }, [task.trackedSeconds, task.activeTimer, now]);

  const statusConfig = statusConfigMap[task.status];
  const isCompleted = task.status === 'completed';
  const isTimerRunning = Boolean(task.activeTimer);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleStatusToggle = () => {
    let newStatus: Task['status'];
    switch (task.status) {
      case 'todo':
        newStatus = 'in-progress';
        break;
      case 'in-progress':
        newStatus = 'completed';
        break;
      case 'completed':
      default:
        newStatus = 'todo';
        break;
    }
    onUpdate(task.id, { status: newStatus });
  };

  const scheduledInfo = useMemo(() => {
    if (!task.scheduledAt) {
      return undefined;
    }

    const start = task.scheduledAt;
    const end = new Date(start.getTime() + (task.durationMinutes ?? 30) * 60 * 1000);
    return { start, end };
  }, [task.scheduledAt, task.durationMinutes]);

  return (
    <Card
      className={cn(
        'group transition-all duration-200 hover:shadow-md border border-gray-200/50 dark:border-gray-700/40 bg-white/60 dark:bg-gray-900/50 backdrop-blur',
        isOverdue && !isCompleted && 'ring-2 ring-red-200 dark:ring-red-700 bg-red-50/40 dark:bg-red-900/20',
        isCompleted && 'opacity-75',
        className
      )}
      style={style}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStatusToggle}
            className={cn('mt-1 hover:scale-110 transition-all duration-200', statusConfig.color)}
            aria-label="Changer le statut"
          >
            {statusConfig.icon}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3
                    className={cn(
                      'font-semibold text-lg text-gray-900 dark:text-gray-100',
                      isCompleted && 'line-through text-gray-500 dark:text-gray-500'
                    )}
                  >
                    {task.title}
                  </h3>
                  <Badge variant="secondary" className={priorityStyles[task.priority]}>
                    <Timer className="h-3 w-3 mr-1" />
                    {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Faible'}
                  </Badge>
                  <Badge variant="secondary" className={statusConfig.color}>
                    {statusConfig.icon}
                    <span className="ml-1">{statusConfig.label}</span>
                  </Badge>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  {task.project && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {task.project}
                    </span>
                  )}
                  {task.tags.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {task.tags.map((tag) => `#${tag}`).join(', ')}
                    </span>
                  )}
                  {task.dueDate && (
                    <span
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-full border',
                        isOverdue && !isCompleted
                          ? 'border-red-300 text-red-600 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-900/20'
                          : 'border-amber-300 text-amber-600 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-900/20'
                      )}
                    >
                      {isOverdue && !isCompleted ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : (
                        <Calendar className="h-3 w-3" />
                      )}
                      {formatDate(task.dueDate)}
                      {!isCompleted && (
                        <span className="ml-1">
                          (
                          {(() => {
                            const diff = getDaysUntilDue(task.dueDate);
                            if (diff === 0) return "Aujourd'hui";
                            if (diff === 1) return 'Demain';
                            if (diff > 0) return `dans ${diff}j`;
                            return `${Math.abs(diff)}j de retard`;
                          })()}
                          )
                        </span>
                      )}
                    </span>
                  )}
                  {scheduledInfo && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full border border-purple-300 text-purple-600 bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:bg-purple-900/20">
                      <Clock className="h-3 w-3" />
                      {formatDate(scheduledInfo.start)} · {task.durationMinutes ?? 30} min
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(task)}
                  className="h-8 w-8 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(task.id)}
                  className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant={isTimerRunning ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => (isTimerRunning ? onPauseTimer(task.id) : onStartTimer(task.id))}
                  className="flex items-center gap-2"
                >
                  {isTimerRunning ? (
                    <>
                      <PauseCircle className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Start
                    </>
                  )}
                </Button>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTrackedTime(totalTrackedSeconds)}
                </Badge>
                {task.pomodoroSessions > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {task.pomodoroSessions} pomodoro(s)
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
