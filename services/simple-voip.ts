import VoipPushNotification from 'react-native-voip-push-notification';

export const initSimpleVoIP = () => {
  console.log('🔥 Initializing VoIP Push...');
  
  // Регистрируемся для получения токена
  VoipPushNotification.registerVoipToken();

  // Получили токен
  VoipPushNotification.addEventListener('register', (token) => {
    console.log('📱 VoIP Token received:', token);
    console.log('📱 Token length:', token.length);
    // Пока просто логируем, потом отправим на бэк
  });

  // Получили push уведомление
  VoipPushNotification.addEventListener('notification', (notification) => {
    console.log('🔔 VoIP Push received:');
    console.log('🔔 Raw notification:', notification);
    console.log('🔔 Stringified:', JSON.stringify(notification, null, 2));
    console.log('🔔 Notification keys:', Object.keys(notification));
    // Пока просто логируем, никакого CallKeep
  });

  // События, которые были получены до инициализации
  VoipPushNotification.addEventListener('didLoadWithEvents', (events) => {
    console.log('📦 VoIP events loaded:', events);
    console.log('📦 Events count:', events?.length || 0);
    if (events && events.length > 0) {
      events.forEach((event, index) => {
        console.log(`📦 Event ${index}:`, JSON.stringify(event, null, 2));
      });
    }
  });

  console.log('✅ VoIP listeners registered');
};