import React from 'react';
import { List, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterType } from '@/types/Task';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filter, onFilterChange }) => {
  const { paletteConfig } = useTheme();
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
    <div className={cn('flex gap-1 p-1.5 rounded-lg', paletteConfig.filterContainer)}>
      {filters.map((filterOption) => {
        const isActive = filter === filterOption.key;
        return (
          <Button
            key={filterOption.key}
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange(filterOption.key)}
            className={cn(
              'transition-all duration-200 flex items-center gap-2 px-3',
              isActive ? paletteConfig.filterActive : paletteConfig.filterInactive
            )}
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
