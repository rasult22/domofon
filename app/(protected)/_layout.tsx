import LoadingFullScreen from "@/components/LoadingFullScreen";
import { useAuth } from "@/queries/auth";
import { setupAndroidVoIP, setupVoIPListeners } from "@/services/setup-android-voip";
import { setupCallKeep } from "@/services/setup-callkeep";
import { initSimpleVoIP } from "@/services/simple-voip";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { Redirect, Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function ProtectedLayout() {
  const { data: user, isLoading } = useAuth();
  const router = useRouter()
  useEffect(() => {
    if (!isLoading && user?.id && Platform.OS === 'ios') {
      initSimpleVoIP();
    }
  }, [user, isLoading])
  useQuery({
    queryKey: ['initVoip'],
    queryFn: async () => {
      if (Platform.OS === 'android') {
        await setupCallKeep()
        await setupVoIPListeners()
        await setupAndroidVoIP()
        return true
      }
      return false
    }
  })
  const {isLoading: notificationIsLoading, data: notification} = useQuery({
    queryKey: ['initialNotification'],
    queryFn: async ( ) => {
      const callInfo = await AsyncStorage.getItem('call_info_android')
      if (callInfo) {
        const callInfoJson = JSON.parse(callInfo)
        console.log(callInfoJson, 'callInfo')
        router.push(`/calling?call_id=${callInfoJson.call_id}&call_uuid=${callInfoJson.call_uuid}`)
        return callInfoJson as {
          call_id: string,
          call_uuid: string,
          completed: boolean
        }
      } else {
        console.log('there is no callINfo')
      }
      return null
    }
  })

  if (isLoading || notificationIsLoading) {
    return <LoadingFullScreen />;
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  // if (notification) {
  //   return <Redirect href={`/?call_id=${notification.call_id}&call_uuid=${notification.call_uuid}`} />
  // }

  return (
    <Stack screenOptions={{
      contentStyle: {
        backgroundColor: '#000'
      }
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="apartment-setup" options={{ headerShown: false }} />
    </Stack>
  );
}