import { Home } from "lucide-react-native";
import { Pressable, StatusBar, Text, View } from "react-native";
import RNCallKeep from "react-native-callkeep";

export function CallDeclined({startNewCall}: {startNewCall: () => void}) {
  return (
     <View className="flex-1 bg-gray-900 w-full justify-center items-center px-8">
       <StatusBar barStyle="light-content" backgroundColor="#111827" />
       <View className="bg-gray-800 rounded-3xl p-8 items-center w-full max-w-sm">
         <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mb-4">
           <Home size={32} color="white" />
         </View>
         <Text className="text-white text-xl font-semibold mb-2">Нет активных звонков</Text>
         <Text className="text-gray-400 text-center mb-6">
           Домофон закрыт
         </Text>
         <Pressable onPress={() => {
          RNCallKeep.displayIncomingCall('test-123', 'test call', 'test caller', 'generic', false)
         }}>
          <Text>Test</Text>
         </Pressable>
       </View>
     </View>
  );
}