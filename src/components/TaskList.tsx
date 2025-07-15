import { Plus, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import TaskItem from '@/components/TaskItem';
import { Task } from '@/types/Task';
import { Button } from '@/components/ui/button';

interface TaskListProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  isOverdue: (task: Task) => boolean;
  showForm: () => void;
  searchQuery: string;
  filter: string;
}

export default function TaskList({
  tasks,
  onUpdate,
  onDelete,
  onEdit,
  isOverdue,
  showForm,
  searchQuery,
  filter,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 mb-4">
            <Circle className="h-12 w-12 mx-auto mb-4 opacity-30" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            {searchQuery || filter !== 'all' ? 'Aucune tâche trouvée' : 'Aucune tâche'}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 text-sm text-center">
            {searchQuery || filter !== 'all'
              ? 'Essayez de modifier vos critères de recherche ou de filtrage.'
              : 'Commencez par créer votre première tâche !'}
          </p>
          {!searchQuery && filter === 'all' && (
            <Button
              onClick={showForm}
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer une tâche
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onEdit={onEdit}
          isOverdue={isOverdue(task)}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}
    </div>
  );
}
