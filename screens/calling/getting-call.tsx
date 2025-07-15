import { Home, Phone, PhoneOff } from "lucide-react-native";
import { useEffect } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export function GettingCall({
  handleAccept,
  handleDecline,
}: {
  handleDecline: () => void;
  handleAccept: () => void;
}) {
  const buttonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

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
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      false
    );

    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      false
    );
  });
  return (
    <View className="flex-1 bg-gray-900 w-full">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Background gradient effect */}
      <View className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-90" />

      {/* Status bar area */}
      <View className="pt-12 pb-4 px-6 z-10">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-sm opacity-75">Входящий звонок</Text>
          <Text className="text-white text-sm opacity-75">Домофон</Text>
        </View>
      </View>

      {/* Main call info */}
      <Animated.View
        layout={LinearTransition.duration(400)
          .springify()
          .damping(40)
          .stiffness(80)}
        className="flex-1 justify-center items-center px-8"
      >
        <View className="items-center mb-12">
          {/* Intercom icon with pulse animation */}
          <Animated.View
            className="w-32 h-32 bg-blue-600 rounded-full items-center justify-center mb-6 shadow-2xl"
            style={[
              {
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 10,
              },
              pulseAnimatedStyle,
            ]}
          >
            <Home size={64} color="white" />
          </Animated.View>

          <Text className="text-white text-3xl font-bold mb-2">Домофон</Text>
          <Text className="text-gray-400 mt-2 text-base text-center">
            Кто-то звонит в домофон
          </Text>
        </View>

        {/* Call status indicator */}
        <View className="flex-row items-center mb-8">
          <Animated.View
            className="w-3 h-3 bg-green-500 rounded-full mr-2"
            style={pulseAnimatedStyle}
          />
          <Text className="text-green-400 text-sm">Входящий звонок...</Text>
        </View>
      </Animated.View>

      {/* Call controls */}
      <View className="pb-12 px-8">
        {/* Quick actions hint */}
        <View className="pb-8 px-8">
          <View className="bg-gray-800 bg-opacity-80 rounded-2xl p-4">
            <Text className="text-gray-300 text-sm text-center">
              Примите звонок, чтобы поговорить с посетителем
            </Text>
          </View>
        </View>
        <View
          className="flex-row justify-center items-center"
          style={{ columnGap: 80 }}
        >
          {/* Decline button */}
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              className="w-20 h-20 bg-red-600 rounded-full items-center justify-center shadow-xl"
              onPress={handleDecline}
              activeOpacity={0.8}
              style={{
                shadowColor: "#DC2626",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <PhoneOff size={32} color="white" />
            </TouchableOpacity>
          </Animated.View>

          {/* Accept button */}
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              className="w-20 h-20 bg-green-600 rounded-full items-center justify-center shadow-xl"
              onPress={handleAccept}
              activeOpacity={0.8}
              style={{
                shadowColor: "#16A34A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Phone size={32} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
