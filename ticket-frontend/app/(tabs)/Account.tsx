/**
 * ACCOUNT TAB SCREEN
 * 
 * Những điều cần học:
 * 1. React Hooks:
 *    - useState: Quản lý state trong functional component
 *    - useEffect: Side effects và lifecycle trong React
 * 
 * 2. Authentication:
 *    - SecureStore: Lưu trữ bảo mật token
 *    - Token-based Authentication
 * 
 * 3. Conditional Rendering:
 *    - Hiển thị UI dựa trên state
 *    - Loading states
 * 
 * 4. TypeScript:
 *    - Type annotation (boolean | null)
 *    - Type safety trong React
 */

import React, { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import AccountScreen from '../account_screens/AccountScreen';
import ProfileScreen from '../account_screens/ProfileScreen';
import { ActivityIndicator, View } from 'react-native';

export default function AccountTab() {
  // State để quản lý trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // useEffect để kiểm tra token khi component mount
  useEffect(() => {
    const checkLogin = async () => {
      const token = await SecureStore.getItemAsync('access_token');
      setIsLoggedIn(!!token); // Chuyển đổi token thành boolean
    };

    checkLogin();
  }, []);

  // Loading state khi đang kiểm tra token
  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Conditional rendering dựa trên trạng thái đăng nhập
  return isLoggedIn ? <ProfileScreen /> : <AccountScreen />;
}