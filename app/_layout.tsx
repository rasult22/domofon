import messaging from '@react-native-firebase/messaging';
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar, useColorScheme } from "react-native";
import EventSource from "react-native-sse";
import queryClient from '.././queries/client';
import '../global.css';

// ✅ BACKGROUND MESSAGE HANDLER - MUST BE AT MODULE LEVEL
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

export default function RootLayout() {
  const isDarkMode = useColorScheme() === "dark";

  if (!global.EventSource) {
    (EventSource as any).CONNECTING = 0;
    (EventSource as any).OPEN = 1;
    (EventSource as any).CLOSED = 2;
    global.EventSource = EventSource as typeof global.EventSource;
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <Stack screenOptions={{
          contentStyle: {
            backgroundColor: '#000'
          }
        }}>
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </>
  );
}
