export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
export type FilterType = 'all' | 'active' | 'completed' | 'overdue';
