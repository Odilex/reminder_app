import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const features = [
  {
    title: 'Smart Reminders',
    description: 'AI-powered reminders that learn from your daily routines',
    icon: 'notifications' as const,
  },
  {
    title: 'Predictive Suggestions',
    description: 'Get intelligent suggestions based on your behavior patterns',
    icon: 'psychology' as const,
  },
  {
    title: 'Task Management',
    description: 'Organize and track your tasks with ease',
    icon: 'check-circle' as const,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeIn.duration(1000)}
        style={styles.carouselContainer}
      >
        <View style={styles.feature}>
          <MaterialIcons name={features[currentIndex].icon} size={80} color="#6366f1" />
          <Text style={styles.title}>{features[currentIndex].title}</Text>
          <Text style={styles.description}>{features[currentIndex].description}</Text>
        </View>

        <View style={styles.dotsContainer}>
          {features.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: currentIndex === index ? '#6366f1' : '#e2e8f0' },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (currentIndex < features.length - 1) {
              setCurrentIndex(currentIndex + 1);
            } else {
              router.push('/(auth)/login');
            }
          }}
        >
          <Text style={styles.buttonText}>
            {currentIndex < features.length - 1 ? 'Next' : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feature: {
    width: width - 40,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#1f2937',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 