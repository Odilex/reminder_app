import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
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

const THEME_STORAGE_KEY = '@theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          // If no saved preference, use system theme
          setIsDarkMode(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async (): Promise<void> => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? Colors.dark : Colors.light;

  const getThemedColor = (colorName: keyof typeof Colors.light | keyof typeof Colors.dark): string => {
    if (colorName in theme) {
      return theme[colorName] as string;
    }
    // Fallback to base colors if not found in theme
    if (colorName in Colors) {
      return Colors[colorName as keyof typeof Colors] as string;
    }
    return isDarkMode ? Colors.dark.text : Colors.light.text;
  };

  const value: ThemeContextType = {
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
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme hook must be used within a ThemeProvider component');
  }
  return context;
} 