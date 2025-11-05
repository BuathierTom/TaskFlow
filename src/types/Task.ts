export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type FilterType = 'all' | 'active' | 'completed' | 'overdue';

export interface TimeLog {
  id: string;
  start: string;
  end?: string;
  durationSeconds: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  tags: string[];
  project?: string;
  trackedSeconds: number;
  timeLogs: TimeLog[];
  activeTimer?: {
    startedAt: string;
    logId: string;
  };
  scheduledAt?: Date;
  durationMinutes?: 30 | 60;
  pomodoroSessions: number;
  pomodoroSeconds: number;
  postponedCount: number;
}

export type TaskInput = Omit<
  Task,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'userId'
  | 'timeLogs'
  | 'activeTimer'
  | 'trackedSeconds'
  | 'pomodoroSessions'
  | 'pomodoroSeconds'
  | 'postponedCount'
> & {
  userId?: string;
};
