import React, { createContext, useState, useContext } from 'react';
import Colors from '@/constants/Colors';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof Colors.light | typeof Colors.dark;
  getThemedColor: (colorName: keyof typeof Colors.light | keyof typeof Colors.dark) => string;
};

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: Colors.light,
  getThemedColor: () => '',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = isDarkMode ? Colors.dark : Colors.light;

  const getThemedColor = (colorName: keyof typeof Colors.light | keyof typeof Colors.dark) => {
    if (colorName in theme) {
      return theme[colorName];
    }
    // Fallback to base colors if not found in theme
    if (colorName in Colors) {
      return Colors[colorName as keyof typeof Colors];
    }
    return isDarkMode ? Colors.dark.text : Colors.light.text;
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme,
    getThemedColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for using theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 