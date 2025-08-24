import { pb } from "@/queries/client";
import { CallDeclined } from "@/screens/calling/call-declined";
import VideoCall from "@/screens/calling/video-call";
import { acceptCall } from "@/webrtc/accept-call";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StatusBar, Text, View } from "react-native";
import RNCallKeep from "react-native-callkeep";
import inCallManager from "react-native-incall-manager";

export default function IntercomCallScreen() {
  // get call id from url params
  const callId = useLocalSearchParams().call_id
  const uuid = useLocalSearchParams().uuid

  const {data, isLoading} = useQuery({
    queryKey: ['calling', callId],
    queryFn: async () => {
      if (callId) {
        await AsyncStorage.removeItem('call_info_android');
        const data = await acceptCall(callId as string, (event) => {
        
        })
        return {
          pc: data.peerConnection,
          remoteStream: data.remoteStream,
          localStream: data.localStream
        }
      }
    }
  })

  const [callStatus, setCallStatus] = useState("incoming"); // incoming, accepted, declined

  const handleEndCall = () => {
    setCallStatus("declined");
    inCallManager.stop()
    if (callId) {
      pb.collection('calls').update(callId as string, {
        status: 'ENDED'
      })
    }
    if (uuid) {
      RNCallKeep.endCall(uuid as string)
    }
    if (data?.pc) {
      data?.pc.close?.();
    }
  };

  if (callStatus === "declined") {
    return (
      <CallDeclined
        startNewCall={() => {
          setCallStatus("incoming");
        }}
      />
    );
  }

  if (data && !isLoading) {
    return <VideoCall onEndCall={handleEndCall} remoteStream={data.remoteStream} localStream={data.localStream} />
  }

  return (
    <View className="flex-1 bg-gray-900 w-full">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View>
        <Text>Nothing is here</Text>
      </View>
    </View>
  );
}
