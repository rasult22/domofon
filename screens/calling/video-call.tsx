import { Mic, MicOff, PhoneOff, Video, VideoOff, Unlock } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import inCallManager from "react-native-incall-manager";
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { MediaStream, RTCView } from "react-native-webrtc";

interface VideoCallProps {
  remoteStream?: MediaStream;
  localStream?: MediaStream;
  onEndCall?: () => void;
}

export default function VideoCall({ remoteStream, localStream, onEndCall }: VideoCallProps) {
  // UI states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isDoorOpened, setIsDoorOpened] = useState(false);

  // Reanimated values
  const buttonScale = useSharedValue(1);
  const doorButtonScale = useSharedValue(1);

  useEffect(() => {
    // Call duration timer
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    
    // Setup audio
    inCallManager.start({ media: "video" });
    inCallManager.setForceSpeakerphoneOn(true);
    
    return () => {
      clearInterval(timer);
      inCallManager.stop();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    if (onEndCall) {
      onEndCall();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Mute audio tracks
    localStream?.getAudioTracks().forEach((track: any) => {
      track.enabled = isMuted;
    });
    inCallManager.setMicrophoneMute(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // Enable/disable video tracks
    localStream?.getVideoTracks().forEach((track: any) => {
      track.enabled = !isVideoEnabled;
    });
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
  const doorButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: doorButtonScale.value }],
    };
  });

  return (
    <View className="flex-1 bg-gray-900 w-full">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Background gradient effect */}
      <View className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-90" />

      {/* Status bar area */}
      <View className="pt-12 pb-4 px-6 z-10">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-sm opacity-75">Видеозвонок</Text>
          <Text className="text-white text-sm opacity-75">
            {formatTime(callDuration)}
          </Text>
        </View>
      </View>

      {/* Video streams */}
      <View className="flex-1 justify-center items-center">
        {/* Remote video (full screen) */}
        {remoteStream && (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            }}
            objectFit="cover"
          />
        )}

        {/* Local video (picture-in-picture) */}
        {localStream && (
          <RTCView
            streamURL={localStream.toURL()}
            style={{
              position: "absolute",
              width: 120,
              height: 160,
              top: 100,
              right: 20,
              zIndex: 2,
              borderRadius: 12,
              overflow: "hidden",
              borderWidth: 2,
              borderColor: "#3B82F6",
              display: isVideoEnabled ? "flex" : "none",
            }}
            objectFit="cover"
          />
        )}

        {/* Connection status indicator */}
        <Animated.View
          layout={LinearTransition.duration(400)
            .springify()
            .damping(40)
            .stiffness(80)}
          className="items-center mb-12 z-10"
        >
          <View className="flex-row items-center mb-8 space-x-4">
            <Animated.View
              className="w-3 h-3 bg-green-500 rounded-full"
            />
            <Text className="text-green-400 text-sm ml-2">Соединен</Text>
          </View>
        </Animated.View>

        {/* Door status indicator */}
        {isDoorOpened && (
          <View className="absolute top-32 left-1/2 transform -translate-x-1/2 z-10">
            <View className="flex-row items-center bg-black bg-opacity-50 px-4 py-2 rounded-full">
              <View className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
              <Text className="text-orange-400 text-sm">Дверь открыта</Text>
            </View>
          </View>
        )}
      </View>

      {/* Call controls */}
      <View className="pb-12 px-8 z-10">
        <View className="items-center space-y-6">
          {/* Call controls */}
          <View
            className="flex-row justify-center items-center pb-8"
            style={{ columnGap: 24 }}
          >
            {/* Mute button */}
            <TouchableOpacity
              className={`w-16 h-16 rounded-full items-center justify-center ${isMuted ? "bg-red-600" : "bg-gray-700"}`}
              onPress={toggleMute}
              activeOpacity={0.8}
            >
              {isMuted ? (
                <MicOff size={28} color="white" />
              ) : (
                <Mic size={28} color="white" />
              )}
            </TouchableOpacity>

            {/* Video toggle button */}
            <TouchableOpacity
              className={`w-16 h-16 rounded-full items-center justify-center ${!isVideoEnabled ? "bg-red-600" : "bg-gray-700"}`}
              onPress={toggleVideo}
              activeOpacity={0.8}
            >
              {!isVideoEnabled ? (
                <VideoOff size={28} color="white" />
              ) : (
                <Video size={28} color="white" />
              )}
            </TouchableOpacity>

            {/* Open Door button */}
            <Animated.View
              style={doorButtonAnimatedStyle}
            >
              <TouchableOpacity
                className={`w-16 h-16 rounded-full items-center justify-center shadow-xl ${
                  isDoorOpened ? "bg-orange-600" : "bg-blue-600"
                }`}
                onPress={handleOpenDoor}
                activeOpacity={0.8}
                disabled={isDoorOpened}
                style={{
                  shadowColor: isDoorOpened ? "#EA580C" : "#2563EB",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Unlock size={28} color="white" />
              </TouchableOpacity>
            </Animated.View>

            {/* End call button */}
            <TouchableOpacity
              className="w-16 h-16 bg-red-600 rounded-full items-center justify-center shadow-xl"
              onPress={handleEndCall}
              activeOpacity={0.8}
              style={{
                shadowColor: "#DC2626",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <PhoneOff size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}