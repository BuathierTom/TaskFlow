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
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Task, TaskPriority, TaskStatus, SubTask } from '@/types/Task';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

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
  subtasks: SubTask[];
  dependencies: string[];
  difficultyPoints?: number;
  estimatedHours?: number;
}

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (task: TaskFormData) => void;
  onCancel: () => void;
  allTasks: Task[];
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

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel, allTasks }) => {
  const { paletteConfig } = useTheme();
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
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [difficultyPoints, setDifficultyPoints] = useState<string>('');
  const [estimatedHours, setEstimatedHours] = useState<string>('');

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
      setSubtasks(task.subtasks ?? []);
      setSelectedDependencies(task.dependencies ?? []);
      setDifficultyPoints(
        typeof task.difficultyPoints === 'number' ? String(task.difficultyPoints) : ''
      );
      setEstimatedHours(
        typeof task.estimatedHours === 'number' ? String(task.estimatedHours) : ''
      );
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
      setSubtasks([]);
      setSelectedDependencies([]);
      setDifficultyPoints('');
      setEstimatedHours('');
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

    const sanitizedSubtasks = subtasks
      .map((subtask) => ({ ...subtask, title: subtask.title.trim() }))
      .filter((subtask) => subtask.title.length > 0);

    const uniqueDependencies = Array.from(new Set(selectedDependencies));

    const parsedDifficulty = difficultyPoints.trim() === '' ? undefined : Number(difficultyPoints);
    const parsedEstimate = estimatedHours.trim() === '' ? undefined : Number(estimatedHours);
    const difficultyValue = parsedDifficulty !== undefined && Number.isFinite(parsedDifficulty) ? parsedDifficulty : undefined;
    const estimateValue = parsedEstimate !== undefined && Number.isFinite(parsedEstimate) ? parsedEstimate : undefined;

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
      subtasks: sanitizedSubtasks,
      dependencies: uniqueDependencies,
      difficultyPoints: difficultyValue,
      estimatedHours: estimateValue,
    });
  };

  const handleAddSubtask = () => {
    const title = newSubtaskTitle.trim();
    if (!title) return;
    setSubtasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const updateSubtaskTitle = (id: string, title: string) => {
    setSubtasks((prev) => prev.map((subtask) => (subtask.id === id ? { ...subtask, title } : subtask)));
  };

  const toggleSubtaskCompleted = (id: string) => {
    setSubtasks((prev) => prev.map((subtask) => (subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask)));
  };

  const removeSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((subtask) => subtask.id !== id));
  };

  const toggleDependency = (id: string) => {
    setSelectedDependencies((prev) =>
      prev.includes(id) ? prev.filter((depId) => depId !== id) : [...prev, id]
    );
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
                  className={cn('transition-all duration-200 focus:ring-2', paletteConfig.focusRing)}
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
                  className={cn('transition-all duration-200 focus:ring-2 min-h-[100px]', paletteConfig.focusRing)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Flag className="h-4 w-4" />
                  Statut
                </Label>
                <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                <SelectTrigger className={cn('transition-all duration-200 focus:ring-2', paletteConfig.focusRing)}>
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
                <SelectTrigger className={cn('transition-all duration-200 focus:ring-2', paletteConfig.focusRing)}>
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
                  className={cn('transition-all duration-200 focus:ring-2', paletteConfig.focusRing)}
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
                  className={cn('transition-all duration-200 focus:ring-2', paletteConfig.focusRing)}
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
                  className={cn('transition-all duration-200 focus:ring-2', paletteConfig.focusRing)}
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-sm font-medium">
                  Points de difficulté
                </Label>
                <Input
                  id="difficulty"
                  type="number"
                  min={0}
                  value={difficultyPoints}
                  onChange={(event) => setDifficultyPoints(event.target.value)}
                  placeholder="Ex: 5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimate" className="text-sm font-medium">
                  Estimation (heures)
                </Label>
                <Input
                  id="estimate"
                  type="number"
                  min={0}
                  step="0.5"
                  value={estimatedHours}
                  onChange={(event) => setEstimatedHours(event.target.value)}
                  placeholder="Ex: 2.5"
                />
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

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Checklist</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newSubtaskTitle}
                      onChange={(event) => setNewSubtaskTitle(event.target.value)}
                      placeholder="Ajouter une sous-tâche"
                    />
                    <Button type="button" variant="secondary" onClick={handleAddSubtask} className="shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {subtasks.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Aucune sous-tâche pour le moment.
                      </p>
                    ) : (
                      subtasks.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-start gap-2 rounded-lg border border-gray-200/70 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/40 p-2"
                        >
                          <Checkbox
                            checked={subtask.completed}
                            onCheckedChange={() => toggleSubtaskCompleted(subtask.id)}
                            className="mt-1"
                          />
                          <Input
                            value={subtask.title}
                            onChange={(event) => updateSubtaskTitle(subtask.id, event.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSubtask(subtask.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Dépendances</Label>
                <div className="rounded-lg border border-gray-200/70 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/40 p-3 max-h-48 overflow-y-auto">
                  {allTasks.filter((candidate) => candidate.id !== task?.id).length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Aucune autre tâche disponible.</p>
                  ) : (
                    <div className="space-y-2">
                      {allTasks
                        .filter((candidate) => candidate.id !== task?.id)
                        .map((candidate) => (
                          <label key={candidate.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                            <Checkbox
                              checked={selectedDependencies.includes(candidate.id)}
                              onCheckedChange={() => toggleDependency(candidate.id)}
                            />
                            <span>{candidate.title}</span>
                          </label>
                        ))}
                    </div>
                  )}
                </div>
                {selectedDependencies.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cette tâche dépend de {selectedDependencies.length} autre{selectedDependencies.length > 1 ? 's' : ''} tâche{selectedDependencies.length > 1 ? 's' : ''}.
                  </p>
                )}
              </div>
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
                  'flex-1 transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100 text-white',
                  paletteConfig.ctaGradient,
                  paletteConfig.ctaHover
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
