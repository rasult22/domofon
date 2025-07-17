import { useAuth } from "@/queries/auth";
import IntercomCallScreen from "@/screens/calling/call-screen";
import { Text, View } from "react-native";

export default function Index() {
  const {data, isLoading} = useAuth()

  if (isLoading || !data) return <View className="flex-1 items-center justify-center">
    <Text className="text-white">Loading...</Text>
  </View>

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
