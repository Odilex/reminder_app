import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, Platform } from 'react-native';
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        setIsLoading(true);
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          // If no saved preference, use system theme
          setIsDarkMode(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        // Fallback to system theme on error
        setIsDarkMode(systemColorScheme === 'dark');
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');

      // Apply immediate visual feedback for web
      if (Platform.OS === 'web') {
        const root = document.documentElement;
        root.style.setProperty('--background-color', newMode ? Colors.dark.background : Colors.light.background);
        root.style.setProperty('--text-color', newMode ? Colors.dark.text : Colors.light.text);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? Colors.dark : Colors.light;

  const getThemedColor = (colorName: keyof typeof Colors.light | keyof typeof Colors.dark) => {
    if (isLoading) {
      return systemColorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
    }
    
    // First check in the current theme
    if (colorName in theme) {
      return theme[colorName] as string;
    }
    // Then check in base colors
    if (colorName in Colors) {
      return Colors[colorName as keyof typeof Colors] as string;
    }
    // Finally, fallback to default text color
    return isDarkMode ? Colors.dark.text : Colors.light.text;
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme,
    getThemedColor,
  };

  if (isLoading) {
    // Return a loading state that matches system theme
    return (
      <ThemeContext.Provider value={{
        isDarkMode: systemColorScheme === 'dark',
        toggleTheme,
        theme: systemColorScheme === 'dark' ? Colors.dark : Colors.light,
        getThemedColor,
      }}>
        {children}
      </ThemeContext.Provider>
    );
  }

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