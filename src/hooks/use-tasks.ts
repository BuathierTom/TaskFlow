import { useState, useEffect } from 'react';
import { Task, TimeLog, TaskPriority, TaskStatus } from '@/types/Task';

type UseTasksOptions = {
  isSignedIn: boolean;
  userId?: string | null;
};

export function useTasks({ isSignedIn, userId }: UseTasksOptions) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const normalizeStatus = (status: string | undefined): TaskStatus => {
    if (status === 'in-progress' || status === 'completed') {
      return status;
    }
    return 'todo';
  };

  const normalizePriority = (priority: string | undefined): TaskPriority => {
    if (priority === 'low' || priority === 'high') {
      return priority;
    }
    return 'medium';
  };

  const parseTimeLogs = (timeLogs: any[] | undefined): TimeLog[] => {
    if (!Array.isArray(timeLogs)) {
      return [];
    }
    return timeLogs.map((log) => ({
      id: log.id,
      start: log.start,
      end: log.end,
      durationSeconds: typeof log.durationSeconds === 'number' ? log.durationSeconds : 0,
    }));
  };

  useEffect(() => {
    const storageKey = isSignedIn && userId ? `tasks_${userId}` : 'tasks_anonymous';
    const savedTasks = localStorage.getItem(storageKey);
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => {
        const timeLogs = parseTimeLogs(task.timeLogs);
        const trackedSeconds =
          typeof task.trackedSeconds === 'number'
            ? task.trackedSeconds
            : timeLogs.reduce(
                (total, log) => total + (typeof log.durationSeconds === 'number' ? log.durationSeconds : 0),
                0
              );

        return {
          ...task,
          status: normalizeStatus(task.status),
          priority: normalizePriority(task.priority),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          scheduledAt: task.scheduledAt ? new Date(task.scheduledAt) : undefined,
          tags: Array.isArray(task.tags) ? task.tags : [],
          project: task.project || undefined,
          timeLogs,
          trackedSeconds,
          activeTimer: task.activeTimer
            ? {
                startedAt: task.activeTimer.startedAt,
                logId: task.activeTimer.logId,
              }
            : undefined,
          durationMinutes:
            task.durationMinutes === 60
              ? 60
              : task.durationMinutes === 30
              ? 30
              : undefined,
          pomodoroSessions: typeof task.pomodoroSessions === 'number' ? task.pomodoroSessions : 0,
          pomodoroSeconds: typeof task.pomodoroSeconds === 'number' ? task.pomodoroSeconds : 0,
          postponedCount: typeof task.postponedCount === 'number' ? task.postponedCount : 0,
        };
      });
      setTasks(parsedTasks);
    } else {
      setTasks([]);
    }
  }, [isSignedIn, userId]);

  useEffect(() => {
    const storageKey = isSignedIn && userId ? `tasks_${userId}` : 'tasks_anonymous';
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, isSignedIn, userId]);

  return { tasks, setTasks };
}
