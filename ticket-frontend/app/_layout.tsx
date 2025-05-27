// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen as ExpoRouterSplash } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/hooks/useColorScheme';

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

// Đảm bảo Splash Screen của Expo hiển thị
SplashScreen.preventAutoHideAsync();

// Đảm bảo splash screen của expo-router không hiển thị
ExpoRouterSplash.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const router = useRouter();

  useEffect(() => {
    // Ẩn Expo splash screen ngay khi component được tạo
    SplashScreen.hideAsync();
    
    if (loaded) {
      // Ẩn splash screen của expo-router
      ExpoRouterSplash.hideAsync();
    }
    // Bắt deep link khi app đang mở
    const sub = Linking.addEventListener('url', ({ url }) => {
      if (url && url.startsWith('ticketapp://payment-success')) {
        router.replace('/payment_screen/PaymentSuccessScreen');
      }
    });
    // Bắt deep link khi app mở từ trạng thái tắt
    Linking.getInitialURL().then((url) => {
      if (url && url.startsWith('ticketapp://payment-success')) {
        router.replace('/payment_screen/PaymentSuccessScreen');
      }
    });

    // Xử lý khi mở app từ thông báo
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data && data.type === 'NEW_NOTIFICATION') {
        // Chuyển đến màn hình thông báo
        router.push('/(tabs)/notifications');
      }
    });

    return () => {
      sub.remove();
      subscription.remove();
    };
  }, [loaded, router]);

  if (!loaded) {
    return null; // Chưa load font thì không render gì
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#181A20' }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'fade'
          }}
        />
        <StatusBar 
          style="light" 
          backgroundColor={Platform.OS === 'android' ? '#21C064' : 'transparent'}
          translucent={Platform.OS === 'android'}
        />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
