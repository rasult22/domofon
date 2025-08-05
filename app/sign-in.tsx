import AppleIcon from "@/components/AppleIcon";
import { useAppleSignIn } from "@/queries/auth";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Alert, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export default function SignInScreen() {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const appleSignInMutation = useAppleSignIn();

  // Animated styles
  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  useEffect(() => {
    // Gentle pulse animation for the logo
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.ease }),
        withTiming(1, { duration: 2000, easing: Easing.ease })
      ),
      -1,
      false
    );

    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000, easing: Easing.ease }),
        withTiming(1, { duration: 2000, easing: Easing.ease })
      ),
      -1,
      false
    );
  }, []);

  const handleAppleSignIn = async () => {
    try {
      // Button press animation
      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );

      const credential = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      // Handle successful sign in

      await appleSignInMutation.mutateAsync(credential);

      // Navigate to protected area
      router.replace('/(protected)');
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        // User canceled the sign-in flow
        console.log("User canceled Apple Sign In");
      } else {
        // Other error occurred
        console.error("Apple Sign In Error:", error);
        Alert.alert(
          "Ошибка входа",
          "Не удалось войти через Apple. Попробуйте еще раз.",
          [{ text: "OK" }]
        );
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-900 w-full">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Background gradient effect */}
      <View className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-90" />

      {/* Main content */}
      <View className="flex-1 justify-center items-center px-8">
        {/* Welcome message */}
        <View className="mb-12 px-4">
          <Text className="text-white text-xl font-semibold text-center mb-3">
            Добро пожаловать
          </Text>
          <Text className="text-gray-400 text-base text-center leading-6">
            Войдите в систему, чтобы управлять домофоном и принимать звонки
          </Text>
        </View>

        {/* Sign in button */}
        <Animated.View style={buttonAnimatedStyle} className="w-full max-w-sm">
          <TouchableOpacity
            className="w-full max-w-sm h-14 bg-black rounded-xl flex-row items-center justify-center border border-gray-700"
            onPress={handleAppleSignIn}
            disabled={appleSignInMutation.isPending}
          >
            <AppleIcon />
            <Text className="text-white text-base font-semibold ml-3">
              Войти через Apple
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Alternative sign in hint */}
        <View className="mt-8 px-4">
          <Text className="text-gray-500 text-sm text-center">
            Используйте Apple ID для быстрого и безопасного входа
          </Text>
        </View>

        {/* Loading state */}
        {appleSignInMutation.isPending && (
          <View className="mt-4">
            <Text className="text-blue-400 text-sm text-center">
              Выполняется вход...
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View className="pb-12 px-8">
        <View className="bg-gray-800 bg-opacity-60 rounded-2xl p-4">
          <Text className="text-gray-400 text-xs text-center leading-5">
            Ваши данные защищены и используются только для аутентификации
          </Text>
        </View>
      </View>
    </View>
  );
}
