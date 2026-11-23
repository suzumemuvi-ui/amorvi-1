import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeValue = { dark: boolean; toggleTheme: () => void };
const ThemeContext = createContext<ThemeValue>({ dark: false, toggleTheme: () => {} });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem('themeDark').then(value => setDark(value === 'true')).catch(() => {});
  }, []);
  const toggleTheme = () => {
    setDark(current => {
      const next = !current;
      AsyncStorage.setItem('themeDark', String(next)).catch(() => {});
      return next;
    });
  };
  return <ThemeContext.Provider value={{ dark, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
