import { Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsSectionProps {
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const items = [
    {
      label: 'Total',
      value: stats.total,
      icon: <Circle className="h-4 w-4" />,
      accent: 'text-amber-600 dark:text-amber-300',
      chip: 'bg-amber-100/80 dark:bg-amber-900/30',
    },
    {
      label: 'En cours',
      value: stats.inProgress,
      icon: <Clock className="h-4 w-4" />,
      accent: 'text-orange-600 dark:text-orange-300',
      chip: 'bg-orange-100/80 dark:bg-orange-900/30',
    },
    {
      label: 'Terminées',
      value: stats.completed,
      icon: <CheckCircle2 className="h-4 w-4" />,
      accent: 'text-emerald-600 dark:text-emerald-300',
      chip: 'bg-emerald-100/80 dark:bg-emerald-900/30',
    },
    {
      label: 'En retard',
      value: stats.overdue,
      icon: <AlertCircle className="h-4 w-4" />,
      accent: 'text-red-600 dark:text-red-300',
      chip: 'bg-red-100/80 dark:bg-red-900/30',
    },
  ];

  return (
    <Card className="border-0 shadow-sm bg-amber-50/70 dark:bg-gray-900/60 backdrop-blur-sm mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Vue d&apos;ensemble
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Un aperçu rapide de l&apos;avancement de vos tâches.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
            {items.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-white/80 dark:bg-gray-800/60 px-4 py-3 flex flex-col gap-2 min-w-[150px]"
              >
                <div
                  className={cn(
                    'inline-flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-lg w-max',
                    item.accent,
                    item.chip
                  )}
                >
                  {item.icon}
                  {item.label}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
