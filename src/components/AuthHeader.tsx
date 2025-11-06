import React from 'react';
import { useAuth, useUser, SignOutButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User, LogIn, UserPlus, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

const AuthHeader = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const { paletteConfig } = useTheme();

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link to="/auth/sign-in">
          <Button variant="outline" size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            Se connecter
          </Button>
        </Link>
        <Link to="/auth/sign-up">
          <Button
            size="sm"
            className={cn(
              'text-white',
              paletteConfig.ctaGradient,
              paletteConfig.ctaHover
            )}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            S'inscrire
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <img
            src={user?.imageUrl}
            alt="Avatar"
            className="w-6 h-6 rounded-full"
          />
          <span className="hidden sm:inline">{user?.firstName || 'Utilisateur'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            Mon profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <SignOutButton>
            <div className="flex items-center gap-2 w-full cursor-pointer text-red-600">
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </div>
          </SignOutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthHeader;
