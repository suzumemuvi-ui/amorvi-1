import React, { createContext, useContext, useState } from 'react';

type ThemeValue = { dark: boolean; toggleTheme: () => void };
const ThemeContext = createContext<ThemeValue>({ dark: false, toggleTheme: () => {} });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [dark, setDark] = useState(false);
  return <ThemeContext.Provider value={{ dark, toggleTheme: () => setDark(value => !value) }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
