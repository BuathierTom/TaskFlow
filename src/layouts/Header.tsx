import { Sun, Moon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthHeader from '@/components/AuthHeader';
import { useTheme } from '@/hooks/use-theme';

interface HeaderProps {
  isSignedIn: boolean;
  user?: { firstName: string };
  onAddTask: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSignedIn, user, onAddTask }) => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          TaskFlow
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isSignedIn && user
            ? `Bonjour ${user.firstName} !`
            : 'Organisez vos tâches avec style et efficacité'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="transition-all duration-200 hover:scale-105"
          aria-label="Changer le thème"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <AuthHeader />
        <Button
          onClick={onAddTask}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>
    </header>
  );
};

export default Header;
