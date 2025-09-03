import { pb } from '@/queries/client';
import { VoipToken } from '@/types/types';
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

  const tokenFromPB = await pb.collection<VoipToken>("voip_tokens").getFullList({
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