import LoadingFullScreen from "@/components/LoadingFullScreen";
import { useAuth } from "@/queries/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Home, LogOut, Mail, Phone, Shield, User } from "lucide-react-native";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const { data: user, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Выйти из аккаунта",
      "Вы уверены, что хотите выйти?",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Выйти",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("auth_token");
              router.replace("/sign-in");
            } catch (error) {
              console.error("Error during logout:", error);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingFullScreen />;
  }

  if (!user) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-lg">Пользователь не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 pt-16 pb-8">
        {/* Profile Avatar */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-blue-600 items-center justify-center mb-4">
            <User size={40} color="white" />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">
            {user.name || user.email?.split("@")[0] || "Пользователь"}
          </Text>
          <Text className="text-gray-400 text-base">{user.email}</Text>
        </View>
      </View>

      {/* Profile Information */}
      <View className="px-6 mb-8">
        <Text className="text-white text-lg font-semibold mb-4">Информация</Text>
        
        {/* Email */}
        <View className="bg-gray-900 rounded-xl p-4 mb-3 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center mr-4">
            <Mail size={20} color="#9CA3AF" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-400 text-sm">Email</Text>
            <Text className="text-white text-base">{user.email}</Text>
          </View>
        </View>

        {/* Phone (if available) */}
        {user.phone && (
          <View className="bg-gray-900 rounded-xl p-4 mb-3 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center mr-4">
              <Phone size={20} color="#9CA3AF" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-sm">Телефон</Text>
              <Text className="text-white text-base">{user.phone}</Text>
            </View>
          </View>
        )}

        {/* User ID */}
        <View className="bg-gray-900 rounded-xl p-4 mb-3 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center mr-4">
            <Shield size={20} color="#9CA3AF" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-400 text-sm">ID пользователя</Text>
            <Text className="text-white text-base font-mono">{user.id}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="px-6 mb-8">
        <Text className="text-white text-lg font-semibold mb-4">Действия</Text>
        
        {/* Apartment Setup */}
        <TouchableOpacity
          onPress={() => router.push("/(protected)/apartment-setup")}
          className="bg-gray-900 rounded-xl p-4 mb-3 flex-row items-center"
        >
          <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center mr-4">
            <Home size={20} color="#9CA3AF" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-base">Настройка квартиры</Text>
            <Text className="text-gray-400 text-sm">Изменить данные квартиры</Text>
          </View>
          <Text className="text-gray-400 text-lg">→</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex-row items-center"
        >
          <View className="w-10 h-10 rounded-full bg-red-800/30 items-center justify-center mr-4">
            <LogOut size={20} color="#EF4444" />
          </View>
          <View className="flex-1">
            <Text className="text-red-400 text-base font-medium">Выйти из аккаунта</Text>
            <Text className="text-red-500/70 text-sm">Завершить сеанс</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View className="px-6 pb-8">
        <View className="bg-gray-900/50 rounded-xl p-4">
          <Text className="text-gray-400 text-sm text-center">
            Домофон v1.0.0
          </Text>
          <Text className="text-gray-500 text-xs text-center mt-1">
            © 2024 Все права защищены
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}