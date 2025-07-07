
import React from 'react';
import { Calendar, Clock, Edit, Trash2, CheckCircle2, Circle, PlayCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Task } from '@/pages/Index';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  isOverdue: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onUpdate,
  onDelete,
  onEdit,
  isOverdue,
  className,
  style,
}) => {
  const getStatusConfig = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          label: 'Terminée',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          borderColor: 'border-green-200 dark:border-green-800',
        };
      case 'in-progress':
        return {
          icon: <PlayCircle className="h-4 w-4" />,
          label: 'En cours',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
          borderColor: 'border-orange-200 dark:border-orange-800',
        };
      default:
        return {
          icon: <Circle className="h-4 w-4" />,
          label: 'À faire',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          borderColor: 'border-gray-200 dark:border-gray-700',
        };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const isCompleted = task.status === 'completed';

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleStatus = () => {
    let newStatus: Task['status'];
    switch (task.status) {
      case 'todo':
        newStatus = 'in-progress';
        break;
      case 'in-progress':
        newStatus = 'completed';
        break;
      case 'completed':
        newStatus = 'todo';
        break;
    }
    onUpdate(task.id, { status: newStatus });
  };

  return (
    <Card
      className={cn(
        'group transition-all duration-200 hover:shadow-md border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
        isOverdue && !isCompleted && 'ring-2 ring-red-200 dark:ring-red-800 bg-red-50/50 dark:bg-red-900/10',
        isCompleted && 'opacity-75',
        className
      )}
      style={style}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Status Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleStatus}
            className={cn(
              'mt-1 hover:scale-110 transition-all duration-200',
              statusConfig.color
            )}
          >
            {statusConfig.icon}
          </Button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3
                  className={cn(
                    'font-medium text-gray-900 dark:text-gray-100 transition-all duration-200',
                    isCompleted && 'line-through text-gray-500 dark:text-gray-500'
                  )}
                >
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Tags and Due Date */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="secondary" className={statusConfig.color}>
                    {statusConfig.icon}
                    <span className="ml-1">{statusConfig.label}</span>
                  </Badge>

                  {task.dueDate && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'flex items-center gap-1',
                        isOverdue && !isCompleted
                          ? 'border-red-300 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-400 dark:bg-red-900/20'
                          : 'border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:bg-blue-900/20'
                      )}
                    >
                      {isOverdue && !isCompleted ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : (
                        <Calendar className="h-3 w-3" />
                      )}
                      <span className="text-xs">
                        {formatDate(task.dueDate)}
                        {task.dueDate && !isCompleted && (
                          <span className="ml-1">
                            ({getDaysUntilDue(task.dueDate) === 0
                              ? "Aujourd'hui"
                              : getDaysUntilDue(task.dueDate) === 1
                              ? "Demain"
                              : getDaysUntilDue(task.dueDate) > 0
                              ? `dans ${getDaysUntilDue(task.dueDate)}j`
                              : `${Math.abs(getDaysUntilDue(task.dueDate))}j de retard`}
                            )
                          </span>
                        )}
                      </span>
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(task)}
                  className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600"
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskItem;