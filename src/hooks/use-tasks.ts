import { useState, useEffect } from 'react';
import { Task } from '@/types/Task';

type UseTasksOptions = {
  isSignedIn: boolean;
  userId?: string | null;
};

export function useTasks({ isSignedIn, userId }: UseTasksOptions) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const storageKey = isSignedIn && userId ? `tasks_${userId}` : 'tasks_anonymous';
    const savedTasks = localStorage.getItem(storageKey);
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }));
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
