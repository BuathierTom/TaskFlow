import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface DashboardSettings {
  showStats: boolean;
  showFocusWidget: boolean;
  showHabitsWidget: boolean;
}

interface DashboardSettingsContextValue {
  settings: DashboardSettings;
  toggleWidget: (key: keyof DashboardSettings) => void;
}

const DEFAULT_SETTINGS: DashboardSettings = {
  showStats: true,
  showFocusWidget: true,
  showHabitsWidget: true,
};

const STORAGE_KEY = 'dashboard_settings_v2';

const DashboardSettingsContext = createContext<DashboardSettingsContextValue | undefined>(
  undefined
);

export const DashboardSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.warn('Impossible de lire les préférences du tableau de bord', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const value = useMemo<DashboardSettingsContextValue>(
    () => ({
      settings,
      toggleWidget: (key) =>
        setSettings((prev) => ({
          ...prev,
          [key]: !prev[key],
        })),
    }),
    [settings]
  );

  return (
    <DashboardSettingsContext.Provider value={value}>
      {children}
    </DashboardSettingsContext.Provider>
  );
};

export const useDashboardSettings = () => {
  const context = useContext(DashboardSettingsContext);
  if (!context) {
    throw new Error('useDashboardSettings must be used within a DashboardSettingsProvider');
  }
  return context;
};
