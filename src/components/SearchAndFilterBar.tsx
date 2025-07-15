import { Search, Trash2 } from 'lucide-react';
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
}: SearchAndFilterBarProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des tâches..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
          />
        </div>

        <FilterBar filter={filter} onFilterChange={onFilterChange} />

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
