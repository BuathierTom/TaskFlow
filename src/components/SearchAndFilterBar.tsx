import { Search, Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FilterBar from '@/components/FilterBar';
import { FilterType } from '@/types/Task';

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
  return (
    <div className="mb-6 space-y-4 rounded-2xl border border-amber-200/70 dark:border-orange-900/40 bg-amber-50/70 dark:bg-gray-900/60 p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des tâches..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-10 bg-white/90 dark:bg-gray-800 border-gray-200/70 dark:border-gray-700 focus-visible:ring-orange-500"
          />
        </div>

        {onAddTask && (
          <Button
            onClick={onAddTask}
            className="whitespace-nowrap bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
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
