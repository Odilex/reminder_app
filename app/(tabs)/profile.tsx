import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';

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

const languageOptions = ['English', 'Spanish', 'French', 'German', 'Chinese'];
const syncOptions = ['Every 15 minutes', 'Every hour', 'Every 6 hours', 'Daily'];
const aiModeOptions = ['Aggressive', 'Balanced', 'Conservative', 'Off'];

export default function ProfileScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [behaviorAnalysis, setBehaviorAnalysis] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
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
      setProfileImage(result.assets[0].uri);
    }
  };

  const getToggleForSetting = (title: string) => {
    switch (title) {
      case 'Theme':
        return (
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
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
      case 'Send Feedback':
        setShowFeedback(true);
        break;
      case 'About':
        setShowAbout(true);
        break;
    }
  };

  const handleCall = () => {
    Linking.openURL('tel:+250786493820');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:Lumion.corps@gmail.com');
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
                  <MaterialIcons name="check" size={24} color="#6366f1" />
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

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>L</Text>
            )}
          </View>
          <TouchableOpacity style={styles.editAvatarButton} onPress={handleTakePhoto}>
            <MaterialIcons name="camera-alt" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>Lumion</Text>
        <Text style={styles.email}>lumion.corps@gmail.com</Text>
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
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity 
              key={item.title}
              style={[
                styles.settingItem,
                itemIndex === section.items.length - 1 && styles.lastSettingItem,
              ]}
              onPress={() => handleSettingPress(item.title)}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons name={item.icon} size={24} color={isDarkMode ? Colors.white : Colors.text} />
                <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>{item.title}</Text>
              </View>
              {item.hasSwitch ? (
                getToggleForSetting(item.title)
              ) : (
                <MaterialIcons name="chevron-right" size={24} color={isDarkMode ? Colors.white : Colors.text} />
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
                <MaterialIcons name="close" size={24} color={isDarkMode ? Colors.white : Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.contactItem}>
              <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                <MaterialIcons name="phone" size={24} color={Colors.primary} />
                <Text style={[styles.contactText, isDarkMode && styles.darkText]}>Call Center: +250786493820</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contactItem}>
              <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                <MaterialIcons name="email" size={24} color={Colors.primary} />
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
                <MaterialIcons name="close" size={24} color={isDarkMode ? Colors.white : Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <MaterialIcons
                    name={star <= rating ? 'star' : 'star-border'}
                    size={32}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.feedbackInput, isDarkMode && styles.darkInput]}
              placeholder="Write your feedback here..."
              placeholderTextColor={isDarkMode ? Colors.gray : '#9ca3af'}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity 
              style={[styles.submitButton, !feedback && styles.disabledButton]}
              onPress={handleFeedbackSubmit}
              disabled={!feedback}
            >
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
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
                <MaterialIcons name="close" size={24} color={isDarkMode ? Colors.white : Colors.text} />
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
                  <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                  <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                    Smart Task Management
                  </Text>
                </View>
                
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                  <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                    Shared Reminders with Team Members
                  </Text>
                </View>
                
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                  <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                    Memory Feature for Past Activities
                  </Text>
                </View>
                
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                  <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                    Voice Search Capability
                  </Text>
                </View>
                
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
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
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  darkText: {
    color: Colors.white,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  lastSettingItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: Colors.text,
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
    backgroundColor: Colors.error,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
}); 