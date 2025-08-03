import RNCallKeep from 'react-native-callkeep';
import uuid from 'react-native-uuid';
import VoipPushNotification from 'react-native-voip-push-notification';
export const initSimpleVoIP = () => {
  console.log('🔥 Initializing VoIP Push...');
  
  // Получили токен (новая регистрация)
  VoipPushNotification.addEventListener('register', (token) => {
    console.log('📱 VoIP Token received (new):', token);
    console.log('📱 Token length:', token.length);
    // Отправляем токен на бэк
  });

  // Получили push уведомление
  VoipPushNotification.addEventListener('notification', (notification) => {
    console.log('🔔 VoIP Push received:');
    console.log('🔔 Raw notification:', notification);
    console.log('🔔 Stringified:', JSON.stringify(notification, null, 2));
    console.log('🔔 Notification keys:', Object.keys(notification));
    
    // 🚨 КРИТИЧНО: Вызываем CallKeep НЕМЕДЛЕННО
    const uuid2 = notification.uuid || `call-${Date.now()}`;
    const callerName = notification.callerName || 'Домофон';
    const handle = notification.handle || 'Входящий звонок';
    
    console.log('📞 Calling RNCallKeep.displayIncomingCall with:', { uuid, handle, callerName });
    
    try {
      RNCallKeep.displayIncomingCall(
        uuid.v4(),
        handle,
        callerName,
        'generic',
        false // hasVideo
      );
      console.log('✅ CallKeep.displayIncomingCall успешно вызван');
    } catch (error) {
      console.error('❌ Ошибка при вызове CallKeep:', error);
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
      });
    }
  });

  // Регистрируемся для получения токена (может вернуть кэшированный)
  VoipPushNotification.registerVoipToken();
  
  console.log('✅ VoIP listeners registered');
};