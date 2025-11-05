import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </div>
    </div>
  );
}
