import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import apiClient from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('jamia_alerts', {
        name: 'Jamia Islamia Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#059669',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;

    // Register token with backend
    try {
      await apiClient.post('/auth/device-token/', {
        token: pushToken,
        device_type: Platform.OS === 'ios' ? 'IOS' : Platform.OS === 'android' ? 'ANDROID' : 'WEB',
        device_name: `${Platform.OS} Device`,
      });
    } catch (apiErr) {
      console.warn('Could not register device token with backend:', apiErr);
    }

    return pushToken;
  } catch (error) {
    console.warn('Push notification registration skipped in simulator:', error);
    return null;
  }
};
