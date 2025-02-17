import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Replace with your Google OAuth client ID
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_GOOGLE_ANDROID_CLIENT_ID';
const GOOGLE_IOS_CLIENT_ID = 'YOUR_GOOGLE_IOS_CLIENT_ID';

// Google OAuth configuration
const discovery: {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revocationEndpoint: string;
} = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: Platform.select({
        ios: GOOGLE_IOS_CLIENT_ID,
        android: GOOGLE_ANDROID_CLIENT_ID,
        default: GOOGLE_CLIENT_ID,
      }) ?? GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: makeRedirectUri({
        scheme: 'your.app.scheme'
      }),
    },
    discovery
  );

  return {
    request,
    response,
    promptAsync,
  };
};

export const signInWithApple = async (): Promise<AppleAuthentication.AppleAuthenticationCredential | null> => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    return credential;
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ERR_CANCELED') {
      // User canceled Apple Sign in
      return null;
    }
    throw error;
  }
}; 