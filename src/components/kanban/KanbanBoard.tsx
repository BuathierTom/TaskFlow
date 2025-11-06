import React, { useMemo, useState } from 'react';
import { Task } from '@/types/Task';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import {
  Clock,
  PlayCircle,
  PauseCircle,
  MoreHorizontal,
  ArrowRightLeft,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStartTimer: (id: string) => void;
  onPauseTimer: (id: string) => void;
}

type GroupByOption = 'status' | 'priority';

const statusColumns = [
  { key: 'todo', label: 'À faire', description: 'Tâches prêtes à démarrer' },
  { key: 'in-progress', label: 'En cours', description: 'En pleine exécution' },
  { key: 'completed', label: 'Terminées', description: 'À célébrer !' },
] as const;

const priorityColumns = [
  { key: 'high', label: 'Haute priorité', description: 'Action immédiate' },
  { key: 'medium', label: 'Priorité moyenne', description: 'À planifier' },
  { key: 'low', label: 'Faible priorité', description: 'À faire plus tard' },
] as const;

const KanbanCard: React.FC<{
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onStartTimer: (id: string) => void;
  onPauseTimer: (id: string) => void;
}> = ({ task, onEdit, onDelete, onUpdate, onStartTimer, onPauseTimer }) => {
  const { paletteConfig } = useTheme();
  const isTimerRunning = Boolean(task.activeTimer);
  const completedSubtasks = useMemo(
    () => task.subtasks.filter((subtask) => subtask.completed).length,
    [task.subtasks]
  );

  const handleStatusChange = (nextStatus: Task['status']) => {
    onUpdate(task.id, { status: nextStatus });
  };

  const handlePriorityChange = (nextPriority: Task['priority']) => {
    onUpdate(task.id, { priority: nextPriority });
  };

  const formatTime = (date?: Date) =>
    date
      ? new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date)
      : null;

  return (
    <div className={cn('rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border', paletteConfig.cardSurface)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {task.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-500">
              Supprimer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('todo')}>
              Statut: À faire
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>
              Statut: En cours
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
              Statut: Terminée
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange('high')}>
              Priorité: Haute
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange('medium')}>
              Priorité: Moyenne
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange('low')}>
              Priorité: Faible
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="outline" className="text-xs">
          {task.status === 'todo'
            ? 'À faire'
            : task.status === 'in-progress'
            ? 'En cours'
            : 'Terminée'}
        </Badge>
        <Badge
          variant="secondary"
          className={cn(
            'text-xs',
            task.priority === 'high' && 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-200',
            task.priority === 'medium' && paletteConfig.accentBadge,
            task.priority === 'low' && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-200'
          )}
        >
          {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Faible'}
        </Badge>
        {task.project && (
          <Badge variant="outline" className="text-xs">
            {task.project}
          </Badge>
        )}
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[11px] uppercase tracking-wide bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {task.subtasks.length > 0 && (
        <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Checklist: {completedSubtasks}/{task.subtasks.length}
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-3">
        {task.dueDate && (
          <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full border', paletteConfig.dueBadge)}>
            <Clock className="h-3 w-3" />
            {formatTime(task.dueDate)}
          </div>
        )}
        {task.scheduledAt && (
          <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full border', paletteConfig.scheduleBadge)}>
            <Clock className="h-3 w-3" />
            {formatTime(task.scheduledAt)} · {task.durationMinutes ?? 30} min
          </div>
        )}
        {typeof task.difficultyPoints === 'number' && (
          <div>Difficulté: {task.difficultyPoints}</div>
        )}
        {typeof task.estimatedHours === 'number' && (
          <div>Estimation: {task.estimatedHours} h</div>
        )}
        {task.dependencies.length > 0 && (
          <div>Dépendances: {task.dependencies.length}</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant={isTimerRunning ? 'destructive' : 'outline'}
          onClick={() => (isTimerRunning ? onPauseTimer(task.id) : onStartTimer(task.id))}
          className="flex items-center gap-2 text-xs"
        >
          {isTimerRunning ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
          {isTimerRunning ? 'Pause' : 'Start'}
        </Button>
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
          <Clock className="h-3 w-3" />
          {Math.round(task.trackedSeconds / 60)} min
        </div>
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdate,
  onDelete,
  onEdit,
  onStartTimer,
  onPauseTimer,
}) => {
  const [groupBy, setGroupBy] = useState<GroupByOption>('status');

  const groupedColumns = useMemo(() => {
    if (groupBy === 'status') {
      return statusColumns.map((column) => ({
        ...column,
        tasks: tasks.filter((task) => task.status === column.key),
      }));
    }

    return priorityColumns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.priority === column.key),
    }));
  }, [groupBy, tasks]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vue Kanban</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualisez vos tâches par statut ou par niveau de priorité.
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={groupBy}
          onValueChange={(value: string) => {
            if (value) setGroupBy(value as GroupByOption);
          }}
          className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg"
        >
          <ToggleGroupItem value="status" className="text-xs flex items-center gap-1">
            <ArrowRightLeft className="h-3 w-3" />
            Statut
          </ToggleGroupItem>
          <ToggleGroupItem value="priority" className="text-xs flex items-center gap-1">
            <ArrowRightLeft className="h-3 w-3 rotate-90" />
            Priorité
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {groupedColumns.map((column) => (
          <Card
            key={column.key}
            className="p-4 bg-gray-50/60 dark:bg-gray-900/60 border border-dashed border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                  {column.label}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {column.description}
                </p>
              </div>
              <Badge variant="secondary">{column.tasks.length}</Badge>
            </div>

            <div className="space-y-3">
              {column.tasks.length === 0 ? (
                <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">
                  Rien ici pour le moment.
                </div>
              ) : (
                column.tasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    onStartTimer={onStartTimer}
                    onPauseTimer={onPauseTimer}
                  />
                ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
