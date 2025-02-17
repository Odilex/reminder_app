import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Linking, Image, ViewStyle } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MaterialIcons as MaterialIconsType } from '@expo/vector-icons/MaterialIcons';
import { useState, useContext } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';
import { ThemeContext, useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { ComponentProps } from 'react';
import { useLanguage, languages, Language } from '../../context/LanguageContext';

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
  value?: boolean;
  onValueChange?: (value: boolean) => void;
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
  },
  profileImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  profileImageText: {
    fontSize: 36,
    color: Colors.white,
    fontWeight: '800',
  },
  profileInfo: {
    marginLeft: 24,
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 15,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemContent: {
    marginLeft: 20,
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingItemDescription: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 40,
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },
  darkText: {
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  darkModalContent: {
    backgroundColor: Colors.dark.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  modalBody: {
    padding: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.light.card,
  },
  selectedOption: {
    backgroundColor: Colors.primary + '10',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: Colors.light.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalCloseText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  preferenceSection: {
    gap: 16,
  },
  preferenceItem: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  preferenceTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  preferenceDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 16,
    lineHeight: 20,
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
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  selectedLanguageOption: {
    backgroundColor: Colors.primary + '10',
  },
  languageText: {
    fontSize: 16,
  },
  selectedLanguageText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  bottomSheetContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: '50%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
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
  const { language: currentLanguage, setLanguage, t } = useLanguage();

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
      case t('language'):
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
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          isDarkMode && styles.darkModalContent
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              isDarkMode && styles.darkText
            ]}>{title}</Text>
            <TouchableOpacity
              style={[
                styles.modalCloseButton,
                isDarkMode && { backgroundColor: Colors.dark.card }
              ]}
              onPress={onClose}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  isDarkMode && { backgroundColor: Colors.dark.card },
                  selectedOption === option && { backgroundColor: Colors.primary + '20' }
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={[
                  styles.optionText,
                  isDarkMode && styles.darkText,
                  selectedOption === option && { color: Colors.primary }
                ]}>{option}</Text>
                {selectedOption === option && (
                  <MaterialIcons
                    name="check"
                    size={24}
                    color={Colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
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

  const renderLanguageModal = () => (
    <Modal
      visible={showLanguageModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLanguageModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              {t('selectLanguage')}
            </Text>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <MaterialIcons 
                name="close"
                size={24} 
                color={isDarkMode ? Colors.white : Colors.text} 
              />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {(Object.entries(languages) as [Language, string][]).map(([code, name]) => (
              <TouchableOpacity
                key={code}
                style={[
                  styles.optionItem,
                  currentLanguage === code && styles.selectedOption,
                ]}
                onPress={() => {
                  setLanguage(code);
                  setShowLanguageModal(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    currentLanguage === code && styles.selectedOptionText,
                  ]}
                >
                  {name}
                </Text>
                {currentLanguage === code && (
                  <MaterialIcons 
                    name="check-circle-outline"
                    size={24} 
                    color={Colors.primary} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowLanguageModal(false)}
          >
            <Text style={styles.modalCloseText}>{t('close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderBottomSheet = (
    visible: boolean,
    onClose: () => void,
    title: string,
    content: React.ReactNode
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={[
          styles.bottomSheetOverlay,
          { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
        ]} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={e => e.stopPropagation()}
          style={[
            styles.bottomSheetContent,
            { backgroundColor: isDarkMode ? Colors.dark.card : Colors.light.card }
          ]}
        >
          <View style={[
            styles.bottomSheetHeader,
            { borderBottomColor: isDarkMode ? Colors.dark.border : Colors.light.border }
          ]}>
            <Text style={[
              styles.bottomSheetTitle,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text }
            ]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons 
                name="close"
                size={24} 
                color={isDarkMode ? Colors.dark.text : Colors.light.text} 
              />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {content}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  const handleLogout = () => {
    // Add any logout logic here (clear tokens, user data, etc.)
    router.replace('/(onboarding)');
  };

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background }]}>
        <View style={[
          styles.header, 
          { 
            backgroundColor: isDarkMode ? Colors.dark.card : Colors.light.card,
            borderBottomColor: isDarkMode ? Colors.dark.border : Colors.light.border 
          }
        ]}>
          <Text style={[
            styles.headerTitle, 
            { color: isDarkMode ? Colors.dark.text : Colors.light.text }
          ]}>
            {t('profile')}
          </Text>
        </View>

        <View style={styles.profileSection}>
          <View style={[
            styles.profileImageContainer, 
            { backgroundColor: isDarkMode ? Colors.dark.card : Colors.light.card }
          ]}>
            {user?.profileImage ? (
              <Image 
                source={{ uri: user.profileImage }} 
                style={[
                  styles.profileImage,
                  { borderColor: isDarkMode ? Colors.dark.primary : Colors.light.primary }
                ]} 
              />
            ) : (
              <View style={[
                styles.profileImagePlaceholder, 
                { 
                  backgroundColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
                  borderColor: isDarkMode ? Colors.dark.primary : Colors.light.primary 
                }
              ]}>
                <Text style={styles.profileImageText}>
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={[
                styles.profileName,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text }
              ]}>
                {user?.name || 'User'}
              </Text>
              <Text style={[
                styles.profileEmail,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text }
              ]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
          </View>
        </View>

        {settingsSections.map((section) => (
          <View 
            key={section.title} 
            style={[
              styles.section,
              { backgroundColor: isDarkMode ? Colors.dark.card : Colors.light.card }
            ]}
          >
            <Text style={[
              styles.sectionTitle,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text }
            ]}>
              {section.title}
            </Text>
            
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={item.title}
                style={[
                  styles.settingItem,
                  itemIndex < section.items.length - 1 && [
                    styles.settingItemBorder,
                    { borderBottomColor: isDarkMode ? Colors.dark.border : Colors.light.border }
                  ]
                ]}
                onPress={() => handleSettingPress(item.title)}
              >
                <View style={styles.settingItemLeft}>
                  <MaterialIcons 
                    name={item.icon} 
                    size={24} 
                    color={isDarkMode ? Colors.dark.primary : Colors.light.primary}
                  />
                  <View style={styles.settingItemContent}>
                    <Text style={[
                      styles.settingItemTitle,
                      { color: isDarkMode ? Colors.dark.text : Colors.light.text }
                    ]}>
                      {item.title}
                    </Text>
                    {item.description && (
                      <Text style={[
                        styles.settingItemDescription,
                        { color: isDarkMode ? Colors.dark.text : Colors.light.text, opacity: 0.6 }
                      ]}>
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
                    size={24} 
                    color={isDarkMode ? Colors.dark.text : Colors.light.text} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity 
          style={[
            styles.logoutButton,
            {
              backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
              shadowColor: isDarkMode ? Colors.dark.error : Colors.light.error
            }
          ]}
          onPress={handleLogout}
        >
          <MaterialIcons 
            name={VALID_ICONS.logout} 
            size={22} 
            color={isDarkMode ? Colors.dark.error : Colors.light.error}
          />
          <Text style={[
            styles.logoutText,
            { color: isDarkMode ? Colors.dark.error : Colors.light.error }
          ]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Bottom Sheet */}
      {renderBottomSheet(
        showLanguageModal,
        () => setShowLanguageModal(false),
        t('selectLanguage'),
        <View>
          {(Object.entries(languages) as [Language, string][]).map(([code, name]) => (
            <TouchableOpacity
              key={code}
              style={[
                styles.optionItem,
                { backgroundColor: isDarkMode ? Colors.dark.card : Colors.light.card },
                currentLanguage === code && { backgroundColor: isDarkMode ? Colors.dark.primary + '20' : Colors.light.primary + '20' }
              ]}
              onPress={() => {
                setLanguage(code);
                setShowLanguageModal(false);
              }}
            >
              <Text style={[
                styles.optionText,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text },
                currentLanguage === code && { color: isDarkMode ? Colors.dark.primary : Colors.light.primary }
              ]}>
                {name}
              </Text>
              {currentLanguage === code && (
                <MaterialIcons 
                  name="check"
                  size={24} 
                  color={isDarkMode ? Colors.dark.primary : Colors.light.primary} 
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Sync Frequency Bottom Sheet */}
      {renderBottomSheet(
        showSyncModal,
        () => setShowSyncModal(false),
        'Sync Frequency',
        <View>
          {syncOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionItem,
                { backgroundColor: isDarkMode ? Colors.dark.card : Colors.light.card },
                selectedSync === option && { backgroundColor: isDarkMode ? Colors.dark.primary + '20' : Colors.light.primary + '20' }
              ]}
              onPress={() => {
                setSelectedSync(option);
                setShowSyncModal(false);
              }}
            >
              <Text style={[
                styles.optionText,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text },
                selectedSync === option && { color: isDarkMode ? Colors.dark.primary : Colors.light.primary }
              ]}>
                {option}
              </Text>
              {selectedSync === option && (
                <MaterialIcons 
                  name="check"
                  size={24} 
                  color={isDarkMode ? Colors.dark.primary : Colors.light.primary} 
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* AI Mode Bottom Sheet */}
      {renderBottomSheet(
        showAIModal,
        () => setShowAIModal(false),
        'AI Mode',
        <View>
          {aiModeOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionItem,
                { backgroundColor: isDarkMode ? Colors.dark.card : Colors.light.card },
                selectedAIMode === option && { backgroundColor: isDarkMode ? Colors.dark.primary + '20' : Colors.light.primary + '20' }
              ]}
              onPress={() => {
                setSelectedAIMode(option);
                setShowAIModal(false);
              }}
            >
              <Text style={[
                styles.optionText,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text },
                selectedAIMode === option && { color: isDarkMode ? Colors.dark.primary : Colors.light.primary }
              ]}>
                {option}
              </Text>
              {selectedAIMode === option && (
                <MaterialIcons 
                  name="check"
                  size={24} 
                  color={isDarkMode ? Colors.dark.primary : Colors.light.primary} 
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Help Center Bottom Sheet */}
      {renderBottomSheet(
        showHelpCenter,
        () => setShowHelpCenter(false),
        'Help Center',
        <View>
          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <MaterialIcons 
              name={VALID_ICONS.phone}
              size={24} 
              color={isDarkMode ? Colors.dark.primary : Colors.light.primary} 
            />
            <Text style={[
              styles.contactText,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text }
            ]}>
              Call Center: +250786493820
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
            <MaterialIcons 
              name={VALID_ICONS.mail}
              size={24} 
              color={isDarkMode ? Colors.dark.primary : Colors.light.primary} 
            />
            <Text style={[
              styles.contactText,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text }
            ]}>
              Email: Lumion.corps@gmail.com
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* About Bottom Sheet */}
      {renderBottomSheet(
        showAbout,
        () => setShowAbout(false),
        'About',
        <View style={styles.aboutContent}>
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
        </View>
      )}

      {/* Email Preferences Bottom Sheet */}
      {renderBottomSheet(
        showEmailPreferences,
        () => setShowEmailPreferences(false),
        'Email Preferences',
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
      )}

      {/* Notification Settings Bottom Sheet */}
      {renderBottomSheet(
        showNotificationSettings,
        () => setShowNotificationSettings(false),
        'Notification Settings',
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
      )}
    </>
  );
} 