import { AppleRequestResponse } from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "./client";

const AUTH_STORAGE_KEY = 'domofon_auth';

export const useAuth = () => useQuery({
  queryKey: ['auth'],
  queryFn: async () => {
    try {
      // Check if PocketBase has valid auth
      if (pb.authStore.isValid) {
        return pb.authStore.record;
      }
      
      // Try to get stored auth data
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        pb.authStore.save(authData.token, authData.record);
        return authData.record;
      }
      
      return null;
    } catch (error) {
      console.error('Auth error:', error);
      return null;
    }
  },
  retry: false,
});

export const useAppleSignIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appleCredential: AppleRequestResponse) => {
      try {
        // Use PocketBase Apple OAuth
        const authData = await pb.collection('users').authWithOAuth2Code(
          'apple',
          appleCredential.authorizationCode || '',
          appleCredential.identityToken || '',
          `${pb.baseURL}/api/oauth2-redirect`
        );
        console.log(authData)
        
        // Store auth data
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          token: pb.authStore.token,
          record: pb.authStore.record
        }));
        
        return authData.record;
      } catch (error) {
        console.error('Apple sign in error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth'], data);
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      pb.authStore.clear();
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth'], null);
    },
  });
};