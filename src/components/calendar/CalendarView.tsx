import React, { useMemo, useState } from 'react';
import { Task } from '@/types/Task';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  addDays,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onSchedule: (id: string, scheduledAt: Date, duration: 30 | 60) => void;
  onUnschedule: (id: string) => void;
  onEdit: (task: Task) => void;
}

type CalendarMode = 'month' | 'week' | 'day';

const isScheduledOnDay = (task: Task, day: Date) =>
  task.scheduledAt ? isSameDay(task.scheduledAt, day) : false;

const isDueOnDay = (task: Task, day: Date) =>
  task.dueDate ? isSameDay(task.dueDate, day) : false;

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onSchedule, onUnschedule, onEdit }) => {
  const [mode, setMode] = useState<CalendarMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [scheduleDate, setScheduleDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleDuration, setScheduleDuration] = useState<'30' | '60'>('30');
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const scheduledTasks = useMemo(() => tasks.filter((task) => task.scheduledAt), [tasks]);
  const unscheduledTasks = useMemo(() => tasks.filter((task) => !task.scheduledAt), [tasks]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const dayTasks = useMemo(() => {
    return tasks.filter((task) => isScheduledOnDay(task, currentDate) || isDueOnDay(task, currentDate));
  }, [tasks, currentDate]);

  const navigate = (direction: 'prev' | 'next') => {
    if (mode === 'month') {
      setCurrentDate((date) => addWeeks(date, direction === 'next' ? 4 : -4));
    } else if (mode === 'week') {
      setCurrentDate((date) => (direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1)));
    } else {
      setCurrentDate((date) => addDays(date, direction === 'next' ? 1 : -1));
    }
  };

  const getTasksForDay = (day: Date) => ({
    scheduled: tasks.filter((task) => isScheduledOnDay(task, day)),
    due: tasks.filter((task) => !isScheduledOnDay(task, day) && isDueOnDay(task, day)),
  });

  const selectedDayDetails = useMemo(() => getTasksForDay(currentDate), [tasks, currentDate]);

  const handleScheduleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTaskId || !scheduleDate || !scheduleTime) return;
    const datetime = new Date(`${scheduleDate}T${scheduleTime}`);
    onSchedule(selectedTaskId, datetime, Number(scheduleDuration) as 30 | 60);
    setSelectedTaskId('');
  };

  const handleDaySelect = (date: Date) => {
    const nextDate = new Date(date);
    setCurrentDate(nextDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const normalized = new Date(nextDate);
    normalized.setHours(0, 0, 0, 0);
    const candidate = normalized < today ? today : normalized;
    setScheduleDate(format(candidate, 'yyyy-MM-dd'));
    setIsDayModalOpen(true);
  };

  const handleDayKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, date: Date) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDaySelect(date);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Calendrier</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualisez vos échéances et blocs de focus. Convertissez rapidement vos tâches en créneaux dédiés.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-white/60 dark:bg-gray-800/60 px-2 py-1 shadow-sm">
            <Button variant="ghost" size="icon" onClick={() => navigate('prev')} aria-label="Période précédente">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[140px] text-center px-2">
              {format(currentDate, mode === 'month' ? 'LLLL yyyy' : mode === 'week' ? "'Semaine du' d MMM" : 'd MMMM', {
                locale: fr,
              })}
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate('next')} aria-label="Période suivante">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="flex items-center gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            Aujourd'hui
          </Button>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(value) => setMode(value as CalendarMode)}>
        <TabsList className="mt-2 flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-900/60 p-1 rounded-xl w-full">
          <TabsTrigger value="month">Mois</TabsTrigger>
          <TabsTrigger value="week">Semaine</TabsTrigger>
          <TabsTrigger value="day">Jour</TabsTrigger>
        </TabsList>
        <TabsContent value="month">
          <div className="grid grid-cols-7 gap-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-4">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3 mt-2">
            {monthDays.map((day) => {
              const { scheduled, due } = getTasksForDay(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, currentDate);
              return (
                <Card
                  key={day.toISOString()}
                  className={cn(
                    'p-3 border border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/70 min-h-[130px] flex flex-col gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 transition-all',
                    !isSameMonth(day, currentDate) && 'opacity-40',
                    isToday && 'border-orange-400 shadow-md',
                    isSelected && 'border-orange-500 ring-2 ring-orange-200 dark:ring-orange-800'
                  )}
                  role="button"
                  tabIndex={0}
                  aria-label={`Voir la journée du ${format(day, 'EEEE d MMMM', { locale: fr })}`}
                  onClick={() => handleDaySelect(day)}
                  onKeyDown={(event) => handleDayKeyDown(event, day)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {format(day, 'd', { locale: fr })}
                    </span>
                    {scheduled.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {scheduled.length} bloc{scheduled.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {scheduled.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onEdit(task)}
                        className="text-left text-xs px-2 py-1 bg-amber-100 dark:bg-orange-900/30 text-amber-700 dark:text-amber-200 rounded-md"
                      >
                        {task.title}
                      </button>
                    ))}
                    {due.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onEdit(task)}
                        className="text-left text-xs px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200 rounded-md"
                      >
                        {task.title}
                      </button>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="week">
          <div className="grid md:grid-cols-7 gap-3 mt-4">
            {weekDays.map((day) => {
              const { scheduled, due } = getTasksForDay(day);
              return (
                <Card key={day.toISOString()} className="p-4 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs uppercase text-gray-500 dark:text-gray-400">
                        {format(day, 'EEE', { locale: fr })}
                      </div>
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {format(day, 'd MMM', { locale: fr })}
                      </div>
                    </div>
                    {scheduled.length > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        {scheduled.length} bloc{scheduled.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    {scheduled.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg bg-amber-50 dark:bg-orange-900/20 border border-amber-200 dark:border-orange-700"
                      >
                        <div className="text-xs font-semibold text-amber-700 dark:text-amber-200">
                          {task.title}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-300 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(task.scheduledAt!, 'HH:mm')} · {task.durationMinutes ?? 30} min
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={() => onEdit(task)}>
                            Ajuster
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => onUnschedule(task.id)}>
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ))}
                    {due.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700"
                      >
                        <div className="text-xs font-semibold text-amber-700 dark:text-amber-200">
                          {task.title}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-300">
                          Échéance à {format(task.dueDate!, 'HH:mm')}
                        </div>
                      </div>
                    ))}
                    {scheduled.length === 0 && due.length === 0 && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">
                        Aucune tâche prévue
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="day">
          <Card className="p-4 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 mt-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
              {format(currentDate, 'EEEE d MMMM', { locale: fr })}
            </h4>
            <div className="space-y-4">
              {dayTasks.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Aucune tâche prévue aujourd'hui. Bloquez un créneau pour rester concentré.
                </div>
              )}
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-amber-200 dark:border-orange-800 bg-amber-50/60 dark:bg-orange-900/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-amber-700 dark:text-amber-200">
                      {task.title}
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-300">
                      {task.scheduledAt
                        ? `${format(task.scheduledAt, 'HH:mm')} · ${task.durationMinutes ?? 30} min`
                        : task.dueDate
                        ? `Échéance ${format(task.dueDate, 'HH:mm')}`
                        : 'Non planifiée'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={() => onEdit(task)}>
                      Ajuster
                    </Button>
                    {task.scheduledAt && (
                      <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => onUnschedule(task.id)}>
                        Supprimer
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent className="max-w-3xl space-y-6 bg-white dark:bg-gray-900">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {format(currentDate, 'EEEE d MMMM', { locale: fr })}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              Consultez vos blocs planifiés et échéances pour cette journée. Utilisez les actions rapides pour modifier ou planifier.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {selectedDayDetails.scheduled.length} bloc{selectedDayDetails.scheduled.length > 1 ? 's' : ''} planifié{selectedDayDetails.scheduled.length > 1 ? 's' : ''} ·{' '}
              {selectedDayDetails.due.length} échéance{selectedDayDetails.due.length > 1 ? 's' : ''}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMode('day');
                setIsDayModalOpen(false);
              }}
            >
              Ouvrir la vue Jour
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-200">
                <Clock className="h-4 w-4" />
                Blocs planifiés
              </div>
              {selectedDayDetails.scheduled.length === 0 ? (
                <p className="text-sm text-amber-600/80 dark:text-amber-300/80">
                  Aucun bloc prévu. Sélectionnez une tâche dans le formulaire pour réserver un créneau.
                </p>
              ) : (
                selectedDayDetails.scheduled.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-amber-200 dark:border-orange-700 bg-amber-50/60 dark:bg-orange-900/20 p-4 space-y-3"
                  >
                    <div>
                    <div className="text-sm font-semibold text-amber-700 dark:text-amber-200">
                        {task.title}
                      </div>
                    <div className="text-xs text-amber-600 dark:text-amber-300 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(task.scheduledAt!, 'HH:mm')} · {task.durationMinutes ?? 30} min
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs"
                        onClick={() => {
                          onEdit(task);
                          setIsDayModalOpen(false);
                        }}
                      >
                        Ajuster
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => onUnschedule(task.id)}>
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-amber-600 dark:text-amber-300">
                Échéances
              </div>
              {selectedDayDetails.due.length === 0 ? (
                <p className="text-sm text-amber-600/80 dark:text-amber-300/80">
                  Rien à échéance pour cette journée.
                </p>
              ) : (
                selectedDayDetails.due.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      onEdit(task);
                      setIsDayModalOpen(false);
                    }}
                    className="w-full text-left rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-900/20 p-4 transition hover:bg-amber-100 dark:hover:bg-amber-900/40"
                  >
                    <div className="text-sm font-semibold text-amber-700 dark:text-amber-200">
                      {task.title}
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-300">
                      Échéance à {format(task.dueDate!, 'HH:mm')}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="p-6 bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Convertir une tâche en bloc de focus
        </h4>
        <form className="grid gap-4 md:grid-cols-5" onSubmit={handleScheduleSubmit}>
          <div className="md:col-span-2">
            <label className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1 block">
              Tâche
            </label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une tâche" />
              </SelectTrigger>
              <SelectContent>
                {unscheduledTasks.length === 0 && (
                  <SelectItem value="__no_tasks__" disabled>
                    Toutes les tâches sont planifiées 🎉
                  </SelectItem>
                )}
                {unscheduledTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1 block">
              Date
            </label>
            <Input
              type="date"
              value={scheduleDate}
              onChange={(event) => setScheduleDate(event.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          <div>
            <label className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1 block">
              Heure
            </label>
            <Input
              type="time"
              value={scheduleTime}
              onChange={(event) => setScheduleTime(event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1 block">
              Durée
            </label>
            <Select value={scheduleDuration} onValueChange={(value: '30' | '60') => setScheduleDuration(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Bloquer
            </Button>
          </div>
        </form>

        {scheduledTasks.length > 0 && (
          <div className="mt-6">
            <h5 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
              Blocs planifiés
            </h5>
            <div className="grid gap-3 md:grid-cols-2">
              {scheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-orange-800 bg-amber-50/60 dark:bg-orange-900/20 px-3 py-2 text-xs"
                >
                  <div>
                  <div className="font-semibold text-amber-700 dark:text-amber-200">{task.title}</div>
                  <div className="text-amber-600 dark:text-amber-300 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.scheduledAt
                        ? `${format(task.scheduledAt, 'EEE d MMM HH:mm', { locale: fr })} · ${task.durationMinutes ?? 30} min`
                        : '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onEdit(task)}>
                      Modifier
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => onUnschedule(task.id)}>
                      Retirer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CalendarView;
