import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppRegistry } from "react-native";
import RNNotificationCall from "react-native-full-screen-notification-incoming-call";
// ✅ HEADLESS TASK REGISTRATION - Add this
async function HeadlessTask(data) {
  try {
    const { call_uuid, call_id } = data.data;
    RNNotificationCall.displayNotification(call_uuid, null, 30000, {
      channelId: "com.abc.incomingcall",
      channelName: "Incoming video call",
      notificationIcon: "ic_launcher", // mipmap
      notificationTitle: "Домофон",
      notificationBody: "Кто-то звонит в домофон...",
      answerText: "Accept",
      declineText: "Decline",
      notificationColor: "colorAccent",
      isVideo: false,
      notificationSound: null, // raw
    });

    RNNotificationCall.addEventListener("answer", (answerPayload) => {
      console.log('ANSWERING THE CALL', answerPayload)
      AsyncStorage.setItem('call_info_android', JSON.stringify({
        call_uuid,
        call_id,
        completed: false
      }))
      RNNotificationCall.backToApp();
    });
  } catch (e) {
    console.log("error in firebase headless task", e);
  }
  console.log("Firebase headless task data:", data);
  return Promise.resolve();
}

AppRegistry.registerHeadlessTask(
  "ReactNativeFirebaseMessagingHeadlessTask",
  () => HeadlessTask
);

import "expo-router/entry";

