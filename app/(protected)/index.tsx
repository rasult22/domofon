import LoadingFullScreen from "@/components/LoadingFullScreen";
import { useUserApartment } from "@/queries/auth";
import IntercomCallScreen from "@/screens/calling/call-screen";
import { Redirect } from "expo-router";
import { View } from "react-native";

export default function Index() {
  const { data: apartment, isLoading } = useUserApartment();

  if (isLoading) {
    return <LoadingFullScreen />;
  }

  // Если квартира не привязана, перенаправляем на страницу настройки
  if (!apartment) {
    return <Redirect href="/(protected)/apartment-setup" />;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <IntercomCallScreen />
    </View>
  );
}