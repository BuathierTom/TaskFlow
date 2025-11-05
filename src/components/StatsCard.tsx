import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'red';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300',
    green: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
    red: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Card className="border-0 shadow-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', colorClasses[color])}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {title}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
