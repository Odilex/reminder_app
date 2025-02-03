import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useState, useContext } from 'react';
import Colors from '@/constants/Colors';
import { ThemeContext } from '../../context/ThemeContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const { isDarkMode } = useContext(ThemeContext);

  const handleResetPassword = () => {
    // Implement password reset logic here
    console.log('Reset password for:', email);
  };

  return (
    <View style={[
      styles.container,
      isDarkMode && { backgroundColor: Colors.dark.background }
    ]}>
      <Stack.Screen options={{ title: 'Forgot Password' }} />
      
      <Text style={[
        styles.title,
        isDarkMode && { color: Colors.dark.text }
      ]}>Reset Password</Text>
      <Text style={[
        styles.subtitle,
        isDarkMode && { color: Colors.dark.text }
      ]}>Enter your email address to reset your password</Text>
      
      <TextInput
        style={[
          styles.input,
          isDarkMode && {
            backgroundColor: Colors.dark.card,
            borderColor: Colors.dark.border,
            color: Colors.dark.text
          }
        ]}
        placeholder="Enter your email"
        placeholderTextColor={isDarkMode ? Colors.dark.text : Colors.gray}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: Colors.white,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 