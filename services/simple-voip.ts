import { pb } from '@/queries/client';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import VoipPushNotification from 'react-native-voip-push-notification';

export const initSimpleVoIP = () => {
  console.log('🔥 Initializing VoIP Push...');
  
  // Получили токен (новая регистрация)
  VoipPushNotification.addEventListener('register', async (token) => {
    console.log('📱 VoIP Token received (new):', token);
    console.log('📱 Token length:', token.length);
    console.log('📱 auth store is valid:', pb.authStore.isValid);
    const tokenFromPB = await pb.collection('voip_tokens').getFullList({
      filter: `token='${token}'`
    })
    if (!tokenFromPB.length) {
      pb.collection('voip_tokens').create({
        type: Platform.OS,
        token,
        user_id: pb.authStore.record?.id
      })
    }
  });

  // Получили push уведомление
  VoipPushNotification.addEventListener('notification', (notification) => {
    console.log('🔔 VoIP Push received:');
    console.log('🔔 Raw notification:', notification);
    console.log('🔔 Stringified:', JSON.stringify(notification, null, 2));
    console.log('🔔 Notification keys:', Object.keys(notification));
    const notificationData = notification as any
    if (notificationData.aps) {
      const payload = notificationData.aps.payload
      console.log('notification payload',payload)
      router.push(`/calling?uuid=${payload.uuid}&call_id=${payload.call_id}`)
    }
  });

  // События, которые были получены до инициализации (включая кэшированный токен)
  VoipPushNotification.addEventListener('didLoadWithEvents', (events) => {
    console.log('📦 VoIP events loaded:', events);
    console.log('📦 Events count:', events?.length || 0);
    if (events && events.length > 0) {
      events.forEach((event, index) => {
        console.log(`📦 Event ${index}:`, JSON.stringify(event, null, 2));
        // Обрабатываем кэшированный токен
        if (event.name === 'RNVoipPushRemoteNotificationsRegisteredEvent' && event.data) {
          console.log('📱 VoIP Token received (cached):', event.data);
          console.log('📱 Cached token length:', event.data.length);
          // Отправляем кэшированный токен на бэк
        }
        if (event.name === 'RNVoipPushRemoteNotificationReceivedEvent' && (event.data as any).aps) {
          const payload = (event.data as { aps:{ payload: { uuid: string, call_id: string } }}).aps.payload
          router.push(`/calling?uuid=${payload.uuid}&call_id=${payload.call_id}`)
        }
      });
    }
  });

  // Регистрируемся для получения токена (может вернуть кэшированный)
  VoipPushNotification.registerVoipToken();
  
  console.log('✅ VoIP listeners registered');
};