import { Sun, Moon, Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthHeader from '@/components/AuthHeader';
import { useTheme } from '@/hooks/use-theme';
import { Link } from 'react-router-dom';

interface HeaderProps {
  isSignedIn: boolean;
  user?: { firstName: string };
  onAddTask: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSignedIn, user, onAddTask }) => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
          TaskFlow
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isSignedIn && user
            ? `Bonjour ${user.firstName} ! Prêt à faire avancer vos projets ?`
            : 'Organisez vos tâches avec style et efficacité.'}
        </p>
      </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-white/60 dark:bg-gray-800/60 px-2 py-1 shadow-sm">
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

        <AuthHeader />

        <Button
          onClick={onAddTask}
          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>
    </header>
  );
};

export default Header;
