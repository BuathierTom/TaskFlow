import React from 'react';
import { List, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterType } from '@/types/Task';

interface FilterBarProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filter, onFilterChange }) => {
  const filters = [
    {
      key: 'all' as FilterType,
      label: 'Toutes',
      icon: <List className="h-4 w-4" />,
    },
    {
      key: 'active' as FilterType,
      label: 'Actives',
      icon: <Clock className="h-4 w-4" />,
    },
    {
      key: 'completed' as FilterType,
      label: 'Terminées',
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      key: 'overdue' as FilterType,
      label: 'En retard',
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex gap-1 bg-amber-100/80 dark:bg-gray-800/80 p-1.5 rounded-lg border border-amber-200/70 dark:border-orange-900/40">
      {filters.map((filterOption) => {
        const isActive = filter === filterOption.key;
        return (
          <Button
            key={filterOption.key}
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange(filterOption.key)}
            className={[
              "transition-all duration-200 flex items-center gap-2",
              isActive
                ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm"
                : "bg-transparent text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700"
            ].join(' ')}
          >
            {filterOption.icon}
            <span className="hidden sm:inline">{filterOption.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default FilterBar;
