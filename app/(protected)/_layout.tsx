import LoadingFullScreen from "@/components/LoadingFullScreen";
import { useAuth } from "@/queries/auth";
import { setupCallKeep } from "@/services/setup-callkeep";
import { initSimpleVoIP } from "@/services/simple-voip";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function ProtectedLayout() {
  const { data: user, isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading && user?.id && Platform.OS === 'ios') {
      initSimpleVoIP();
    }
    if (Platform.OS === 'android') {
      setupCallKeep()
    }
  }, [user, isLoading])

  if (isLoading) {
    return <LoadingFullScreen />;
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

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