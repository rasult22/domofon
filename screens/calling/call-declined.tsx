import { PhoneOff } from "lucide-react-native";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";

export function CallDeclined({startNewCall}: {startNewCall: () => void}) {
  return (
     <View className="flex-1 bg-gray-900 w-full justify-center items-center px-8">
       <StatusBar barStyle="light-content" backgroundColor="#111827" />
       <View className="bg-gray-800 rounded-3xl p-8 items-center w-full max-w-sm">
         <View className="w-16 h-16 bg-red-500 rounded-full items-center justify-center mb-4">
           <PhoneOff size={32} color="white" />
         </View>
         <Text className="text-white text-xl font-semibold mb-2">Звонок завершен</Text>
         <Text className="text-gray-400 text-center mb-6">
           Домофон отключен
         </Text>
         <TouchableOpacity 
           className="bg-blue-600 px-8 py-3 rounded-full"
           onPress={() => {
            startNewCall()
           }}
           activeOpacity={0.8}
         >
           <Text className="text-white font-semibold">Новый звонок</Text>
         </TouchableOpacity>
       </View>
     </View>
  );
}