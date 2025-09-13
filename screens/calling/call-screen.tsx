import { useApartmentData } from "@/queries/apartment";
import { pb } from "@/queries/client";
import { Building, Home, Unlock } from "lucide-react-native";
import React, { useState } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated";

export default function IntercomCallScreen() {
  const { data: apartmentData, isLoading, error } = useApartmentData();
  const [isDoorOpened, setIsDoorOpened] = useState(false);
  const [isDoorLoading, setIsDoorLoading] = useState(false); // Add loading state
  
  // Reanimated values
  const doorButtonScale = useSharedValue(1);

  const handleOpenDoor = async () => {
    if (isDoorLoading || isDoorOpened) return; // Prevent multiple calls
    
    doorButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 150 }),
      withTiming(1, { duration: 100 })
    );
    
    setIsDoorLoading(true); // Start loading
    
    try {
      const res = await pb.send('/open-door', {
        'method': 'POST'
      });
      console.log('res', res);
      
      setIsDoorOpened(true);
      
      // Reset door status after 3 seconds
      setTimeout(() => {
        setIsDoorOpened(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to open door:', error);
      // You might want to show an error message to the user
    } finally {
      setIsDoorLoading(false); // Stop loading
    }
  };

  // Animated styles
  const doorButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: doorButtonScale.value }],
    };
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-900 w-full justify-center items-center">
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <View className="bg-gray-800 rounded-3xl p-8 items-center w-full max-w-sm mx-4">
          <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mb-4 opacity-50">
            <Home size={32} color="white" />
          </View>
          <Text className="text-white text-xl font-semibold mb-2">Загрузка...</Text>
          <Text className="text-gray-400 text-center">
            Получение информации о квартире
          </Text>
        </View>
      </View>
    );
  }

  if (error || !apartmentData) {
    return (
      <View className="flex-1 bg-gray-900 w-full justify-center items-center">
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <View className="bg-gray-800 rounded-3xl p-8 items-center w-full max-w-sm mx-4">
          <View className="w-16 h-16 bg-red-500 rounded-full items-center justify-center mb-4">
            <Home size={32} color="white" />
          </View>
          <Text className="text-white text-xl font-semibold mb-2">Ошибка</Text>
          <Text className="text-gray-400 text-center">
            Не удалось загрузить информацию о квартире
          </Text>
        </View>
      </View>
    );
  }

  const { apartment, complex } = apartmentData;

  return (
    <View className="flex-1 bg-gray-900 w-full">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      
      {/* Background gradient effect */}
      <View className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-90" />


      {/* Main Content */}
      <View className="flex-1 justify-center items-center px-6">
        {/* Apartment Info Card */}
        <View className="bg-gray-800 rounded-3xl p-8 items-center w-full max-w-sm mb-8">
          <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-6">
            <Building size={40} color="white" />
          </View>
          
          <Text className="text-white text-2xl font-bold mb-2">
            Квартира {apartment.apartment_number}
          </Text>
          
          <Text className="text-gray-400 text-lg mb-4">
            {complex.name}
          </Text>
        </View>

        {/* Door Status Indicator */}
        {isDoorOpened && (
          <View className="mb-6">
            <View className="flex-row items-center bg-black bg-opacity-50 px-4 py-2 rounded-full">
              <View className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
              <Text className="text-orange-400 text-sm">Дверь открыта</Text>
            </View>
          </View>
        )}
        
        {/* Door Loading Indicator */}
        {isDoorLoading && (
          <View className="mb-6">
            <View className="flex-row items-center bg-black bg-opacity-50 px-4 py-2 rounded-full">
              <View className="w-3 h-3 bg-yellow-500 rounded-full mr-2 animate-pulse" />
              <Text className="text-yellow-400 text-sm">Открываем дверь...</Text>
            </View>
          </View>
        )}

        {/* Open Door Button */}
        <Animated.View style={doorButtonAnimatedStyle}>
          <TouchableOpacity
            className={`w-20 h-20 rounded-full items-center justify-center shadow-xl ${
              isDoorOpened ? "bg-orange-600" : isDoorLoading ? "bg-yellow-600" : "bg-blue-600"
            }`}
            onPress={handleOpenDoor}
            activeOpacity={0.8}
            disabled={isDoorOpened || isDoorLoading} // Disable during loading
            style={{
              shadowColor: isDoorOpened ? "#EA580C" : isDoorLoading ? "#D97706" : "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Unlock size={32} color="white" />
          </TouchableOpacity>
        </Animated.View>
        
        <Text className="text-gray-400 text-center mt-4 px-4">
          {isDoorOpened 
            ? "Дверь открыта на 3 секунды" 
            : "Нажмите, чтобы открыть дверь"
          }
        </Text>
      </View>

      {/* Footer */}
      <View className="pb-8 px-6">
        <Text className="text-gray-500 text-center text-sm">
          Система домофона активна
        </Text>
      </View>
    </View>
  );
}
