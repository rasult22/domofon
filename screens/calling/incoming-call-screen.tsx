import { Home, Mic, MicOff, PhoneOff, Unlock } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { CallDeclined } from './call-declined';
import { GettingCall } from './getting-call';

export default function IntercomCallScreen() {
 const [callStatus, setCallStatus] = useState('declined'); // incoming, accepted, declined
 const [isMuted, setIsMuted] = useState(false);
 const [callDuration, setCallDuration] = useState(0);
 const [isDoorOpened, setIsDoorOpened] = useState(false);

 // Reanimated values
 const pulseScale = useSharedValue(1);
 const pulseOpacity = useSharedValue(1);
 const buttonScale = useSharedValue(1);
 const doorButtonScale = useSharedValue(1);

 useEffect(() => {
    pulseScale.value = withTiming(1, { duration: 300 });
    pulseOpacity.value = withTiming(1, { duration: 300 });
 }, []);

 useEffect(() => {
   // Call duration timer
   if (callStatus === 'accepted') {
     const timer = setInterval(() => {
       setCallDuration(prev => prev + 1);
     }, 1000);
     return () => clearInterval(timer);
   }
 }, [callStatus]);

 const formatTime = (seconds:number) => {
   const mins = Math.floor(seconds / 60);
   const secs = seconds % 60;
   return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
 };

 const handleAccept = () => {
   buttonScale.value = withSequence(
     withTiming(0.9, { duration: 100 }),
     withTiming(1, { duration: 100 })
   );
   setCallStatus('accepted');
   setCallDuration(0);
 };

 const handleDecline = () => {
   buttonScale.value = withSequence(
     withTiming(0.9, { duration: 100 }),
     withTiming(1, { duration: 100 })
   );
   setCallStatus('declined');
 };

 const handleEndCall = () => {
   setCallStatus('declined');
 };

 const toggleMute = () => {
   setIsMuted(!isMuted);
 };

 const handleOpenDoor = () => {
   doorButtonScale.value = withSequence(
     withTiming(0.9, { duration: 100 }),
     withTiming(1.1, { duration: 150 }),
     withTiming(1, { duration: 100 })
   );
   setIsDoorOpened(true);
   
   // Reset door status after 3 seconds
   setTimeout(() => {
     setIsDoorOpened(false);
   }, 3000);
 };

 // Animated styles
 const pulseAnimatedStyle = useAnimatedStyle(() => {
   return {
     transform: [{ scale: pulseScale.value }],
     opacity: pulseOpacity.value,
   };
 });

 const doorButtonAnimatedStyle = useAnimatedStyle(() => {
   return {
     transform: [{ scale: doorButtonScale.value }],
   };
 });
 if (callStatus === 'incoming') {
  return <GettingCall handleAccept={handleAccept} handleDecline={handleDecline} />
 }

 if (callStatus === 'declined') {
   return (
    <CallDeclined startNewCall={() => {
        setCallStatus('incoming');
        setIsDoorOpened(false);
    }} />
   );
 }

 return (
   <View className="flex-1 bg-gray-900 w-full">
     <StatusBar barStyle="light-content" backgroundColor="#111827" />
     
     {/* Background gradient effect */}
     <View className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-90" />
     
     {/* Status bar area */}
     <View className="pt-12 pb-4 px-6 z-10">
       <View className="flex-row justify-between items-center">
         <Text className="text-white text-sm opacity-75">
           Разговор
         </Text>
         <Text className="text-white text-sm opacity-75">
           {formatTime(callDuration)}
         </Text>
       </View>
     </View>

     {/* Main call info */}
     <Animated.View layout={LinearTransition.duration(400).springify().damping(40).stiffness(80)} className="flex-1 justify-center items-center px-8">
       <View className="items-center mb-12">
         {/* Intercom icon with pulse animation */}
         <Animated.View 
           className="w-32 h-32 bg-blue-600 rounded-full items-center justify-center mb-6 shadow-2xl"
           style={[
             {
               shadowColor: '#3B82F6',
               shadowOffset: { width: 0, height: 0 },
               shadowOpacity: 0.5,
               shadowRadius: 20,
               elevation: 10,
             },
           ]}
         >
           <Home size={64} color="white" />
         </Animated.View>

         <Text className="text-white text-3xl font-bold mb-2">
           Домофон
         </Text>
         <Text className="text-gray-400 mt-2 text-base text-center">
           Кто-то звонит в домофон
         </Text>
       </View>

       {callStatus === 'accepted' && (
         <View className="flex-row items-center mb-8 space-x-4">
           <Animated.View 
             className="w-3 h-3 bg-green-500 rounded-full"
             style={pulseAnimatedStyle}
           />
           <Text className="text-green-400 text-sm ml-2">Соединен</Text>
         </View>
       )}

       {/* Door status indicator */}
       {isDoorOpened && callStatus === 'accepted' && (
         <View className="flex-row items-center mb-4">
           <View className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
           <Text className="text-orange-400 text-sm">Дверь открыта</Text>
         </View>
       )}
     </Animated.View>

     {/* Call controls */}
     <View className="pb-12 px-8">
        <View className="items-center space-y-6">
          {/* Call controls when active */}
          <View className="flex-row justify-center items-center pb-8" style={{ columnGap: 32 }}>
            {/* Mute button */}
            <TouchableOpacity
              className={`w-20 h-20 rounded-full items-center justify-center ${
                isMuted ? 'bg-red-600' : 'bg-gray-700'
              }`}
              onPress={toggleMute}
              activeOpacity={0.8}
            >
              {isMuted ? <MicOff size={32} color="white" /> : <Mic size={32} color="white" />}
            </TouchableOpacity>
          </View>
          <View className='flex-row justify-between w-full px-8'>
          {/* Open Door button */}
          <Animated.View style={doorButtonAnimatedStyle} className="items-center gap-2">
            <TouchableOpacity
              className={`w-20 h-20 rounded-full items-center justify-center shadow-xl ${
                isDoorOpened ? 'bg-orange-600' : 'bg-blue-600'
              }`}
              onPress={handleOpenDoor}
              activeOpacity={0.8}
              disabled={isDoorOpened}
              style={{
                shadowColor: isDoorOpened ? '#EA580C' : '#2563EB',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Unlock size={32} color="white" />
            </TouchableOpacity>
              {/* Door button label */}
              <Text className={`text-sm font-medium ${
                isDoorOpened ? 'text-orange-400' : 'text-blue-400'
              }`}>
                {isDoorOpened ? 'Дверь открыта' : 'Открыть дверь'}
              </Text>
          </Animated.View>
            {/* End call button */}
          <TouchableOpacity
            className="w-20 h-20 bg-red-600 rounded-full items-center justify-center shadow-xl"
            onPress={handleEndCall}
            activeOpacity={0.8}
            style={{
              shadowColor: '#DC2626',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <PhoneOff size={32} color="white" />
          </TouchableOpacity>
        </View>
        </View>
     </View>
   </View>
 );
}