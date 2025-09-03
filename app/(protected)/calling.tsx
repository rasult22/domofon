import { pb } from "@/queries/client";
import { CallDeclined } from "@/screens/calling/call-declined";
import VideoCall from "@/screens/calling/video-call";
import { Call } from "@/types/types";
import { acceptCall } from "@/webrtc/accept-call";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StatusBar, Text, View } from "react-native";
import RNCallKeep from "react-native-callkeep";
import inCallManager from "react-native-incall-manager";

export default function IntercomCallScreen() {
  const router = useRouter()
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
  const pb_unsubscribeRef = useRef<() => void>(() => {})

  // update ui when other party ended the call
  useEffect(() => {
    const fn = async () => {
      pb_unsubscribeRef.current = await pb.collection<Call>('calls').subscribe(callId as string, (data) => {
        if (data.record.status === 'ENDED') {
          handleEndCall()
        }
      })
    }
    fn()

    return () => {
      pb_unsubscribeRef.current()
    }
  }, [callId])

  const handleEndCall = () => {
    if (callStatus === 'declined') {
      return
    }
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
    router.replace('/')
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
