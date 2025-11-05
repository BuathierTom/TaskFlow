import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Calendar,
  FileText,
  Flag,
  Tag,
  Briefcase,
  Clock,
  Timer,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Task, TaskPriority, TaskStatus } from '@/types/Task';
import { cn } from '@/lib/utils';

interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  tags: string[];
  project?: string;
  scheduledAt?: Date;
  durationMinutes?: 30 | 60;
}

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (task: TaskFormData) => void;
  onCancel: () => void;
}

const statusOptions: Array<{ value: TaskStatus; label: string; color: string }> = [
  { value: 'todo', label: 'À faire', color: 'text-gray-600' },
  { value: 'in-progress', label: 'En cours', color: 'text-orange-600' },
  { value: 'completed', label: 'Terminée', color: 'text-green-600' },
];

const priorityOptions: Array<{ value: TaskPriority; label: string; color: string }> = [
  { value: 'low', label: 'Faible', color: 'text-emerald-600' },
  { value: 'medium', label: 'Moyenne', color: 'text-amber-600' },
  { value: 'high', label: 'Haute', color: 'text-red-600' },
];

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [project, setProject] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<30 | 60 | ''>('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ? task.dueDate.toISOString().split('T')[0] : '');
      setTagsInput(task.tags.join(', '));
      setProject(task.project || '');
      if (task.scheduledAt) {
        const iso = task.scheduledAt.toISOString();
        setScheduledDate(iso.split('T')[0]);
        setScheduledTime(iso.split('T')[1]?.slice(0, 5) || '');
      } else {
        setScheduledDate('');
        setScheduledTime('');
      }
      setDurationMinutes(task.durationMinutes || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDueDate('');
      setTagsInput('');
      setProject('');
      setScheduledDate('');
      setScheduledTime('');
      setDurationMinutes('');
    }
  }, [task]);

  const parsedTags = useMemo(() => {
    if (!tagsInput.trim()) {
      return [];
    }
    return tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [tagsInput]);

  const isTimeBlockingComplete = scheduledDate && scheduledTime && durationMinutes;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let scheduledAt: Date | undefined;
    if (isTimeBlockingComplete) {
      scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`);
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: parsedTags,
      project: project.trim() || undefined,
      scheduledAt,
      durationMinutes: isTimeBlockingComplete ? (durationMinutes as 30 | 60) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in">
      <Card className="w-full max-w-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200/60 dark:border-gray-700/60 animate-scale-in max-h-[90vh] flex flex-col overflow-hidden">
        <CardHeader className="px-6 pt-6 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2 md:col-span-2 xl:col-span-3">
                <Label htmlFor="title" className="text-sm font-medium">
                  Titre *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entrez le titre de la tâche..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2 xl:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ajoutez une description (optionnel)..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Flag className="h-4 w-4" />
                  Statut
                </Label>
                <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={option.color}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  Priorité
                </Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={option.color}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Échéance
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project" className="text-sm font-medium flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  Projet
                </Label>
                <Input
                  id="project"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="Projet associé (optionnel)"
                  className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2 xl:col-span-3">
                <Label htmlFor="tags" className="text-sm font-medium flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Séparez les tags par une virgule (ex: design, release, urgent)"
                  className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                />
                {parsedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {parsedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-dashed border-amber-200/60 dark:border-orange-800/60 p-4 bg-amber-50/40 dark:bg-orange-900/10">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-200">
                  Time blocking
                </span>
              </div>
              <p className="text-xs text-orange-700/80 dark:text-orange-200/80">
                Planifiez cette tâche dans votre calendrier (créneau de 30 ou 60 minutes).
              </p>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate" className="text-xs uppercase tracking-wide">
                    Date
                  </Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime" className="text-xs uppercase tracking-wide">
                    Heure
                  </Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Durée</Label>
                  <Select
                    value={durationMinutes === '' ? '' : String(durationMinutes)}
                    onValueChange={(value) =>
                      setDurationMinutes(value ? (Number(value) as 30 | 60) : '')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!isTimeBlockingComplete && (scheduledDate || scheduledTime || durationMinutes) && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Complétez la date, l'heure et la durée pour créer le bloc dans le calendrier.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={!title.trim()}
                className={cn(
                  'flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100'
                )}
              >
                {task ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskForm;
