import { Sun, Moon, Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthHeader from '@/components/AuthHeader';
import { useTheme } from '@/hooks/use-theme';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useDashboardSettings } from '@/context/DashboardSettingsContext';

interface HeaderProps {
  isSignedIn: boolean;
  user?: { firstName: string };
  onAddTask: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSignedIn, user, onAddTask }) => {
  const { darkMode, toggleTheme, palette, setPalette, paletteConfig, paletteOptions } = useTheme();
  const { settings, toggleWidget } = useDashboardSettings();

  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
      <div className="space-y-2">
        <h1 className={cn('text-4xl font-bold bg-clip-text text-transparent', paletteConfig.headerGradient)}>
          TaskFlow
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isSignedIn && user
            ? `Bonjour ${user.firstName} ! Prêt à faire avancer vos projets ?`
            : 'Organisez vos tâches avec style et efficacité.'}
        </p>
      </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        <div className={cn('flex items-center gap-2 rounded-xl px-2 py-1 shadow-sm border', paletteConfig.cardSurface)}>
          <Link to="/analytics" className="inline-flex">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-sm"
            >
              <BarChart3 className="h-4 w-4" />
              Statistiques
            </Button>
          </Link>
          <span className="h-6 w-px bg-gray-200 dark:bg-gray-700" aria-hidden />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
            aria-label="Changer le thème"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <Select value={palette} onValueChange={(value) => setPalette(value as typeof palette)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Palette" />
          </SelectTrigger>
          <SelectContent>
            {paletteOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Widgets
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuCheckboxItem
              checked={settings.showStats}
              onCheckedChange={() => toggleWidget('showStats')}
            >
              Statistiques
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={settings.showFocusWidget}
              onCheckedChange={() => toggleWidget('showFocusWidget')}
            >
              Focus du jour
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={settings.showHabitsWidget}
              onCheckedChange={() => toggleWidget('showHabitsWidget')}
            >
              Habitudes
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AuthHeader />

        <Button
          onClick={onAddTask}
          className={cn(
            'transition-all duration-200 hover:scale-105 shadow-lg text-white',
            paletteConfig.ctaGradient,
            paletteConfig.ctaHover
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>
    </header>
  );
};

export default Header;
