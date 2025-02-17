import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import GoogleIcon from '@/components/GoogleIcon';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();

  const handleLogin = () => {
    // TODO: Implement login logic
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDarkMode ? Colors.dark.text : Colors.light.text }]}>
            Welcome Back!
          </Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? Colors.dark.text : Colors.light.text }]}>
            Sign in to continue
          </Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? Colors.dark.card : Colors.light.card }]}>
            <MaterialIcons 
              name="email" 
              size={20} 
              color={isDarkMode ? Colors.dark.primary : Colors.light.primary} 
            />
            <TextInput
              style={[styles.input, { color: isDarkMode ? Colors.dark.text : Colors.light.text }]}
              placeholder="Email"
              placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? Colors.dark.card : Colors.light.card }]}>
            <MaterialIcons 
              name="lock" 
              size={20} 
              color={isDarkMode ? Colors.dark.primary : Colors.light.primary} 
            />
            <TextInput
              style={[styles.input, { color: isDarkMode ? Colors.dark.text : Colors.light.text }]}
              placeholder="Password"
              placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color={isDarkMode ? Colors.dark.text : Colors.light.text}
              />
            </TouchableOpacity>
          </View>

          <Link href="/forgot-password" style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: isDarkMode ? Colors.dark.primary : Colors.light.primary }]}>
              Forgot Password?
            </Text>
          </Link>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: isDarkMode ? Colors.dark.primary : Colors.light.primary }]}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: isDarkMode ? Colors.dark.border : Colors.light.border }]} />
            <Text style={[styles.dividerText, { color: isDarkMode ? Colors.dark.text : Colors.light.text }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: isDarkMode ? Colors.dark.border : Colors.light.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: isDarkMode ? Colors.dark.card : Colors.light.card }]}
            onPress={() => {/* TODO: Implement Google Sign In */}}
          >
            <GoogleIcon size={24} />
            <Text style={[styles.googleButtonText, { color: isDarkMode ? Colors.dark.text : Colors.light.text }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDarkMode ? Colors.dark.text : Colors.light.text }]}>
            Don't have an account?{' '}
          </Text>
          <Link href="/signup" style={styles.signupLink}>
            <Text style={[styles.signupText, { color: isDarkMode ? Colors.dark.primary : Colors.light.primary }]}>
              Sign Up
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  googleButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
  },
  signupText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signupLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
}); 