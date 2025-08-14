import { AppleRequestResponse } from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "./client";

const AUTH_STORAGE_KEY = 'domofon_auth';

export const useAuth = () => useQuery({
  queryKey: ['auth'],
  queryFn: async () => {
    return checkAuth()
  },
  retry: false,
});

export const checkAuth = async  () => {
  try {
      // Check if PocketBase has valid auth
      if (pb.authStore.isValid) {
        return pb.authStore.record;
      }
      
      // Try to get stored auth data
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      
      // debugging
      // setTimeout(() => {
      //   AsyncStorage.removeItem(AUTH_STORAGE_KEY)
      // }, 4000)
      
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        pb.authStore.save(authData.token, authData.record);
        
        try {
          // Try to refresh the token
          await pb.collection('users').authRefresh();
          
          // Update stored auth with new token
          await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
            token: pb.authStore.token,
            record: pb.authStore.record
          }));
          
          return pb.authStore.record;
        } catch (refreshError) {
          console.error('Auth refresh failed:', refreshError);
          
          // If refresh fails (401), clear invalid auth data
          pb.authStore.clear();
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Auth error:', error);
      return null;
    }
}

// Новый хук для проверки привязанной квартиры
export const useUserApartment = () => useQuery({
  queryKey: ['user-apartment'],
  queryFn: async () => {
    try {
      if (!pb.authStore.isValid) {
        return null;
      }

      // TODO: Заменить на реальный запрос к коллекции user_apartments
      const apartment = await pb.collection('apartments').getFirstListItem(
        `user="${pb.authStore.record?.id}"`
      );
      
      // Временная заглушка - возвращаем null, чтобы всегда показывать страницу настройки
      return apartment;
    } catch (error) {
      console.error('User apartment error:', error);
      return null;
    }
  },
  enabled: !!pb.authStore.isValid,
  retry: false,
});

// Хук для привязки квартиры
export const useSetupApartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (apartmentCode: string) => {
      try {
        if (!pb.authStore.isValid) {
          throw new Error('User not authenticated');
        }

        let apartmentRecord = await pb.collection('apartments').getFirstListItem(
          `apartment_code = "${apartmentCode}"`
        );
        if (!apartmentRecord) {
          throw new Error('Apartment not found');
        }

        // Проверка, что квартира не привязана к другому пользователю
        if (apartmentRecord.user_id) {
          throw new Error('Apartment already linked to another user');
        }

        // Привязываем квартиру к текущему пользователю
        apartmentRecord = await pb.collection('apartments').update(apartmentRecord.id, {
          user: pb.authStore.record?.id,
        });
        
        return apartmentRecord;
      } catch (error) {
        console.error('Setup apartment error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user-apartment'], data);
    },
  });
};

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
          `https://rasult22.pockethost.io/api/oauth2-redirect`
        );
        
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
      queryClient.setQueryData(['user-apartment'], null);
    },
  });
};