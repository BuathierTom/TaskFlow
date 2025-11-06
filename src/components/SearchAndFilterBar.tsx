import { Search, Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FilterBar from '@/components/FilterBar';
import { FilterType } from '@/types/Task';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

interface SearchAndFilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  completedCount: number;
  onClearCompleted: () => void;
  onAddTask?: () => void; // optionnel si tu veux mettre un bouton "ajouter" ici plus tard
}

export default function SearchAndFilterBar({
  searchQuery,
  onSearchQueryChange,
  filter,
  onFilterChange,
  completedCount,
  onClearCompleted,
  onAddTask,
}: SearchAndFilterBarProps) {
  const { paletteConfig } = useTheme();
  return (
    <div
      className={cn(
        'mb-6 space-y-4 rounded-2xl p-4 shadow-sm border',
        paletteConfig.cardSurface
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des tâches..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className={cn(
              'pl-10 bg-white/90 dark:bg-gray-800 border-gray-200/70 dark:border-gray-700',
              paletteConfig.focusRing
            )}
          />
        </div>

        {onAddTask && (
          <Button
            onClick={onAddTask}
            className={cn(
              'whitespace-nowrap text-white',
              paletteConfig.ctaGradient,
              paletteConfig.ctaHover
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle tâche
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <FilterBar filter={filter} onFilterChange={onFilterChange} />
        <div className="flex-1" />
        {completedCount > 0 && (
          <Button
            variant="outline"
            onClick={onClearCompleted}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer terminées
          </Button>
        )}
      </div>
    </div>
  );
}
