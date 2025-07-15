import { Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import StatsCard from '@/components/StatsCard';

interface StatsSectionProps {
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
}

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
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
  );
}
