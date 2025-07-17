import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar, useColorScheme } from "react-native";
import EventSource from "react-native-sse";
import queryClient from '.././queries/client';
import '../global.css';

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
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
    </>
  );
}
