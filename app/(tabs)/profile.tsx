import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';

const settingsSections = [
  {
    title: 'Account',
    items: [
      { icon: 'person', title: 'Edit Profile' },
      { icon: 'email', title: 'Email Preferences' },
      { icon: 'notifications', title: 'Notification Settings' },
    ],
  },
  {
    title: 'App Settings',
    items: [
      { icon: 'palette', title: 'Theme', hasSwitch: true },
      { icon: 'language', title: 'Language' },
      { icon: 'sync', title: 'Sync Frequency' },
    ],
  },
  {
    title: 'AI Preferences',
    items: [
      { icon: 'psychology', title: 'AI Mode' },
      { icon: 'location-on', title: 'Location Learning', hasSwitch: true },
      { icon: 'trending-up', title: 'Behavior Analysis', hasSwitch: true },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help', title: 'Help Center' },
      { icon: 'feedback', title: 'Send Feedback' },
      { icon: 'info', title: 'About' },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [behaviorAnalysis, setBehaviorAnalysis] = useState(true);

  const getToggleForSetting = (title: string) => {
    switch (title) {
      case 'Theme':
        return (
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#e5e7eb', true: '#818cf8' }}
            thumbColor={isDarkMode ? '#6366f1' : '#fff'}
          />
        );
      case 'Location Learning':
        return (
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: '#e5e7eb', true: '#818cf8' }}
            thumbColor={locationEnabled ? '#6366f1' : '#fff'}
          />
        );
      case 'Behavior Analysis':
        return (
          <Switch
            value={behaviorAnalysis}
            onValueChange={setBehaviorAnalysis}
            trackColor={{ false: '#e5e7eb', true: '#818cf8' }}
            thumbColor={behaviorAnalysis ? '#6366f1' : '#fff'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <TouchableOpacity style={styles.editAvatarButton}>
            <MaterialIcons name="camera-alt" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>Alex Johnson</Text>
        <Text style={styles.email}>alex.johnson@example.com</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>156</Text>
          <Text style={styles.statLabel}>Reminders</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>92%</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>4</Text>
          <Text style={styles.statLabel}>Groups</Text>
        </View>
      </View>

      {settingsSections.map((section, sectionIndex) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity 
              key={item.title}
              style={[
                styles.settingItem,
                itemIndex === section.items.length - 1 && styles.lastSettingItem,
              ]}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons name={item.icon} size={24} color="#6b7280" />
                <Text style={styles.settingTitle}>{item.title}</Text>
              </View>
              {item.hasSwitch ? (
                getToggleForSetting(item.title)
              ) : (
                <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => router.replace('/')}
      >
        <MaterialIcons name="logout" size={24} color="#ef4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profileSection: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  lastSettingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
}); 