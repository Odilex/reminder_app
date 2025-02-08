import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  type User,
  type Auth,
  type AuthError,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
} from 'firebase/auth';
import { Alert, Platform } from 'react-native';
import { useLanguage } from './LanguageContext';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { auth } from '../config/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isOnline: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  updateUserEmail: (newEmail: string, password: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  isEmailVerified: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const { t } = useLanguage();

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? true);
      if (!state.isConnected) {
        Alert.alert(t('error'), t('noInternetConnection'));
      }
    });

    return () => unsubscribe();
  }, [t]);

  const validateServerResponse = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 5000);
      });
      
      // Check if we can connect to Firebase Auth
      const response = await Promise.race([
        fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            returnSecureToken: true
          })
        }),
        timeoutPromise
      ]) as Response;
      
      return response.status !== 503 && response.status !== 429;
    } catch (error) {
      console.error('Server validation error:', error);
      return false; // Return false on error to show proper error message
    }
  };

  const handleAuthError = async (error: AuthError) => {
    let errorMessage = t('error');
    
    // Check server and network status first
    if (!isOnline) {
      errorMessage = t('noInternetConnection');
      Alert.alert(t('error'), errorMessage);
      throw new Error(errorMessage);
    }

    const isServerAvailable = await validateServerResponse();
    if (!isServerAvailable) {
      errorMessage = t('serverError');
      Alert.alert(t('error'), errorMessage);
      throw new Error(errorMessage);
    }

    // Handle specific Firebase auth errors
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = t('userNotFound');
        break;
      case 'auth/wrong-password':
        errorMessage = t('wrongPassword');
        break;
      case 'auth/email-already-in-use':
        errorMessage = t('emailAlreadyInUse');
        break;
      case 'auth/weak-password':
        errorMessage = t('weakPassword');
        break;
      case 'auth/invalid-email':
        errorMessage = t('invalidEmail');
        break;
      case 'auth/requires-recent-login':
        errorMessage = t('recentLoginRequired');
        break;
      case 'auth/network-request-failed':
        errorMessage = t('networkError');
        break;
      case 'auth/too-many-requests':
        errorMessage = t('tooManyRequests');
        break;
      case 'auth/operation-not-allowed':
        errorMessage = t('operationNotAllowed');
        break;
      default:
        errorMessage = error.message;
    }
    
    Alert.alert(t('error'), errorMessage);
    throw error;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
          };
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        } else {
          await AsyncStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isOnline) {
      Alert.alert(t('error'), t('noInternetConnection'));
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      await handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!isOnline) {
      Alert.alert(t('error'), t('noInternetConnection'));
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        await updateProfile(userCredential.user, { 
          displayName: displayName || email.split('@')[0]
        });
        
        await sendEmailVerification(userCredential.user);
        
        Alert.alert(
          t('success'),
          t('verificationEmailSent'),
          [{ text: t('ok') }]
        );
      }
    } catch (error) {
      await handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!isOnline) {
      Alert.alert(t('error'), t('noInternetConnection'));
      return;
    }

    try {
      setLoading(true);
      await signOut(auth);
      await AsyncStorage.clear();
    } catch (error) {
      await handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isOnline) {
      Alert.alert(t('error'), t('noInternetConnection'));
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        t('success'),
        t('resetPasswordEmailSent'),
        [{ text: t('ok') }]
      );
    } catch (error) {
      await handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (displayName: string) => {
    if (!user) throw new Error('No user logged in');
    if (!isOnline) {
      Alert.alert(t('error'), t('noInternetConnection'));
      return;
    }

    try {
      setLoading(true);
      await updateProfile(user, { displayName });
      Alert.alert(
        t('success'),
        t('profileUpdateSuccess'),
        [{ text: t('ok') }]
      );
    } catch (error) {
      await handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const updateUserEmail = async (newEmail: string, password: string) => {
    if (!user) throw new Error('No user logged in');
    if (!isOnline) {
      Alert.alert(t('error'), t('noInternetConnection'));
      return;
    }

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);
      await sendEmailVerification(user);
      Alert.alert(
        t('success'),
        t('emailUpdateSuccess'),
        [{ text: t('ok') }]
      );
    } catch (error) {
      await handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('No user logged in');
    if (!isOnline) {
      Alert.alert(t('error'), t('noInternetConnection'));
      return;
    }

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert(
        t('success'),
        t('passwordUpdateSuccess'),
        [{ text: t('ok') }]
      );
    } catch (error) {
      await handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!user) throw new Error('No user logged in');
    if (!isOnline) {
      Alert.alert(t('error'), t('noInternetConnection'));
      return;
    }

    try {
      setLoading(true);
      await sendEmailVerification(user);
      Alert.alert(
        t('success'),
        t('verificationEmailSent'),
        [{ text: t('ok') }]
      );
    } catch (error) {
      await handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOnline,
        signIn,
        signUp,
        logout,
        resetPassword,
        updateUserProfile,
        updateUserEmail,
        updateUserPassword,
        resendVerificationEmail,
        isEmailVerified: user?.emailVerified ?? false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 