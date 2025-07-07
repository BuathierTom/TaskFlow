import React from 'react';
import { List, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterType } from '@/pages/Index';

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
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
      {filters.map((filterOption) => (
        <Button
          key={filterOption.key}
          variant={filter === filterOption.key ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange(filterOption.key)}
          className={`transition-all duration-200 flex items-center gap-2 ${
            filter === filterOption.key
              ? 'bg-white dark:bg-gray-600 shadow-sm'
              : 'hover:bg-white/50 dark:hover:bg-gray-600/50'
          }`}
        >
          {filterOption.icon}
          <span className="hidden sm:inline">{filterOption.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default FilterBar;