import { useApartmentData } from "@/queries/apartment";
import { pb } from "@/queries/client";
import { useGates } from "@/queries/gates";
import { useRouter } from "expo-router";
import { Building, Car, DoorOpen, Home, Settings, Unlock, Users } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated";

export default function IntercomCallScreen() {
  const { data: apartmentData, isLoading, error } = useApartmentData();
  const { data: gatesData, isLoading: isGatesLoading, error: gatesError } = useGates(apartmentData?.apartment);
  const router = useRouter();
  const [isDoorOpened, setIsDoorOpened] = useState(false);
  const [isDoorLoading, setIsDoorLoading] = useState(false);
  const [isGateOpened, setIsGateOpened] = useState(false);
  const [isGateLoading, setIsGateLoading] = useState(false);
  const [isBarrierOpened, setIsBarrierOpened] = useState(false);
  const [isBarrierLoading, setIsBarrierLoading] = useState(false);
  
  // Reanimated values
  const doorButtonScale = useSharedValue(1);
  const gateButtonScale = useSharedValue(1);
  const barrierButtonScale = useSharedValue(1);

  const handleOpenDoor = async () => {
    if (isDoorLoading || isDoorOpened) return;
    
    doorButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 150 }),
      withTiming(1, { duration: 100 })
    );
    
    setIsDoorLoading(true);
    
    try {
      // Имитация API вызова
      await pb.send('/open-door', {
        method: 'POST'
      })
      setIsDoorOpened(true);
      setTimeout(() => setIsDoorOpened(false), 3000);
    } catch (error) {
      console.error('Failed to open door:', error);
    } finally {
      setIsDoorLoading(false);
    }
  };

  const handleOpenGate = async () => {
    if (isGateLoading || isGateOpened) return;
    
    gateButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 150 }),
      withTiming(1, { duration: 100 })
    );
    
    setIsGateLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setIsGateOpened(true);
      setTimeout(() => setIsGateOpened(false), 5000);
    } catch (error) {
      console.error('Failed to open gate:', error);
    } finally {
      setIsGateLoading(false);
    }
  };

  const handleOpenBarrier = async () => {
    if (isBarrierLoading || isBarrierOpened) return;
    
    barrierButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 150 }),
      withTiming(1, { duration: 100 })
    );
    
    setIsBarrierLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsBarrierOpened(true);
      setTimeout(() => setIsBarrierOpened(false), 8000);
    } catch (error) {
      console.error('Failed to open barrier:', error);
    } finally {
      setIsBarrierLoading(false);
    }
  };

  // Animated styles
  const doorButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: doorButtonScale.value }],
    };
  });

  const gateButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: gateButtonScale.value }],
    };
  });

  const barrierButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: barrierButtonScale.value }],
    };
  });

  if (isLoading || isGatesLoading) {
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

  if (error || !apartmentData || gatesError) {
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
      
      {/* Header with Settings */}
      <View className="absolute top-0 left-0 right-0 z-10 pt-12 pb-4 px-6 bg-gray-900/80 backdrop-blur-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-semibold">Домофон</Text>
          <TouchableOpacity
            onPress={() => router.push("/(protected)/profile")}
            className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center"
          >
            <Settings size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Background gradient effect */}
      <View className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-90" />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 80 }}>
        {/* Apartment Info Card */}
        <View className="bg-gray-800 rounded-3xl p-6 items-center mx-6 mb-6">
          <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mb-4">
            <Building size={32} color="white" />
          </View>
          
          <Text className="text-white text-xl font-bold mb-1">
            Квартира {apartment.apartment_number}
          </Text>
          
          <Text className="text-gray-400 text-base">
            {complex.name}
          </Text>
        </View>

        {/* Status Indicators */}
        {(isDoorOpened || isDoorLoading || isGateOpened || isGateLoading || isBarrierOpened || isBarrierLoading) && (
          <View className="mx-6 mb-6">
            {(isDoorOpened || isDoorLoading) && (
              <View className="flex-row items-center bg-black bg-opacity-50 px-4 py-2 rounded-full mb-2">
                <View className={`w-3 h-3 rounded-full mr-2 ${
                  isDoorOpened ? 'bg-orange-500' : 'bg-yellow-500'
                } ${isDoorLoading ? 'animate-pulse' : ''}`} />
                <Text className={`text-sm ${
                  isDoorOpened ? 'text-orange-400' : 'text-yellow-400'
                }`}>
                  {isDoorOpened ? 'Дверь открыта' : 'Открываем дверь...'}
                </Text>
              </View>
            )}
            
            {(isGateOpened || isGateLoading) && (
              <View className="flex-row items-center bg-black bg-opacity-50 px-4 py-2 rounded-full mb-2">
                <View className={`w-3 h-3 rounded-full mr-2 ${
                  isGateOpened ? 'bg-green-500' : 'bg-yellow-500'
                } ${isGateLoading ? 'animate-pulse' : ''}`} />
                <Text className={`text-sm ${
                  isGateOpened ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {isGateOpened ? 'Калитка открыта' : 'Открываем калитку...'}
                </Text>
              </View>
            )}
            
            {(isBarrierOpened || isBarrierLoading) && (
              <View className="flex-row items-center bg-black bg-opacity-50 px-4 py-2 rounded-full mb-2">
                <View className={`w-3 h-3 rounded-full mr-2 ${
                  isBarrierOpened ? 'bg-purple-500' : 'bg-yellow-500'
                } ${isBarrierLoading ? 'animate-pulse' : ''}`} />
                <Text className={`text-sm ${
                  isBarrierOpened ? 'text-purple-400' : 'text-yellow-400'
                }`}>
                  {isBarrierOpened ? 'Шлагбаум поднят' : 'Поднимаем шлагбаум...'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Control Sections */}
        
        {/* Doors Section */}
        <View className="mx-6 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-blue-600 rounded-lg items-center justify-center mr-3">
              <Home size={18} color="white" />
            </View>
            <Text className="text-white text-lg font-semibold">Двери</Text>
          </View>
          
          <View className="bg-gray-800 rounded-2xl p-4">
            <View className="flex-row justify-center">
              <View className="items-center">
                <Animated.View style={doorButtonAnimatedStyle}>
                  <TouchableOpacity
                    className={`w-16 h-16 rounded-2xl items-center justify-center ${
                      isDoorOpened ? "bg-orange-600" : isDoorLoading ? "bg-yellow-600" : "bg-blue-600"
                    }`}
                    onPress={handleOpenDoor}
                    activeOpacity={0.8}
                    disabled={isDoorOpened || isDoorLoading}
                    style={{
                      shadowColor: isDoorOpened ? "#EA580C" : isDoorLoading ? "#D97706" : "#2563EB",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  >
                    <Unlock size={24} color="white" />
                  </TouchableOpacity>
                </Animated.View>
                <Text className="text-gray-300 text-sm mt-2 text-center">Входная дверь</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Gates Section */}
        {gatesData && gatesData.filter(gate => gate.type === 'GATE').length > 0 && (
          <View className="mx-6 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-green-600 rounded-lg items-center justify-center mr-3">
                <Users size={18} color="white" />
              </View>
              <Text className="text-white text-lg font-semibold">Калитки</Text>
            </View>
            
            <View className="bg-gray-800 rounded-2xl p-4">
              <View className="flex-row flex-wrap justify-center gap-3">
                {gatesData?.filter(gate => gate.type === 'GATE').map(gate => (
                  <View key={gate.id} className="items-center">
                    <TouchableOpacity
                      className="w-16 h-16 rounded-xl items-center justify-center bg-green-500"
                      onPress={() => console.log('Open gate', gate.name)}
                      activeOpacity={0.8}
                    >
                      <DoorOpen size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-gray-300 text-xs mt-1 text-center w-24" numberOfLines={3}>
                      {gate.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Barriers Section */}
        {gatesData && gatesData?.filter(gate => gate.type === 'BARRIER').length > 0 && (
          <View className="mx-6 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-purple-600 rounded-lg items-center justify-center mr-3">
                <Car size={18} color="white" />
              </View>
              <Text className="text-white text-lg font-semibold">Шлагбаумы</Text>
            </View>
            
            <View className="bg-gray-800 rounded-2xl p-4">
              <View className="flex-row flex-wrap justify-center gap-3">
                {gatesData?.filter(gate => gate.type === 'BARRIER').map(gate => (
                  <View key={gate.id} className="items-center">
                    <TouchableOpacity
                      className="w-16 h-16 rounded-xl items-center justify-center bg-purple-500"
                      onPress={() => console.log('Open barrier', gate.name)}
                      activeOpacity={0.8}
                    >
                      <Car size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-gray-300 text-xs mt-1 text-center w-24" numberOfLines={3}>
                      {gate.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}


        {/* Instructions */}
        <View className="mx-6 mb-4">
          <Text className="text-gray-400 text-center text-sm leading-5">
            {isDoorOpened || isGateOpened || isBarrierOpened
              ? "Устройства автоматически закроются через несколько секунд"
              : "Нажмите на кнопку для управления устройством"
            }
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="pb-8 px-6">
        <Text className="text-gray-500 text-center text-sm">
          Система домофона активна
        </Text>
      </View>
    </View>
  );
}
