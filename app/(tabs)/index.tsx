import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Platform, ActivityIndicator, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState, useMemo, useRef, useEffect } from 'react';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';

type Category = {
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  count: number;
};

type Priority = 'high' | 'medium' | 'low';

type Reminder = {
  id: number;
  title: string;
  time: string;
  date: string;
  category: string;
  priority: Priority;
  isCompleted?: boolean;
};

type WeatherInfo = {
  temp: number;
  condition: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

type AISuggestion = {
  id: number;
  title: string;
  reason: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

type SpeechResult = {
  value: string;
};

// Type definitions for voice recognition
interface VoiceRecognitionResult {
  value: string;
}

interface VoiceRecognitionOptions {
  language: string;
  onResult: (result: VoiceRecognitionResult) => void;
  onEnd: () => void;
}

const categories: Category[] = [
  { name: 'All', icon: 'list', count: 12 },
  { name: 'Work', icon: 'work', count: 5 },
  { name: 'Personal', icon: 'person', count: 4 },
  { name: 'Shopping', icon: 'shopping-cart', count: 2 },
  { name: 'Health', icon: 'favorite', count: 1 },
];

const quickActions = [
  { icon: 'alarm-add', label: 'Quick Reminder' },
  { icon: 'repeat', label: 'Recurring' },
  { icon: 'group-add', label: 'Share' },
  { icon: 'location-on', label: 'Location' },
];

const aiSuggestions: AISuggestion[] = [
  {
    id: 1,
    title: 'Schedule Gym Session',
    reason: 'Based on your routine, you usually work out on Wednesdays',
    icon: 'fitness-center',
  },
  {
    id: 2,
    title: 'Buy Groceries',
    reason: 'Your last grocery trip was 7 days ago',
    icon: 'shopping-basket',
  },
];

const reminders: Reminder[] = [
  {
    id: 1,
    title: 'Team Meeting',
    time: '10:00 AM',
    date: '2024-03-20',
    category: 'Work',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Take Vitamins',
    time: '9:00 AM',
    date: '2024-03-20',
    category: 'Health',
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Grocery Shopping',
    time: '4:00 PM',
    date: '2024-03-21',
    category: 'Shopping',
    priority: 'low',
  },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const swipeableRefs = useRef<{ [key: number]: Swipeable | null }>({});
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const categoryScrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const startVoiceSearch = async () => {
    if (isListening) return;
    
    setIsListening(true);
    setIsLoading(true);
    try {
      await Speech.speak('Listening...', {
        language: 'en-US',
        onDone: () => {
          setTimeout(() => {
            setSearchQuery('voice search demo');
            setIsListening(false);
            setIsLoading(false);
          }, 1500);
        },
        onError: (error) => {
          setError('Voice recognition failed');
          setIsListening(false);
          setIsLoading(false);
        },
      });
    } catch (error) {
      setError('Failed to start voice recognition');
      setIsListening(false);
      setIsLoading(false);
    }
  };

  const handleWeatherIcon = (condition: string): keyof typeof MaterialIcons.glyphMap => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return 'wb-sunny';
      case 'cloudy':
        return 'cloud';
      case 'rainy':
        return 'grain';
      case 'snowy':
        return 'ac-unit';
      default:
        return 'wb-sunny';
    }
  };

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual weather API call
      const mockWeather: WeatherInfo = {
        temp: 72,
        condition: 'Sunny',
        icon: handleWeatherIcon('Sunny'),
      };
      setWeather(mockWeather);
    } catch (error) {
      setError('Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation);
        
        if (userLocation?.coords) {
          await fetchWeatherData(userLocation.coords.latitude, userLocation.coords.longitude);
        }
      } catch (error) {
        setError('Failed to get location');
      }
    })();
  }, []);

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const completionRate = useMemo(() => {
    const completed = reminders.filter(r => r.isCompleted).length;
    return completed / reminders.length;
  }, [reminders]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const filteredAndGroupedReminders = useMemo(() => {
    const filtered = reminders
      .filter(reminder => 
        selectedCategory === 'All' || reminder.category === selectedCategory
      )
      .filter(reminder =>
        reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return filtered.reduce((groups: { [key: string]: Reminder[] }, reminder) => {
      if (!groups[reminder.date]) {
        groups[reminder.date] = [];
      }
      groups[reminder.date].push(reminder);
      return groups;
    }, {});
  }, [selectedCategory, searchQuery]);

  const animatePress = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderQuickAction = (action: typeof quickActions[0], index: number) => {
    const scale = new Animated.Value(1);
    
    return (
      <Pressable 
        key={index}
        onPress={() => animatePress(scale)}
        style={({ pressed }) => [
          styles.quickActionButton,
          pressed && { opacity: 0.8 }
        ]}
      >
        <Animated.View 
          style={[
            styles.quickActionIcon,
            { transform: [{ scale }] }
          ]}
        >
          <MaterialIcons 
            name={action.icon as keyof typeof MaterialIcons.glyphMap} 
            size={24} 
            color="#6366f1" 
          />
        </Animated.View>
        <Text style={styles.quickActionLabel}>{action.label}</Text>
      </Pressable>
    );
  };

  const renderCategory = (category: Category, index: number) => {
    const scale = new Animated.Value(1);
    const isSelected = selectedCategory === category.name;
    
    return (
      <Pressable
        key={index}
        onPress={() => {
          setSelectedCategory(category.name);
          animatePress(scale);
        }}
        style={({ pressed }) => [
          styles.categoryCard,
          isSelected && styles.selectedCategoryCard,
          pressed && { opacity: 0.8 }
        ]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <MaterialIcons 
            name={category.icon} 
            size={24} 
            color={isSelected ? '#fff' : '#6366f1'} 
          />
          <Text style={[styles.categoryName, isSelected && styles.selectedCategoryText]}>
            {category.name}
          </Text>
          <Text style={[styles.categoryCount, isSelected && styles.selectedCategoryText]}>
            {category.count}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, reminder: Reminder) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActions}>
        <Animated.View style={[styles.rightAction, { transform: [{ scale }] }]}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={() => {
              // TODO: Handle complete action
              swipeableRefs.current[reminder.id]?.close();
            }}
          >
            <MaterialIcons name="check" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.rightAction, { transform: [{ scale }] }]}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
            onPress={() => {
              // TODO: Handle delete action
              swipeableRefs.current[reminder.id]?.close();
            }}
          >
            <MaterialIcons name="delete" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.ScrollView 
        style={[styles.container, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {error && (
          <Animated.View 
            style={[
              styles.errorContainer,
              { transform: [{ translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })}] }
            ]}
          >
            <MaterialIcons name="error-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}
        <Animated.View 
          style={[
            styles.header,
            {
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}
        >
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name}>Alex</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <MaterialIcons name="notifications" size={24} color="#1f2937" />
            <View style={styles.badge} />
          </TouchableOpacity>
          {weather && (
            <View style={styles.weatherContainer}>
              <MaterialIcons name={weather.icon as keyof typeof MaterialIcons.glyphMap} size={24} color="#1f2937" />
              <Text style={styles.temperature}>{weather.temp}°F</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressPercent}>{Math.round(completionRate * 100)}%</Text>
          </View>
          <Progress.Bar 
            progress={completionRate} 
            width={null} 
            height={8}
            color="#6366f1"
            unfilledColor="#e5e7eb"
            borderWidth={0}
            borderRadius={4}
          />
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reminders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity 
            onPress={startVoiceSearch}
            style={[
              styles.voiceButton,
              isListening && styles.voiceButtonActive,
            ]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <MaterialIcons 
                name="mic" 
                size={20} 
                color={isListening ? '#6366f1' : '#6b7280'} 
              />
            )}
          </TouchableOpacity>
          {searchQuery !== '' && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <MaterialIcons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => renderQuickAction(action, index))}
        </View>

        <Animated.ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: categoryScrollAnim } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {categories.map((category, index) => renderCategory(category, index))}
        </Animated.ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Suggestions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsContainer}
          >
            {aiSuggestions.map((suggestion) => (
              <TouchableOpacity key={suggestion.id} style={styles.suggestionCard}>
                <View style={styles.suggestionIcon}>
                  <MaterialIcons name={suggestion.icon} size={24} color="#6366f1" />
                </View>
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                  <Text style={styles.suggestionReason}>{suggestion.reason}</Text>
                </View>
                <MaterialIcons name="add-circle" size={24} color="#6366f1" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Reminders</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {Object.keys(filteredAndGroupedReminders).length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={48} color="#e5e7eb" />
              <Text style={styles.emptyStateText}>No reminders found</Text>
            </View>
          ) : (
            Object.entries(filteredAndGroupedReminders).map(([date, dayReminders]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{formatDate(date)}</Text>
                {dayReminders.map((reminder) => (
                  <Swipeable
                    key={reminder.id}
                    ref={ref => swipeableRefs.current[reminder.id] = ref}
                    renderRightActions={(progress, dragX) => 
                      renderRightActions(progress, dragX, reminder)
                    }
                  >
                    <TouchableOpacity style={styles.reminderCard}>
                      <View style={styles.reminderLeft}>
                        <View 
                          style={[
                            styles.priorityDot, 
                            { backgroundColor: getPriorityColor(reminder.priority) }
                          ]} 
                        />
                        <View>
                          <Text style={styles.reminderTitle}>{reminder.title}</Text>
                          <Text style={styles.reminderCategory}>{reminder.category}</Text>
                        </View>
                      </View>
                      <View style={styles.reminderRight}>
                        <Text style={styles.reminderTime}>{reminder.time}</Text>
                        <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
                      </View>
                    </TouchableOpacity>
                  </Swipeable>
                ))}
              </View>
            ))
          )}
        </View>

        <Link href="/add" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
            ]}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add New Reminder</Text>
          </Pressable>
        </Link>
      </Animated.ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  profileButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  categories: {
    paddingLeft: 20,
    marginBottom: 24,
  },
  categoryCard: {
    width: 100,
    height: 100,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedCategoryCard: {
    backgroundColor: '#6366f1',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  categoryCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAll: {
    fontSize: 14,
    color: '#6366f1',
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  reminderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  reminderCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  reminderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTime: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  rightAction: {
    marginHorizontal: 4,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 20,
    gap: 4,
  },
  temperature: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressPercent: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  voiceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#ede9fe',
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 280,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
    marginRight: 12,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  suggestionReason: {
    fontSize: 12,
    color: '#6b7280',
  },
  clearButton: {
    padding: 4,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    flexDirection: 'row' as const,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
});
