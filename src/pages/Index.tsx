import { useState, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';

import TaskForm from '@/components/TaskForm';
import { useTasks } from '@/hooks/use-tasks';
import { Task, FilterType } from '@/types/Task';

import Layout from '@/layouts/Layout';
import Header from '@/layouts/Header';
import StatsSection from '@/components/StatsSection';
import SearchAndFilterBar from '@/components/SearchAndFilterBar';
import TaskList from '@/components/TaskList';

const Index = () => {
  const { tasks, setTasks } = useTasks();

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

  return (
    <Layout>
      <Header onAddTask={() => setShowForm(true)} />

      <StatsSection stats={stats} />

      <SearchAndFilterBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        completedCount={stats.completed}
        onClearCompleted={clearCompleted}
      />

      <TaskList
        tasks={filteredTasks}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onEdit={setEditingTask}
        isOverdue={isOverdue}
        showForm={() => setShowForm(true)}
        searchQuery={searchQuery}
        filter={filter}
      />

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
    </Layout>
  );
};

export default Index;
