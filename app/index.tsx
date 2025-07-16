import IntercomCallScreen from "@/screens/calling/call-screen";
import { View } from "react-native";

export default function Index() {
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
