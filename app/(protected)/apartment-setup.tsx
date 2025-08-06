import { useSetupApartment } from "@/queries/auth";
import { router } from "expo-router";
import { Home, Key } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export default function ApartmentSetupScreen() {
  const [apartmentCode, setApartmentCode] = useState("");
  const setupApartmentMutation = useSetupApartment();
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handleSubmit = async () => {
    if (!apartmentCode.trim()) {
      Alert.alert("Ошибка", "Пожалуйста, введите код квартиры");
      return;
    }

    // Проверяем формат UUID (примерно)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(apartmentCode.trim())) {
      Alert.alert(
        "Неверный формат",
        "Код квартиры должен быть в формате UUID (например: 123e4567-e89b-12d3-a456-426614174000)"
      );
      return;
    }

    try {
      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );

      await setupApartmentMutation.mutateAsync(apartmentCode.trim());

      Alert.alert(
        "Успешно!",
        "Квартира успешно привязана к вашему аккаунту",
        [
          {
            text: "Продолжить",
            onPress: () => router.replace("/(protected)"),
          },
        ]
      );
    } catch (error) {
      console.error("Apartment setup error:", error);
      Alert.alert(
        "Ошибка",
        "Не удалось привязать квартиру. Проверьте код и попробуйте еще раз."
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-900 w-full">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Background gradient effect */}
      <View className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-90" />

      {/* Main content */}
      <View className="flex-1 justify-center items-center px-8">
        {/* Icon */}
        <View className="mb-8">
          <View className="w-20 h-20 bg-blue-600 bg-opacity-20 rounded-full items-center justify-center">
            <Home size={40} color="#3B82F6" />
          </View>
        </View>

        {/* Title and description */}
        <View className="mb-12 px-4">
          <Text className="text-white text-2xl font-bold text-center mb-4">
            Настройка квартиры
          </Text>
          <Text className="text-gray-400 text-base text-center leading-6">
            Введите код вашей квартиры, чтобы начать принимать звонки с домофона
          </Text>
        </View>

        {/* Input field */}
        <View className="w-full max-w-sm mb-8">
          <View className="mb-3">
            <Text className="text-gray-300 text-sm font-medium mb-2">
              Код квартиры
            </Text>
            <View className="relative">
              <TextInput
                className="w-full h-14 bg-gray-800 border border-gray-700 rounded-xl px-4 pr-12 text-white text-base"
                placeholder="123e4567-e89b-12d3-a456-426614174000"
                placeholderTextColor="#6B7280"
                value={apartmentCode}
                onChangeText={setApartmentCode}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!setupApartmentMutation.isPending}
              />
              <View className="absolute right-4 top-4">
                <Key size={20} color="#6B7280" />
              </View>
            </View>
          </View>
          <Text className="text-gray-500 text-xs leading-4">
            Код предоставляется управляющей компанией при регистрации в системе
          </Text>
        </View>

        {/* Submit button */}
        <Animated.View style={buttonAnimatedStyle} className="w-full max-w-sm">
          <TouchableOpacity
            className={`w-full h-14 rounded-xl flex-row items-center justify-center ${
              setupApartmentMutation.isPending
                ? "bg-gray-700 border border-gray-600"
                : "bg-blue-600 border border-blue-500"
            }`}
            onPress={handleSubmit}
            disabled={setupApartmentMutation.isPending}
          >
            <Text
              className={`text-base font-semibold ${
                setupApartmentMutation.isPending ? "text-gray-400" : "text-white"
              }`}
            >
              {setupApartmentMutation.isPending ? "Проверяем код..." : "Привязать квартиру"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Help text */}
        <View className="mt-8 px-4">
          <Text className="text-gray-500 text-sm text-center leading-5">
            Если у вас нет кода квартиры, обратитесь к управляющей компании или
            администратору ЖК
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="pb-12 px-8">
        <View className="bg-gray-800 bg-opacity-60 rounded-2xl p-4">
          <Text className="text-gray-400 text-xs text-center leading-5">
            Код квартиры используется для идентификации вашего жилья в системе
            домофона
          </Text>
        </View>
      </View>
    </View>
  );
}