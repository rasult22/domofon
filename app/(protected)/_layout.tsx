import { useAuth } from "@/queries/auth";
import LoadingFullScreen from "@/components/LoadingFullScreen";
import { Redirect, Stack } from "expo-router";

export default function ProtectedLayout() {
  const { data: user, isLoading } = useAuth();

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