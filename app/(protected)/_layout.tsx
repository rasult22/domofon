import LoadingFullScreen from "@/components/LoadingFullScreen";
import { useAuth } from "@/queries/auth";
import {
  setupAndroidVoIP
} from "@/services/setup-android-voip";
import { setupCallKeep } from "@/services/setup-callkeep";
import { initSimpleVoIP } from "@/services/simple-voip";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from '@react-native-firebase/messaging';
import { useQuery } from "@tanstack/react-query";
import { Redirect, Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import RNNotificationCall from "react-native-full-screen-notification-incoming-call";

export default function ProtectedLayout() {
  const { data: user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📱 Foreground VoIP message:', remoteMessage);

      RNNotificationCall.displayNotification(remoteMessage.data?.call_uuid as string, null, 30000, {
        channelId: "com.abc.incomingcall",
        channelName: "Incoming video call",
        notificationIcon: "ic_launcher", // mipmap
        notificationTitle: "Домофон",
        notificationBody: "Кто-то звонит в домофон...",
        answerText: "Accept",
        declineText: "Decline",
        notificationColor: "colorAccent",
        isVideo: false,
        notificationSound: undefined, // raw
      });
      RNNotificationCall.addEventListener("answer", (answerPayload) => {
        router.replace(`/calling?call_id=${remoteMessage.data?.call_id}&call_uuid=${remoteMessage.data?.call_uuid}`)
      })
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!isLoading && user?.id && Platform.OS === "ios") {
      initSimpleVoIP();
      setupCallKeep();
    }
    if (Platform.OS === "android" && !isLoading && user?.id) {
      setupCallKeep();
      setupAndroidVoIP();
    }
  }, [user, isLoading]);

  const { isLoading: notificationIsLoading, data: notification } = useQuery({
    queryKey: ["initialNotification"],
    queryFn: async () => {
      const callInfo = await AsyncStorage.getItem("call_info_android");
      if (callInfo) {
        const callInfoJson = JSON.parse(callInfo);
        console.log(callInfoJson, "callInfo");
        router.push(
          `/calling?call_id=${callInfoJson.call_id}&call_uuid=${callInfoJson.call_uuid}`
        );
        return callInfoJson as {
          call_id: string;
          call_uuid: string;
          completed: boolean;
        };
      } else {
        console.log("there is no callINfo");
      }
      return null;
    },
  });

  if (isLoading || notificationIsLoading) {
    return <LoadingFullScreen />;
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "#000",
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="apartment-setup" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: true, headerTitle: "Профиль", headerTintColor: '#000' }} />
    </Stack>
  );
}
