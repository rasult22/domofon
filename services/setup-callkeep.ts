import { AppRegistry, PermissionsAndroid } from 'react-native';
import RNCallKeep, { IOptions } from 'react-native-callkeep';

const options: IOptions = {
  ios: {
    appName: 'Domofon',
    supportsVideo: false, // Start with audio-only for testing
    maximumCallGroups: '1',
    maximumCallsPerCallGroup: '1',
    includesCallsInRecents: false,
  },
  android: {
    alertTitle: 'Permissions Required',
    alertDescription: 'This app needs access to manage calls',
    cancelButton: 'Cancel',
    okButton: 'Allow',
    additionalPermissions: [
      'android.permission.READ_PHONE_STATE',
      'android.permission.RECORD_AUDIO'
    ],
    selfManaged: false,
  }
};

// Initialize CallKeep
export const setupCallKeep = async () => {
  try {
    const accepted = await RNCallKeep.setup({
      ios: { appName: 'My app name' },
      android: {
        alertTitle: 'Permissions Required',
        alertDescription: 'This app needs access to manage calls',
        cancelButton: 'Cancel',
        okButton: 'Allow',
        imageName: 'phone_account_icon',
        additionalPermissions: [
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        ],
        selfManaged: false,
        foregroundService: {
          channelId: '',
          channelName: '',
          notificationTitle: 'Domofon',
        }
      }
    });
    AppRegistry.registerHeadlessTask('RNCallKeepBackgroundMessage', (data: any) => {
      console.log('RNCallKeepBackgroundMessage', data);
      return Promise.resolve()
    })
    console.log('CallKeep setup:', accepted);
    return accepted;
  } catch (error) {
    console.error('CallKeep setup failed:', error);
    return false;
  }
};

// Export for use in other parts of your app
export default options;