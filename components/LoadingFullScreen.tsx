import { View, Text } from "react-native";

export default function LoadingFullScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-900">
      <Text className="text-white text-lg">Загрузка...</Text>
    </View>
  );
}