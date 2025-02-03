import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Linking, Image, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MaterialIcons as MaterialIconsType } from '@expo/vector-icons/MaterialIcons';
import { useState, useContext } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';
import { ThemeContext, useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { ComponentProps } from 'react';

// Get the correct type for MaterialIcons names
type IconProps = ComponentProps<typeof MaterialIcons>;
type MaterialIconName = IconProps['name'];

// Define our valid icon names
const VALID_ICONS = {
  checkCircle: 'check-circle-outline' as MaterialIconName,
  chevronRight: 'chevron-right' as MaterialIconName,
  close: 'close' as MaterialIconName,
  phone: 'phone-enabled' as MaterialIconName,
  camera: 'camera-alt' as MaterialIconName,
  mail: 'mail-outline' as MaterialIconName,
  star: 'star' as MaterialIconName,
  starOutline: 'star-outline' as MaterialIconName,
  person: 'person-outline' as MaterialIconName,
  notifications: 'notifications-none' as MaterialIconName,
  palette: 'palette' as MaterialIconName,
  language: 'language' as MaterialIconName,
  sync: 'sync' as MaterialIconName,
  psychology: 'psychology' as MaterialIconName,
  location: 'location-on-outline' as MaterialIconName,
  trending: 'trending-up' as MaterialIconName,
  help: 'help-outline' as MaterialIconName,
  info: 'info-outline' as MaterialIconName,
  logout: 'logout' as MaterialIconName,
};

type IconName = keyof typeof MaterialIcons.glyphMap;

// Define the valid icon names as a const array
const validIconNames = [
  'check-circle-outline',
  'chevron-right',
  'close',
  'phone-enabled',
  'camera-alt',
  'mail-outline',
  'star',
  'star-outline',
  'person-outline',
  'notifications-none',
  'palette',
  'language',
  'sync',
  'psychology',
  'location-on-outline',
  'trending-up',
  'help-outline',
  'info-outline',
  'logout',
] as const;

type ValidIconName = typeof validIconNames[number];

type SettingItem = {
  icon: IconName;
  title: string;
  hasSwitch?: boolean;
  description?: string;
};

type SettingSection = {
  title: string;
  items: SettingItem[];
};

const languageOptions = ['English', 'Spanish', 'French', 'German', 'Chinese'];
const syncOptions = ['Every 15 minutes', 'Every hour', 'Every 6 hours', 'Daily'];
const aiModeOptions = ['Aggressive', 'Balanced', 'Conservative', 'Off'];

const settingsSections: SettingSection[] = [
  {
    title: 'Account',
    items: [
      { 
        icon: 'person-outline' as IconName,
        title: 'Edit Profile',
        description: 'Update your profile information'
      },
      { 
        icon: 'mail-outline' as IconName,
        title: 'Email Preferences',
        description: 'Manage your email notifications'
      },
      { 
        icon: 'notifications-none' as IconName,
        title: 'Notification Settings',
        description: 'Customize your notification preferences'
      },
    ],
  },
  {
    title: 'App Settings',
    items: [
      { icon: 'palette' as IconName, title: 'Theme', hasSwitch: true },
      { icon: 'language' as IconName, title: 'Language' },
      { icon: 'sync' as IconName, title: 'Sync Frequency' },
    ],
  },
  {
    title: 'AI Preferences',
    items: [
      { icon: 'psychology' as IconName, title: 'AI Mode' },
      { icon: 'location-on-outline' as IconName, title: 'Location Learning', hasSwitch: true },
      { icon: 'trending-up' as IconName, title: 'Behavior Analysis', hasSwitch: true },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-outline' as IconName, title: 'Help Center' },
      { icon: 'info-outline' as IconName, title: 'About' },
    ],
  },
];

const baseHeaderStyle = StyleSheet.create({
  light: {
    backgroundColor: Colors.light.background,
  },
  dark: {
    backgroundColor: Colors.dark.background,
  },
});

export default function ProfileScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme, theme, getThemedColor } = useTheme();
  const { user, updateProfileImage } = useUser();
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [behaviorAnalysis, setBehaviorAnalysis] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedSync, setSelectedSync] = useState('Every hour');
  const [selectedAIMode, setSelectedAIMode] = useState('Balanced');
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [showEmailPreferences, setShowEmailPreferences] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState({
    reminders: true,
    updates: true,
    newsletter: false,
    marketing: false,
  });
  const [pushNotifications, setPushNotifications] = useState({
    upcoming: true,
    daily: true,
    mentions: true,
    shared: true,
    suggestions: true,
  });

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      updateProfileImage(result.assets[0].uri);
    }
  };

  const getToggleForSetting = (title: string) => {
    switch (title) {
      case 'Theme':
        return (
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: Colors.gray, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        );
      case 'Location Learning':
        return (
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: Colors.gray, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        );
      case 'Behavior Analysis':
        return (
          <Switch
            value={behaviorAnalysis}
            onValueChange={setBehaviorAnalysis}
            trackColor={{ false: Colors.gray, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        );
      default:
        return null;
    }
  };

  const handleSettingPress = (title: string) => {
    switch (title) {
      case 'Language':
        setShowLanguageModal(true);
        break;
      case 'Sync Frequency':
        setShowSyncModal(true);
        break;
      case 'AI Mode':
        setShowAIModal(true);
        break;
      case 'Help Center':
        setShowHelpCenter(true);
        break;
      case 'About':
        setShowAbout(true);
        break;
      case 'Edit Profile':
        router.push('/edit-profile');
        break;
      case 'Email Preferences':
        setShowEmailPreferences(true);
        break;
      case 'Notification Settings':
        setShowNotificationSettings(true);
        break;
      default:
        break;
    }
  };

  const handleCall = () => {
    try {
      Linking.openURL('tel:+250786493820');
    } catch (error) {
      console.error('Error opening phone:', error);
    }
  };

  const handleEmail = () => {
    try {
      Linking.openURL('mailto:Lumion.corps@gmail.com');
    } catch (error) {
      console.error('Error opening email:', error);
    }
  };

  const handleFeedbackSubmit = () => {
    // TODO: Implement feedback submission
    setShowFeedback(false);
    setFeedback('');
    setRating(0);
  };

  const renderOptionsModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: string[],
    selectedOption: string,
    onSelect: (option: string) => void
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  selectedOption === option && styles.selectedOption,
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === option && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
                {selectedOption === option && (
                  <MaterialIcons 
                    name={VALID_ICONS.checkCircle}
                    size={24} 
                    color="#6366f1" 
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderStar = (index: number) => {
    const iconName = index <= rating ? VALID_ICONS.star : VALID_ICONS.starOutline;
    return (
      <TouchableOpacity key={index} onPress={() => setRating(index)}>
        <MaterialIcons
          name={iconName}
          size={32}
          color={theme.primary}
        />
      </TouchableOpacity>
    );
  };

  const headerStyle = StyleSheet.create({
    dynamic: {
      backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
    } as ViewStyle,
  });

  return (
    <ScrollView 
      style={[
        styles.container, 
        { backgroundColor: theme.background }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, headerStyle.dynamic]}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user?.name?.[0] || 'L'}</Text>
        </View>
            )}
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={handleTakePhoto}
            >
              <MaterialIcons 
                name={VALID_ICONS.camera} 
                size={16} 
                color={Colors.white} 
              />
            </TouchableOpacity>
        </View>
          <Text style={[styles.profileName, isDarkMode && styles.darkText]}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {settingsSections.map((section, sectionIndex) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            {section.title}
          </Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity 
              key={item.title}
              style={[
                styles.settingItem,
                itemIndex === section.items.length - 1 && styles.lastSettingItem,
                { backgroundColor: isDarkMode ? Colors.dark.card : Colors.white }
              ]}
              onPress={() => handleSettingPress(item.title)}
            >
              <View style={styles.settingLeft}>
                <View style={[
                  styles.iconWrapper,
                  { backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.card }
                ]}>
                  <MaterialIcons 
                    name={item.icon}
                    size={22} 
                    color={isDarkMode ? Colors.white : Colors.text} 
                  />
                </View>
                <View>
                  <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>
                    {item.title}
                  </Text>
                  {item.description && (
                    <Text style={styles.settingDescription}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </View>
              {item.hasSwitch ? (
                getToggleForSetting(item.title)
              ) : (
                <MaterialIcons 
                  name="chevron-right"
                  size={20} 
                  color={isDarkMode ? Colors.white : Colors.text} 
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => router.replace('/')}
      >
        <MaterialIcons 
          name={VALID_ICONS.logout} 
          size={22} 
          color="#ef4444" 
        />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {renderOptionsModal(
        showLanguageModal,
        () => setShowLanguageModal(false),
        'Select Language',
        languageOptions,
        selectedLanguage,
        setSelectedLanguage
      )}

      {renderOptionsModal(
        showSyncModal,
        () => setShowSyncModal(false),
        'Sync Frequency',
        syncOptions,
        selectedSync,
        setSelectedSync
      )}

      {renderOptionsModal(
        showAIModal,
        () => setShowAIModal(false),
        'AI Mode',
        aiModeOptions,
        selectedAIMode,
        setSelectedAIMode
      )}

      <Modal
        visible={showHelpCenter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHelpCenter(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowHelpCenter(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={e => e.stopPropagation()}
            style={[styles.modalContent, isDarkMode && styles.darkModalContent]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Help Center</Text>
              <TouchableOpacity onPress={() => setShowHelpCenter(false)}>
                <MaterialIcons 
                  name={VALID_ICONS.close}
                  size={24} 
                  color={isDarkMode ? Colors.white : Colors.text} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.contactItem}>
              <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                <MaterialIcons 
                  name={VALID_ICONS.phone}
                  size={24} 
                  color={Colors.primary} 
                />
                <Text style={[styles.contactText, isDarkMode && styles.darkText]}>Call Center: +250786493820</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contactItem}>
              <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                <MaterialIcons 
                  name={VALID_ICONS.mail}
                  size={24} 
                  color={Colors.primary} 
                />
                <Text style={[styles.contactText, isDarkMode && styles.darkText]}>Email: Lumion.corps@gmail.com</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showFeedback}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFeedback(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowFeedback(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={e => e.stopPropagation()}
            style={[styles.modalContent, isDarkMode && styles.darkModalContent]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Send Feedback</Text>
              <TouchableOpacity onPress={() => setShowFeedback(false)}>
                <MaterialIcons 
                  name={VALID_ICONS.close}
                  size={24} 
                  color={isDarkMode ? Colors.white : Colors.text} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(renderStar)}
            </View>

            <TextInput
              style={[
                styles.feedbackInput, 
                isDarkMode && {
                  backgroundColor: Colors.dark.card,
                  borderColor: Colors.dark.border,
                  color: Colors.dark.text
                }
              ]}
              placeholder="Write your feedback here..."
              placeholderTextColor={isDarkMode ? Colors.dark.text : Colors.gray}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity 
              style={[
                styles.submitButton, 
                !feedback && styles.disabledButton,
                isDarkMode && {
                  backgroundColor: Colors.dark.primary
                }
              ]}
              onPress={handleFeedbackSubmit}
              disabled={!feedback}
            >
              <Text style={[
                styles.submitButtonText,
                isDarkMode && {
                  color: Colors.dark.text
                }
              ]}>Submit Feedback</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showAbout}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAbout(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowAbout(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={e => e.stopPropagation()}
            style={[styles.modalContent, isDarkMode && styles.darkModalContent]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>About</Text>
              <TouchableOpacity onPress={() => setShowAbout(false)}>
                <MaterialIcons 
                  name={VALID_ICONS.close}
                  size={24} 
                  color={isDarkMode ? Colors.white : Colors.text} 
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.aboutContent}>
              <Text style={[styles.aboutTitle, isDarkMode && styles.darkText]}>
                Welcome to Lumion Reminder App
              </Text>
              
              <Text style={[styles.aboutText, isDarkMode && styles.darkText]}>
                Lumion Reminder is your all-in-one solution for managing tasks, reminders, and collaborative activities.
              </Text>

              <Text style={[styles.aboutSubtitle, isDarkMode && styles.darkText]}>Key Features:</Text>
              
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <MaterialIcons 
                    name={VALID_ICONS.checkCircle} 
                    size={20} 
                    color={Colors.primary} 
                  />
                  <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                    Smart Task Management
                  </Text>
                </View>
                
                <View style={styles.featureItem}>
                  <MaterialIcons 
                    name={VALID_ICONS.checkCircle} 
                    size={20} 
                    color={Colors.primary} 
                  />
                  <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                    Shared Reminders with Team Members
                  </Text>
                </View>
                
                <View style={styles.featureItem}>
                  <MaterialIcons 
                    name={VALID_ICONS.checkCircle} 
                    size={20} 
                    color={Colors.primary} 
                  />
                  <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                    Memory Feature for Past Activities
                  </Text>
                </View>
                
                <View style={styles.featureItem}>
                  <MaterialIcons 
                    name={VALID_ICONS.checkCircle} 
                    size={20} 
                    color={Colors.primary} 
                  />
                  <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                    Voice Search Capability
                  </Text>
                </View>
                
                <View style={styles.featureItem}>
                  <MaterialIcons 
                    name={VALID_ICONS.checkCircle} 
                    size={20} 
                    color={Colors.primary} 
                  />
                  <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                    AI-Powered Suggestions
                  </Text>
                </View>
              </View>

              <Text style={[styles.versionText, isDarkMode && styles.darkText]}>
                Version 1.0.0
              </Text>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Email Preferences Modal */}
      <Modal
        visible={showEmailPreferences}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmailPreferences(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowEmailPreferences(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={e => e.stopPropagation()}
            style={[styles.modalContent, isDarkMode && styles.darkModalContent]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                Email Preferences
              </Text>
              <TouchableOpacity onPress={() => setShowEmailPreferences(false)}>
                <MaterialIcons 
                  name="close"
                  size={24} 
                  color={isDarkMode ? Colors.white : Colors.text} 
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.preferenceSection}>
                <View style={styles.preferenceItem}>
                  <Text style={[styles.preferenceTitle, isDarkMode && styles.darkText]}>
                    Reminder Notifications
                  </Text>
                  <Text style={styles.preferenceDescription}>
                    Get emails about your upcoming reminders
                  </Text>
                  <Switch
                    value={emailNotifications.reminders}
                    onValueChange={(value) => 
                      setEmailNotifications(prev => ({ ...prev, reminders: value }))
                    }
                    trackColor={{ false: Colors.gray, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.preferenceItem}>
                  <Text style={[styles.preferenceTitle, isDarkMode && styles.darkText]}>
                    App Updates
                  </Text>
                  <Text style={styles.preferenceDescription}>
                    Receive notifications about new features and updates
                  </Text>
                  <Switch
                    value={emailNotifications.updates}
                    onValueChange={(value) => 
                      setEmailNotifications(prev => ({ ...prev, updates: value }))
                    }
                    trackColor={{ false: Colors.gray, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.preferenceItem}>
                  <Text style={[styles.preferenceTitle, isDarkMode && styles.darkText]}>
                    Newsletter
                  </Text>
                  <Text style={styles.preferenceDescription}>
                    Weekly digest of productivity tips and insights
                  </Text>
                  <Switch
                    value={emailNotifications.newsletter}
                    onValueChange={(value) => 
                      setEmailNotifications(prev => ({ ...prev, newsletter: value }))
                    }
                    trackColor={{ false: Colors.gray, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.preferenceItem}>
                  <Text style={[styles.preferenceTitle, isDarkMode && styles.darkText]}>
                    Marketing Emails
                  </Text>
                  <Text style={styles.preferenceDescription}>
                    Special offers and promotional content
                  </Text>
                  <Switch
                    value={emailNotifications.marketing}
                    onValueChange={(value) => 
                      setEmailNotifications(prev => ({ ...prev, marketing: value }))
                    }
                    trackColor={{ false: Colors.gray, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal
        visible={showNotificationSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotificationSettings(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowNotificationSettings(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={e => e.stopPropagation()}
            style={[styles.modalContent, isDarkMode && styles.darkModalContent]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                Notification Settings
              </Text>
              <TouchableOpacity onPress={() => setShowNotificationSettings(false)}>
                <MaterialIcons 
                  name="close"
                  size={24} 
                  color={isDarkMode ? Colors.white : Colors.text} 
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.preferenceSection}>
                <View style={styles.preferenceItem}>
                  <Text style={[styles.preferenceTitle, isDarkMode && styles.darkText]}>
                    Upcoming Reminders
                  </Text>
                  <Text style={styles.preferenceDescription}>
                    Get notified about upcoming tasks and events
                  </Text>
                  <Switch
                    value={pushNotifications.upcoming}
                    onValueChange={(value) => 
                      setPushNotifications(prev => ({ ...prev, upcoming: value }))
                    }
                    trackColor={{ false: Colors.gray, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.preferenceItem}>
                  <Text style={[styles.preferenceTitle, isDarkMode && styles.darkText]}>
                    Daily Summary
                  </Text>
                  <Text style={styles.preferenceDescription}>
                    Receive a daily overview of your tasks
                  </Text>
                  <Switch
                    value={pushNotifications.daily}
                    onValueChange={(value) => 
                      setPushNotifications(prev => ({ ...prev, daily: value }))
                    }
                    trackColor={{ false: Colors.gray, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.preferenceItem}>
                  <Text style={[styles.preferenceTitle, isDarkMode && styles.darkText]}>
                    Mentions
                  </Text>
                  <Text style={styles.preferenceDescription}>
                    Get notified when someone mentions you
                  </Text>
                  <Switch
                    value={pushNotifications.mentions}
                    onValueChange={(value) => 
                      setPushNotifications(prev => ({ ...prev, mentions: value }))
                    }
                    trackColor={{ false: Colors.gray, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.preferenceItem}>
                  <Text style={[styles.preferenceTitle, isDarkMode && styles.darkText]}>
                    Shared Reminders
                  </Text>
                  <Text style={styles.preferenceDescription}>
                    Notifications about shared tasks and updates
                  </Text>
                  <Switch
                    value={pushNotifications.shared}
                    onValueChange={(value) => 
                      setPushNotifications(prev => ({ ...prev, shared: value }))
                    }
                    trackColor={{ false: Colors.gray, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.preferenceItem}>
                  <Text style={[styles.preferenceTitle, isDarkMode && styles.darkText]}>
                    AI Suggestions
                  </Text>
                  <Text style={styles.preferenceDescription}>
                    Get notified about personalized task suggestions
                  </Text>
                  <Switch
                    value={pushNotifications.suggestions}
                    onValueChange={(value) => 
                      setPushNotifications(prev => ({ ...prev, suggestions: value }))
                    }
                    trackColor={{ false: Colors.gray, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
  } as ViewStyle,
  profileContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.gray,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    color: Colors.white,
    fontWeight: '600',
  },
  editAvatarButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.light.background,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  editProfileText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.gray,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 40,
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  darkText: {
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  darkModalContent: {
    backgroundColor: '#2a2a2a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  contactItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: Colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  feedbackInput: {
    margin: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 120,
    textAlignVertical: 'top',
    color: Colors.text,
  },
  darkInput: {
    backgroundColor: '#333',
    color: Colors.white,
    borderColor: '#444',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  aboutContent: {
    padding: 20,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 24,
    lineHeight: 24,
  },
  aboutSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
  },
  versionText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedOption: {
    backgroundColor: Colors.primary + '10',
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 20,
  },
  modalCloseText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  preferenceSection: {
    gap: 20,
  },
  preferenceItem: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 12,
  },
}); 