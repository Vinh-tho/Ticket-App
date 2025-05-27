import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { BASE_URL } from '../constants/config';

// Cấu hình cách thông báo xuất hiện khi ứng dụng đang mở
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Sử dụng BASE_URL từ config
const DEBUG = true;

export interface Notification {
  id: number;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export default function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const router = useRouter();

  // Đăng ký nhận thông báo
  async function registerForPushNotificationsAsync() {
    let token;
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      try {
        // Sử dụng projectId thực tế từ app.json
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;
        if (DEBUG) console.log("EXPO PUSH TOKEN:", token);
      } catch (error) {
        console.log('Could not get push token', error);
        return undefined;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  // Lấy token và gửi lên server
  async function getAndSendToken() {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        const jwtToken = await AsyncStorage.getItem('token');
        if (jwtToken) {
          await axios.post(
            `${BASE_URL}/notifications/token`,
            { expoPushToken: token },
            {
              headers: { Authorization: `Bearer ${jwtToken}` },
            }
          );
        }
      }
    } catch (error) {
      console.error('Error sending push token:', error);
    }
  }

  // Lấy danh sách thông báo từ server
  async function fetchNotifications() {
    try {
      setLoading(true);
      const jwtToken = await AsyncStorage.getItem('token');
      if (DEBUG) {
        console.log("JWT Token:", jwtToken ? jwtToken.substring(0, 20) + "..." : "không tồn tại");
        console.log("API URL:", `${BASE_URL}/notifications`);
      }
      
      if (!jwtToken) {
        console.log("Không thể tải thông báo: JWT token không tồn tại");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      
      if (DEBUG) {
        console.log("API Response status:", response.status);
        console.log("API Response data type:", typeof response.data);
        console.log("API Response data:", JSON.stringify(response.data).substring(0, 200));
      }
      
      // Kiểm tra cấu trúc dữ liệu
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
        if (DEBUG) console.log("Data là mảng, đã set trực tiếp");
      } else {
        console.log("Response không phải là mảng:", typeof response.data);
        // Nếu response là đối tượng có chứa trường notifications
        if (response.data && Array.isArray(response.data.notifications)) {
          setNotifications(response.data.notifications);
          if (DEBUG) console.log("Set notifications từ response.data.notifications");
        } else if (response.data && typeof response.data === 'object') {
          // Nếu là đối tượng đơn lẻ thông báo, wrap trong array
          if (response.data.id) {
            setNotifications([response.data]);
            if (DEBUG) console.log("Wrapped đối tượng đơn lẻ thành mảng");
          }
        }
      }
      
      // Tính toán lại số thông báo chưa đọc
      const notificationsData = Array.isArray(response.data) 
        ? response.data 
        : (Array.isArray(response.data.notifications) 
            ? response.data.notifications 
            : (response.data.id ? [response.data] : []));
            
      const unread = notificationsData.filter((notif: Notification) => !notif.isRead).length;
      setUnreadCount(unread);
      if (DEBUG) console.log("Unread count:", unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', error.response?.data);
        console.error('API Error status:', error.response?.status);
      }
    } finally {
      setLoading(false);
    }
  }

  // Đánh dấu thông báo đã đọc
  async function markAsRead(notificationId: number) {
    try {
      const jwtToken = await AsyncStorage.getItem('token');
      if (jwtToken) {
        await axios.patch(
          `${BASE_URL}/notifications/mark-read/${notificationId}`,
          {},
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );
        
        // Cập nhật state
        setNotifications(notifications.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        ));
        setUnreadCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Đánh dấu tất cả thông báo đã đọc
  async function markAllAsRead() {
    try {
      const jwtToken = await AsyncStorage.getItem('token');
      if (jwtToken) {
        await axios.patch(
          `${BASE_URL}/notifications/mark-all-read`,
          {},
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );
        
        // Cập nhật state
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  useEffect(() => {
    // Đăng ký và gửi token
    getAndSendToken();

    // Lấy danh sách thông báo khi hook được mount
    fetchNotifications();

    // Lắng nghe khi nhận được thông báo mới khi app đang mở
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Khi nhận được thông báo mới, làm mới danh sách
      fetchNotifications();
    });

    // Lắng nghe khi người dùng nhấn vào thông báo
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      if (data && data.notificationId) {
        // Đánh dấu thông báo đã đọc
        markAsRead(data.notificationId);
        
        // Điều hướng đến màn hình thông báo
        router.push('/(tabs)/notifications');
      }
    });

    return () => {
      // Dọn dẹp listeners khi component unmount
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
} 