import { Stack } from 'expo-router';
import { useAuth } from '@/context/auth';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AppLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to the sign-in page if not authenticated
      router.replace('/(onboarding)');
    }
  }, [user, loading]);

  if (loading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Stack>
  );
} 