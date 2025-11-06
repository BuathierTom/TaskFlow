import { useState, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@clerk/clerk-react';
import TaskForm from '@/components/TaskForm';
import { Task, FilterType } from '@/types/Task';
import { useTasksContext } from '@/context/TasksContext';

import Layout from '@/layouts/Layout';
import Header from '@/layouts/Header';
import StatsSection from '@/components/StatsSection';
import SearchAndFilterBar from '@/components/SearchAndFilterBar';
import TaskList from '@/components/TaskList';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import CalendarView from '@/components/calendar/CalendarView';
import FocusView from '@/components/focus/FocusView';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Circle, ListTodo, KanbanSquare, CalendarRange, Timer } from 'lucide-react';
import AuthHeader from '@/components/AuthHeader';
import { useTheme } from '@/hooks/use-theme';
import FocusSummaryWidget from '@/components/dashboard/FocusSummaryWidget';
import HabitsWidget from '@/components/dashboard/HabitsWidget';
import { useDashboardSettings } from '@/context/DashboardSettingsContext';

const Index = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    clearCompleted,
    startTimer,
    pauseTimer,
    scheduleBlock,
    unscheduleBlock,
    completePomodoro,
  } = useTasksContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'kanban' | 'calendar' | 'focus'>('list');
  const completedCount = useMemo(
    () => tasks.filter((task) => task.status === 'completed').length,
    [tasks]
  );
  const hasTasks = tasks.length > 0;
  const { paletteConfig } = useTheme();
  const { settings } = useDashboardSettings();

  const isOverdue = (task: Task) => {
    return task.dueDate && task.status !== 'completed' && new Date() > task.dueDate;
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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

  const openCreateForm = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleStartTimer = (id: string) => {
    startTimer(id);
    toast({
      title: "Chrono démarré",
      description: "Le suivi du temps est en cours pour cette tâche.",
    });
  };

  const handlePauseTimer = (id: string) => {
    pauseTimer(id);
    toast({
      title: "Chrono mis en pause",
      description: "Le suivi du temps est suspendu.",
    });
  };

  const handleScheduleBlock = (id: string, scheduledAt: Date, duration: 30 | 60) => {
    scheduleBlock(id, scheduledAt, duration);
    toast({
      title: "Bloc planifié",
      description: "Le créneau de focus a été ajouté à votre calendrier.",
    });
  };

  const handleUnscheduleBlock = (id: string) => {
    unscheduleBlock(id);
    toast({
      title: "Bloc retiré",
      description: "La tâche n'est plus planifiée dans le calendrier.",
    });
  };

  const handleCompletePomodoro = (id: string, durationSeconds: number) => {
    completePomodoro(id, durationSeconds);
    toast({
      title: "Session terminée",
      description: "Pomodoro ajouté à votre historique de focus.",
    });
  };

  const viewOptions = [
    {
      key: 'list' as typeof activeView,
      label: 'Liste des tâches',
      description: 'Suivez vos tâches avec le détail complet.',
      icon: ListTodo,
    },
    {
      key: 'kanban' as typeof activeView,
      label: 'Kanban',
      description: 'Visualisez votre pipeline par statut ou priorité.',
      icon: KanbanSquare,
    },
    {
      key: 'calendar' as typeof activeView,
      label: 'Calendrier',
      description: 'Planifiez des blocs de focus et vos échéances.',
      icon: CalendarRange,
    },
    {
      key: 'focus' as typeof activeView,
      label: 'Focus',
      description: 'Lancez des sessions Pomodoro concentrées.',
      icon: Timer,
    },
  ];

  return (
    <Layout>
      <Header
        isSignedIn={isSignedIn}
        user={user}
        onAddTask={openCreateForm}
      />

      {!isSignedIn && (
        <Card className={cn('mb-6 shadow-sm border-0 backdrop-blur-sm', paletteConfig.cardSurface)}>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="text-amber-500 dark:text-orange-400">
                <Circle className="h-12 w-12 mx-auto mb-2 opacity-60" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-amber-700 dark:text-orange-200 mb-2">
                  Connectez-vous pour synchroniser vos tâches
                </h3>
                <p className="text-amber-600 dark:text-orange-300 text-sm mb-4">
                  Créez un compte pour sauvegarder vos tâches et y accéder depuis n'importe quel appareil.
                </p>
                <div className="flex gap-2 justify-center">
                  <AuthHeader />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {settings.showStats && <StatsSection stats={stats} />}

      {(settings.showFocusWidget || settings.showHabitsWidget) && (
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          {settings.showFocusWidget && <FocusSummaryWidget />}
          {settings.showHabitsWidget && <HabitsWidget />}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-72">
          <Card className="border-0 bg-white/70 dark:bg-gray-900/60 shadow-sm overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 px-1">
                Espaces de travail
              </p>
              <div className="grid gap-3">
                {viewOptions.map((option) => {
                  const isActive = activeView === option.key;
                  return (
                    <Button
                      key={option.key}
                      variant="ghost"
                      className={cn(
                        'w-full justify-start rounded-2xl border px-5 py-4 text-left transition-all shadow-sm',
                        isActive
                          ? cn('text-white shadow-lg', paletteConfig.ctaGradient, paletteConfig.ctaHover)
                          : cn(
                              'bg-white/90 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800',
                              paletteConfig.accentBorderHover
                            )
                      )}
                      onClick={() => setActiveView(option.key)}
                    >
                      <span className="text-left text-sm font-semibold tracking-wide">
                        {option.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="flex-1 min-w-0 space-y-6">
          {['list', 'kanban'].includes(activeView) && (
            <SearchAndFilterBar
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              filter={filter}
              onFilterChange={setFilter}
              completedCount={completedCount}
              onClearCompleted={() => {
                clearCompleted();
                toast({
                  title: "Tâches terminées supprimées",
                  description: `${completedCount} tâche(s) supprimée(s).`,
                });
              }}
              onAddTask={openCreateForm}
            />
          )}

          {activeView === 'list' && (
            <TaskList
              tasks={filteredTasks}
              onUpdate={(id, updates) => {
                updateTask(id, updates);
                toast({
                  title: "Tâche mise à jour",
                  description: "Les modifications ont été sauvegardées.",
                });
              }}
              onDelete={(id) => {
                deleteTask(id);
                toast({
                  title: "Tâche supprimée",
                  description: "La tâche a été supprimée définitivement.",
                  variant: "destructive",
                });
              }}
              onEdit={(task) => setEditingTask(task)}
              onStartTimer={handleStartTimer}
              onPauseTimer={handlePauseTimer}
              isOverdue={isOverdue}
              showForm={openCreateForm}
              searchQuery={searchQuery}
              filter={filter}
            />
          )}

          {activeView === 'kanban' && (
            <div className="space-y-6">
              {!hasTasks && (
                <Card className="border border-dashed border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50">
                  <CardContent className="py-8 text-center space-y-3">
                    <h4 className="text-base font-semibold text-gray-700 dark:text-gray-200">
                      Vue Kanban en attente de tâches
                    </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Créez une tâche pour alimenter vos colonnes et suivre l&apos;avancement en un clin d&apos;œil.
                </p>
                <Button
                  onClick={openCreateForm}
                  className={cn('text-white', paletteConfig.ctaGradient, paletteConfig.ctaHover)}
                >
                  Ajouter une tâche
                </Button>
              </CardContent>
            </Card>
              )}

              <KanbanBoard
                tasks={filteredTasks}
                onUpdate={(id, updates) => {
                  updateTask(id, updates);
                  toast({
                    title: "Tâche mise à jour",
                    description: "Les modifications ont été sauvegardées.",
                  });
                }}
                onDelete={(id) => {
                  deleteTask(id);
                  toast({
                    title: "Tâche supprimée",
                    description: "La tâche a été supprimée définitivement.",
                    variant: "destructive",
                  });
                }}
                onEdit={(task) => setEditingTask(task)}
                onStartTimer={handleStartTimer}
                onPauseTimer={handlePauseTimer}
              />
            </div>
          )}

          {activeView === 'calendar' && (
            <div className="space-y-6">
              {!hasTasks && (
                <Card className="border border-dashed border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50">
                  <CardContent className="py-8 text-center space-y-3">
                    <h4 className="text-base font-semibold text-gray-700 dark:text-gray-200">
                      Aucune tâche planifiée pour le moment
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Commencez par créer une tâche, puis convertissez-la en bloc de focus pour nourrir votre calendrier.
                    </p>
                    <Button onClick={openCreateForm} variant="outline">
                      Créer une tâche
                    </Button>
                  </CardContent>
                </Card>
              )}

              <CalendarView
                tasks={tasks}
                onSchedule={handleScheduleBlock}
                onUnschedule={handleUnscheduleBlock}
                onEdit={(task) => setEditingTask(task)}
              />
            </div>
          )}

          {activeView === 'focus' && (
            <FocusView
              tasks={tasks}
              onStartTimer={handleStartTimer}
              onPauseTimer={handlePauseTimer}
              onCompletePomodoro={handleCompletePomodoro}
            />
          )}
        </div>
      </div>

      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onSubmit={(data) => {
            if (editingTask) {
              updateTask(editingTask.id, data);
              toast({
                title: "Tâche mise à jour",
                description: "Les modifications ont été sauvegardées.",
              });
            } else {
              addTask(data);
              toast({
                title: "Tâche créée",
                description: "Votre nouvelle tâche a été ajoutée avec succès.",
              });
            }
            setShowForm(false);
            setEditingTask(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          allTasks={tasks}
        />
      )}
    </Layout>
  );
};

export default Index;
