import React, { createContext, useState, useEffect } from 'react';

const getInitialTheme = () => {
  const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
  return savedTheme === 'claire' || savedTheme === 'sombre' ? savedTheme : 'sombre';
};

export const ThemeContext = createContext({
  theme: 'sombre',
  toggleTheme: () => {},
  setTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'sombre' ? 'claire' : 'sombre'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
