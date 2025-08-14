import React, { useEffect } from "react";
import {
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { CallDeclined } from "./call-declined";

export default function IntercomCallScreen() {
  
  // Reanimated values
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withTiming(1, { duration: 300 });
    pulseOpacity.value = withTiming(1, { duration: 300 });
  }, []);

    return (
      <CallDeclined
        startNewCall={() => {
        }}
      />
    );
}
