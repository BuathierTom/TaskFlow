import { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Clock, CheckCircle2, Circle, AlertCircle, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

import TaskForm from '@/components/TaskForm';
import TaskItem from '@/components/TaskItem';
import FilterBar from '@/components/FilterBar';
import StatsCard from '@/components/StatsCard';

import { useTasks } from '@/hooks/use-tasks';
import { useTheme } from '@/hooks/use-theme';
import { Task, FilterType } from '@/types/Task';

const Index = () => {
  const { tasks, setTasks } = useTasks();
  const { darkMode, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks(prev => [newTask, ...prev]);
    setShowForm(false);
    toast({
      title: "Tâche créée",
      description: "Votre nouvelle tâche a été ajoutée avec succès.",
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
    setEditingTask(null);
    toast({
      title: "Tâche mise à jour",
      description: "Les modifications ont été sauvegardées.",
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast({
      title: "Tâche supprimée",
      description: "La tâche a été supprimée définitivement.",
      variant: "destructive",
    });
  };

  const clearCompleted = () => {
    const completedCount = tasks.filter(task => task.status === 'completed').length;
    setTasks(prev => prev.filter(task => task.status !== 'completed'));
    toast({
      title: "Tâches terminées supprimées",
      description: `${completedCount} tâche(s) supprimée(s).`,
    });
  };

  const isOverdue = (task: Task) => {
    return task.dueDate && task.status !== 'completed' && new Date() > task.dueDate;
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'active':
        filtered = filtered.filter(task => task.status !== 'completed');
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'completed');
        break;
      case 'overdue':
        filtered = filtered.filter(task => isOverdue(task));
        break;
    }

    return filtered;
  }, [tasks, searchQuery, filter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const overdue = tasks.filter(task => isOverdue(task)).length;

    return { total, completed, inProgress, overdue };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Organisez vos tâches avec style et efficacité
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="transition-all duration-200 hover:scale-105"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total"
            value={stats.total}
            icon={<Circle className="h-5 w-5" />}
            color="blue"
          />
          <StatsCard
            title="En cours"
            value={stats.inProgress}
            icon={<Clock className="h-5 w-5" />}
            color="orange"
          />
          <StatsCard
            title="Terminées"
            value={stats.completed}
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="green"
          />
          <StatsCard
            title="En retard"
            value={stats.overdue}
            icon={<AlertCircle className="h-5 w-5" />}
            color="red"
          />
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-6 shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher des tâches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>

              <FilterBar filter={filter} onFilterChange={setFilter} />

              {stats.completed > 0 && (
                <Button
                  variant="outline"
                  onClick={clearCompleted}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer terminées
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
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
                    onClick={() => setShowForm(true)}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une tâche
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onEdit={setEditingTask}
                isOverdue={isOverdue(task)}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              />
            ))
          )}
        </div>

        {/* Task Form Modal */}
        {(showForm || editingTask) && (
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? (data) => updateTask(editingTask.id, data) : addTask}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
