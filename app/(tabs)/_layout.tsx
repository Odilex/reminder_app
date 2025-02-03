import React, { useContext } from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image, View, Text } from 'react-native';
import Colors from '@/constants/Colors';
import { ThemeContext } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';

function ProfileTabIcon({ color }: { color: string }) {
  const { user } = useUser();
  
  if (user?.profileImage) {
    return (
      <Image 
        source={{ uri: user.profileImage }} 
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: color,
        }}
      />
    );
  }

  if (user?.name) {
    return (
      <View style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: color,
      }}>
        <Text style={{ color: Colors.white, fontSize: 12, fontWeight: 'bold' }}>
          {user.name.charAt(0)}
        </Text>
      </View>
    );
  }

  return <MaterialIcons name="person" size={24} color={color} />;
}

export default function TabLayout() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkMode ? Colors.dark.primary : Colors.primary,
        tabBarInactiveTintColor: isDarkMode ? Colors.dark.text : Colors.gray,
        tabBarStyle: {
          backgroundColor: isDarkMode ? Colors.dark.card : Colors.white,
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? Colors.dark.border : Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="add-circle" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="memory"
        options={{
          title: 'Memory',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="history" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shared"
        options={{
          title: 'Shared',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="group" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <ProfileTabIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
