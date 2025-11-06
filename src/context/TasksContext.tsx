import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useTasks } from '@/hooks/use-tasks';
import { Task, TaskInput, TaskStatus } from '@/types/Task';

interface TasksContextValue {
  tasks: Task[];
  addTask: (task: TaskInput) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  clearCompleted: () => void;
  toggleStatus: (id: string) => void;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  completePomodoro: (id: string, durationSeconds: number) => void;
  scheduleBlock: (id: string, scheduledAt: Date, durationMinutes: 30 | 60) => void;
  unscheduleBlock: (id: string) => void;
}

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

const ensureId = (value?: string) => value ?? crypto.randomUUID();

const computeNextStatus = (status: TaskStatus): TaskStatus => {
  switch (status) {
    case 'todo':
      return 'in-progress';
    case 'in-progress':
      return 'completed';
    default:
      return 'todo';
  }
};

const pauseTaskTimer = (task: Task, now: Date) => {
  if (!task.activeTimer) {
    return task;
  }

  const startedAt = new Date(task.activeTimer.startedAt);
  const elapsed = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000));

  const timeLogs = task.timeLogs.map((log) =>
    log.id === task.activeTimer?.logId
      ? {
          ...log,
          end: now.toISOString(),
          durationSeconds: log.durationSeconds + elapsed,
        }
      : log
  );

  return {
    ...task,
    trackedSeconds: task.trackedSeconds + elapsed,
    timeLogs,
    activeTimer: undefined,
    updatedAt: now,
  };
};

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, userId } = useAuth();
  const { tasks, setTasks } = useTasks({ isSignedIn: Boolean(isSignedIn), userId });

  const value = useMemo<TasksContextValue>(() => {
    const addTask = (input: TaskInput): Task => {
      const now = new Date();
      const newTask: Task = {
        id: ensureId(),
        title: input.title,
        description: input.description,
        status: input.status ?? 'todo',
        priority: input.priority ?? 'medium',
        dueDate: input.dueDate,
        createdAt: now,
        updatedAt: now,
        userId: input.userId ?? userId ?? undefined,
        tags: input.tags ?? [],
        project: input.project,
        trackedSeconds: 0,
        timeLogs: [],
        activeTimer: undefined,
        scheduledAt: input.scheduledAt,
        durationMinutes: input.durationMinutes,
        pomodoroSessions: 0,
        pomodoroSeconds: 0,
        postponedCount: 0,
        subtasks: input.subtasks ?? [],
        dependencies: input.dependencies ?? [],
        difficultyPoints: input.difficultyPoints,
        estimatedHours: input.estimatedHours,
      };

      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
      const now = new Date();
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== id) {
            return task;
          }

          let postponedCount = task.postponedCount;
          if (updates.dueDate && task.dueDate && updates.dueDate > task.dueDate) {
            postponedCount += 1;
          }

          return {
            ...task,
            ...updates,
            postponedCount,
            updatedAt: now,
          };
        })
      );
    };

    const deleteTask = (id: string) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    const clearCompleted = () => {
      setTasks((prev) => prev.filter((task) => task.status !== 'completed'));
    };

    const toggleStatus = (id: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                status: computeNextStatus(task.status),
                updatedAt: new Date(),
              }
            : task
        )
      );
    };

    const startTimer = (id: string) => {
      const now = new Date();
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === id) {
            if (task.activeTimer) {
              return task;
            }
            const logId = ensureId();
            return {
              ...task,
              activeTimer: {
                startedAt: now.toISOString(),
                logId,
              },
              timeLogs: [
                ...task.timeLogs,
                {
                  id: logId,
                  start: now.toISOString(),
                  durationSeconds: 0,
                },
              ],
              updatedAt: now,
            };
          }

          return pauseTaskTimer(task, now);
        })
      );
    };

    const pauseTimer = (id: string) => {
      const now = new Date();
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? pauseTaskTimer(task, now) : task))
      );
    };

    const completePomodoro = (id: string, durationSeconds: number) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                pomodoroSessions: task.pomodoroSessions + 1,
                pomodoroSeconds: task.pomodoroSeconds + durationSeconds,
                trackedSeconds: task.trackedSeconds + durationSeconds,
                updatedAt: new Date(),
              }
            : task
        )
      );
    };

    const scheduleBlock = (id: string, scheduledAt: Date, duration: 30 | 60) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                scheduledAt,
                durationMinutes: duration,
                updatedAt: new Date(),
              }
            : task
        )
      );
    };

    const unscheduleBlock = (id: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                scheduledAt: undefined,
                durationMinutes: undefined,
                updatedAt: new Date(),
              }
            : task
        )
      );
    };

    return {
      tasks,
      addTask,
      updateTask,
      deleteTask,
      clearCompleted,
      toggleStatus,
      startTimer,
      pauseTimer,
      completePomodoro,
      scheduleBlock,
      unscheduleBlock,
    };
  }, [setTasks, tasks, userId]);

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};
