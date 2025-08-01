import RNCallKeep, { IOptions } from 'react-native-callkeep';

const options: IOptions = {
  ios: {
    appName: 'Domofon',
    imageName: 'CallKitIcon', // Add your app icon to iOS bundle
    supportsVideo: true,
    maximumCallGroups: '1',
    maximumCallsPerCallGroup: '1',
    ringtoneSound: 'system_ringtone_default', // or custom sound file
    includesCallsInRecents: false,
    audioSession: {
      categoryOptions: 1, // AVAudioSessionCategoryOptionAllowBluetooth
      mode: 'videoChat', // or 'voiceChat' for audio-only
    }
  },
  android: {
    alertTitle: 'Permissions Required',
    alertDescription: 'Domofon needs access to your phone accounts to provide calling functionality',
    cancelButton: 'Cancel',
    okButton: 'Allow',
    imageName: 'ic_phone_account', // Add icon to android drawable
    additionalPermissions: [
      'android.permission.READ_PHONE_STATE',
      'android.permission.CALL_PHONE',
      'android.permission.RECORD_AUDIO',
      'android.permission.CAMERA'
    ],
    selfManaged: false, // Set to true for self-managed ConnectionService
    foregroundService: {
      channelId: 'domofon_calls',
      channelName: 'Domofon Calls',
      notificationTitle: 'Domofon is handling a call',
      notificationIcon: 'ic_phone_notification' // Optional custom icon
    }
  }
};


RNCallKeep.setup(options).then(accepted => {});