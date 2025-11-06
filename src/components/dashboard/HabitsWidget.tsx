import React, { useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTasksContext } from '@/context/TasksContext';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

const HabitsWidget: React.FC = () => {
  const { tasks } = useTasksContext();
  const { paletteConfig } = useTheme();

  const activity = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const day = subDays(new Date(), index);
      day.setHours(0, 0, 0, 0);
      const count = tasks.filter((task) => {
        if (task.status !== 'completed') return false;
        const updated = new Date(task.updatedAt);
        updated.setHours(0, 0, 0, 0);
        return updated.getTime() === day.getTime();
      }).length;
      return {
        label: format(day, 'EEE', { locale: fr }),
        count,
      };
    }).reverse();
  }, [tasks]);

  const streak = useMemo(() => {
    let currentStreak = 0;
    for (let i = activity.length - 1; i >= 0; i -= 1) {
      if (activity[i].count > 0) {
        currentStreak += 1;
      } else {
        break;
      }
    }
    return currentStreak;
  }, [activity]);

  return (
    <Card className={cn('border-0 shadow-sm', paletteConfig.cardSurface)}>
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Habitudes</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Traquez vos journées actives et gardez le rythme.
          </p>
        </div>
        <div className="flex items-end justify-between gap-3">
          {activity.map((entry) => (
            <div key={entry.label} className="flex-1">
              <div
                className={cn(
                  'w-full rounded-t-md bg-gradient-to-t from-gray-200 to-transparent dark:from-gray-800',
                  entry.count > 0 && paletteConfig.accentSolidBg
                )}
                style={{ height: `${Math.min(entry.count, 5) * 12 + 4}px` }}
              />
              <div className="text-[11px] text-center text-gray-500 dark:text-gray-400 mt-1">
                {entry.label}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          Série actuelle :
          <span className={cn('ml-1 font-semibold', paletteConfig.accentText)}>
            {streak} jour{streak > 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitsWidget;
