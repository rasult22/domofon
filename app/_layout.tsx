import { Stack } from "expo-router";
import { StatusBar, useColorScheme } from "react-native";
import '../global.css';

export default function RootLayout() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Stack screenOptions={{
        contentStyle: {
          backgroundColor: '#000'
        }
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
