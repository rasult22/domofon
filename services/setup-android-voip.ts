import { pb } from '@/queries/client';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
const requestPermission = async () => {
  const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  if (granted) {
    console.log('permission granted')
  } else {
    console.log('permission denied')
  }
}
const getToken = async () => {
  try {
    const token = await messaging().getToken()
    console.log('FCM token:', token)
    return token
  } catch (err) {
    console.log('Error getting FCM token:', err)
  }
  
}

export const setupAndroidVoIP = async () => {
  await requestPermission()
  const token = await getToken();

  const tokenFromPB = await pb.collection("voip_tokens").getFullList({
    filter: `token='${token}'`,
  });
    console.log(tokenFromPB, 'tokenFrom PB')
    if (!tokenFromPB.length) {
      pb.collection("voip_tokens").create({
        type: Platform.OS,
        token,
        user_id: pb.authStore.record?.id,
      });
    }
}
// Add VoIP message listeners
export const setupVoIPListeners = async () => {
  // Initialize CallKeep first
  messaging().onMessage(async remoteMessage => {
    console.log('📱 Foreground VoIP message:', remoteMessage);
    
    if (remoteMessage.data?.call_type === 'voip') {
      console.log('voip')
    }
  });
  
  // Background messages are already handled in _layout.tsx
  // but we need to process them for VoIP
};


function testPush() {
    // FCM v1 API - requires OAuth 2.0 access token
  const PROJECT_ID = 'domofon-cce27'; // Your Firebase project ID
  const ACCESS_TOKEN = 'ya29.c.c0ASRK0GZZS1OlfvYn2L5FmDxYK0ZZauWyTqGa4YLuv7aLQv9KapwcIrlEv5v6RPQGAgksnjKKrv3PkKOiEv1Cv83lwIWA-2dLz6u_si0CKIB0WGpGUp0BCsbj8hMzrmV3oTX_ZnAHPlNEh756KdVpHAbWACizrTeAPjzU9TVU3qEulsn3-7T3oNaTY7PHuS3OZBqR_tCqg8ZAbk0yFVTcMH6cbZkIA3-mLCxxmD7eL22R3U-Lz_UzIv7bP49hnpNhfllXIh21LShRFNMjnt02sm6fes4pP75Wh_FaVcXBvZNtpX4on42XBrjlYEqXoTmYTAgIO8VFpvdFVvi4mRHBfZ7_W94ixdFpSIMhXoXdFXvQPZIB7VO_8ZpWG385DMffBa3sm1tfZ1rMRYMI_-gvJfFBiF8gSqo5dB17RFtnfIOz7Qk6owIFq6j7Iz-MecqVdexf0de9-7xSXOwuw3clmrvpf8ZhmuS6aS0FrWIls8MwakgSs1lSzcM_vMJZSa46_gxfq21JWBxwSrM8BmYIhXq2b4YSxyU90zJZwS_Zeq0wUlaJ75a9dh76-F9XbcFtZsoct_i-Vz2FRqcRF1se2OJu5zwnoQhYd3ZUoaR507X7QF3okvJBxdoyygVs4wfF99ZWV_Zv207YgOsxiUgWtSaeU4g77U3haOpijkbn_Ruleiidln_XwZhQjrxy4OWqWJdyM33kSbbbruIFd7iyQ5QciBv4aabISjJagS-UtwQcMeUvlvatjYx0Zsnk_pVIrcy0xulFQ9uvFrVy5gV-oezdX5XQ9qajWyRRxFuZ2WadoJg-6J3o_jm_jWo4fysocB-Ru825cluzbWjdQX4jyM63VXfecWuOZuRWYbzzZ3M4qJ2lglioM1xgk0n0OoxpujhwIghuzqMgM2z3wBtMJq7q3Je4qVjzSUVcJYfdq8aclze7rXRed9QU-hI47R9B1Owr1or6WYhYSB7sZQa_j2qqlQkhiV70fQVVS41z_ZZzbm-iUb6vR4X'; // Get this from Google OAuth

  
  // Send VoIP notification with FCM v1
  fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: {
        token: 'db0vgyexSPW_ikFXxryWhF:APA91bHw16PrFrv5Yaw4yKbejAb3BU98fDsmCoGHtNbL_QbvKP74bQzFIDmUSGmaJimptuU7CYH_VTDdbvdqtLU08actq1JKMrAitg9lpLPoXG7GlUmUsEg',
        notification: {
          title: 'Incoming Call',
          body: 'John Doe is calling...'
        },
        data: {
          call_type: 'voip',
          call_id: 'call_123',
          caller_id: 'user456',
          caller_name: 'John Doe',
          has_video: 'true'
        },
        android: {
          priority: 'high',
          ttl: '30s'
        }
      }
    })
  })
  .then(response => response.json())
  .then(data => console.log('FCM Response:', data))
  .catch(error => console.error('FCM Error:', error));
}