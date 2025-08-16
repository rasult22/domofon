import LoadingFullScreen from "@/components/LoadingFullScreen";
import { useAuth } from "@/queries/auth";
import { initSimpleVoIP } from "@/services/simple-voip";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";

export default function ProtectedLayout() {
  const { data: user, isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading && user?.id) {
      initSimpleVoIP();
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