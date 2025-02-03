import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useState } from 'react';

export default function EditProfileScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user, updateProfileImage } = useUser();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');

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

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      updateProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    router.back();
  };

  return (
    <ScrollView 
      style={[
        styles.container,
        isDarkMode && { backgroundColor: Colors.dark.background }
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons 
            name="arrow-back" 
            size={24} 
            color={isDarkMode ? Colors.white : Colors.black} 
          />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          isDarkMode && { color: Colors.white }
        ]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileImageSection}>
        <View style={styles.imageContainer}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.placeholderText}>{name.charAt(0) || 'U'}</Text>
            </View>
          )}
          <View style={styles.imageButtons}>
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={handleTakePhoto}
            >
              <MaterialIcons name="camera-alt" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={handlePickImage}
            >
              <MaterialIcons name="photo-library" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[
            styles.label,
            isDarkMode && { color: Colors.white }
          ]}>Name</Text>
          <TextInput
            style={[
              styles.input,
              isDarkMode && styles.darkInput
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={Colors.gray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[
            styles.label,
            isDarkMode && { color: Colors.white }
          ]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              isDarkMode && styles.darkInput
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={Colors.gray}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[
            styles.label,
            isDarkMode && { color: Colors.white }
          ]}>Phone</Text>
          <TextInput
            style={[
              styles.input,
              isDarkMode && styles.darkInput
            ]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            placeholderTextColor={Colors.gray}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[
            styles.label,
            isDarkMode && { color: Colors.white }
          ]}>Bio</Text>
          <TextInput
            style={[
              styles.bioInput,
              isDarkMode && styles.darkInput
            ]}
            value={bio}
            onChangeText={setBio}
            placeholder="Write something about yourself"
            placeholderTextColor={Colors.gray}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  saveButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  profileImageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    color: Colors.white,
    fontWeight: '600',
  },
  imageButtons: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -15,
    right: -15,
    gap: 8,
  },
  imageButton: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text,
  },
  darkInput: {
    backgroundColor: Colors.dark.card,
    borderColor: Colors.dark.border,
    color: Colors.white,
  },
  bioInput: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text,
    height: 120,
    textAlignVertical: 'top',
  },
}); 