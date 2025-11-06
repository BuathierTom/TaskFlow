import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { paletteConfig } = useTheme();
  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300',
        paletteConfig.backgroundLight
      )}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </div>
    </div>
  );
}
