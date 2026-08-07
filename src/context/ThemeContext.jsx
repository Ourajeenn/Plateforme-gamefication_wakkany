import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext({
  theme: 'default',
  toggleTheme: () => {},
  setTheme: (t) => {}
});

export const ThemeProvider = ({ children }) => {
  // themes: 'default' (current), 'sombre' (dark), 'claire' (blue)
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Cycle: default -> sombre -> claire -> default
  const toggleTheme = () => setTheme(prev => {
    if (prev === 'default') return 'sombre';
    if (prev === 'sombre') return 'claire';
    return 'default';
  });

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
