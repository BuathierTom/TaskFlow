import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type PaletteId = 'warm' | 'cool' | 'forest';

type PaletteConfig = {
  id: PaletteId;
  label: string;
  backgroundLight: string;
  headerGradient: string;
  headerGradientHover: string;
  ctaGradient: string;
  ctaHover: string;
  accentText: string;
  accentTextStrong: string;
  accentIcon: string;
  cardSurface: string;
  filterContainer: string;
  filterActive: string;
  filterInactive: string;
  dueBadge: string;
  scheduleBadge: string;
  accentBadge: string;
  focusRing: string;
  focusVisibleRing: string;
  accentSolidBg: string;
  tabActive: string;
  accentBorder: string;
  accentBorderHover: string;
};

const paletteConfigs: Record<PaletteId, PaletteConfig> = {
  warm: {
    id: 'warm',
    label: 'Chaud',
    backgroundLight: 'from-amber-50 via-white to-rose-100',
    headerGradient: 'bg-gradient-to-r from-orange-500 to-pink-500',
    headerGradientHover: 'hover:from-orange-600 hover:to-pink-600',
    ctaGradient: 'bg-gradient-to-r from-orange-500 to-pink-500',
    ctaHover: 'hover:from-orange-600 hover:to-pink-600',
    accentText: 'text-orange-600',
    accentTextStrong: 'text-orange-700',
    accentIcon: 'text-orange-500',
    cardSurface: 'border-amber-200/70 dark:border-orange-900/40 bg-amber-50/70 dark:bg-gray-900/60',
    filterContainer: 'border-amber-200/70 dark:border-orange-900/40 bg-amber-100/80 dark:bg-gray-800/70',
    filterActive: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm',
    filterInactive: 'text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700',
    dueBadge: 'border-amber-300 text-amber-600 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-900/20',
    scheduleBadge: 'border-orange-300 text-orange-600 bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:bg-orange-900/20',
    accentBadge: 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    focusRing: 'focus:ring-orange-500',
    focusVisibleRing: 'focus-visible:ring-orange-400',
    accentSolidBg: 'bg-orange-400 dark:bg-orange-500',
    tabActive: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-sm',
    accentBorder: 'border-orange-500 text-orange-600',
    accentBorderHover: 'hover:border-orange-300',
  },
  cool: {
    id: 'cool',
    label: 'Océan',
    backgroundLight: 'from-sky-50 via-white to-indigo-100',
    headerGradient: 'bg-gradient-to-r from-sky-500 to-indigo-500',
    headerGradientHover: 'hover:from-sky-600 hover:to-indigo-600',
    ctaGradient: 'bg-gradient-to-r from-sky-500 to-indigo-500',
    ctaHover: 'hover:from-sky-600 hover:to-indigo-600',
    accentText: 'text-sky-600',
    accentTextStrong: 'text-indigo-600',
    accentIcon: 'text-sky-500',
    cardSurface: 'border-sky-200/70 dark:border-indigo-900/40 bg-sky-50/70 dark:bg-gray-900/60',
    filterContainer: 'border-sky-200/70 dark:border-indigo-900/40 bg-sky-100/80 dark:bg-gray-800/70',
    filterActive: 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-sm',
    filterInactive: 'text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700',
    dueBadge: 'border-sky-300 text-sky-600 bg-sky-50 dark:border-sky-700 dark:text-sky-300 dark:bg-sky-900/20',
    scheduleBadge: 'border-indigo-300 text-indigo-600 bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:bg-indigo-900/20',
    accentBadge: 'bg-sky-100/80 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    focusRing: 'focus:ring-sky-500',
    focusVisibleRing: 'focus-visible:ring-sky-400',
    accentSolidBg: 'bg-sky-400 dark:bg-sky-500',
    tabActive: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-sm',
    accentBorder: 'border-sky-500 text-sky-600',
    accentBorderHover: 'hover:border-sky-300',
  },
  forest: {
    id: 'forest',
    label: 'Forêt',
    backgroundLight: 'from-emerald-50 via-white to-lime-100',
    headerGradient: 'bg-gradient-to-r from-emerald-500 to-lime-500',
    headerGradientHover: 'hover:from-emerald-600 hover:to-lime-600',
    ctaGradient: 'bg-gradient-to-r from-emerald-500 to-lime-500',
    ctaHover: 'hover:from-emerald-600 hover:to-lime-600',
    accentText: 'text-emerald-600',
    accentTextStrong: 'text-emerald-700',
    accentIcon: 'text-emerald-500',
    cardSurface: 'border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-gray-900/60',
    filterContainer: 'border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-100/80 dark:bg-gray-800/70',
    filterActive: 'bg-gradient-to-r from-emerald-500 to-lime-500 text-white shadow-sm',
    filterInactive: 'text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700',
    dueBadge: 'border-emerald-300 text-emerald-600 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:bg-emerald-900/20',
    scheduleBadge: 'border-lime-300 text-lime-600 bg-lime-50 dark:border-lime-700 dark:text-lime-300 dark:bg-lime-900/20',
    accentBadge: 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    focusRing: 'focus:ring-emerald-500',
    focusVisibleRing: 'focus-visible:ring-emerald-400',
    accentSolidBg: 'bg-emerald-400 dark:bg-emerald-500',
    tabActive: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-lime-500 data-[state=active]:text-white data-[state=active]:shadow-sm',
    accentBorder: 'border-emerald-500 text-emerald-600',
    accentBorderHover: 'hover:border-emerald-300',
  },
};

const paletteOptions = Object.values(paletteConfigs).map(({ id, label }) => ({ id, label }));

interface ThemeContextValue {
  darkMode: boolean;
  toggleTheme: () => void;
  palette: PaletteId;
  setPalette: (palette: PaletteId) => void;
  paletteConfig: PaletteConfig;
  paletteOptions: typeof paletteOptions;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [palette, setPalette] = useState<PaletteId>('warm');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);

    const savedPalette = localStorage.getItem('palette');
    if (savedPalette === 'cool' || savedPalette === 'forest' || savedPalette === 'warm') {
      setPalette(savedPalette);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('palette', palette);
  }, [palette]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      darkMode,
      toggleTheme,
      palette,
      setPalette,
      paletteConfig: paletteConfigs[palette],
      paletteOptions,
    }),
    [darkMode, palette]
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette);
  }, [palette]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export type { PaletteId, PaletteConfig };
