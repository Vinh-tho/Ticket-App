/**
 * FILE LAYOUT CHÍNH CHO BOTTOM TAB NAVIGATION
 * 
 * Những điều cần học:
 * 1. expo-router:
 *    - Cách hoạt động của file-based routing trong Expo
 *    - Cấu trúc thư mục và quy ước đặt tên
 *    - Cách sử dụng các tính năng navigation khác
 * 
 * 2. React Hooks:
 *    - useColorScheme: Xử lý dark/light theme
 *    - Custom hooks (useNotifications)
 * 
 * 3. React Native UI:
 *    - Layout với position: absolute
 *    - Styling trong React Native
 *    - Components cơ bản
 * 
 * 4. Expo và TypeScript:
 *    - Cấu trúc project
 *    - API và components có sẵn
 *    - Type definitions
 */

import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import useNotifications from "@/hooks/useNotifications";
import { View, Text } from "react-native";

/**
 * TabLayout Component
 * 
 * Component này định nghĩa cấu trúc của bottom tab navigation:
 * - Sử dụng Tabs từ expo-router
 * - Tích hợp haptic feedback
 * - Xử lý thông báo với badge
 * - Tùy chỉnh giao diện (màu sắc, icons)
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { unreadCount } = useNotifications();

  return (
    /**
     * Cấu hình Tabs Navigation
     * 
     * screenOptions: Cấu hình chung cho tất cả các tabs
     * - tabBarActiveTintColor: Màu khi tab được chọn
     * - headerShown: Ẩn/hiện header
     * - tabBarButton: Component tùy chỉnh cho nút tab
     * - tabBarBackground: Component tùy chỉnh cho background
     * - tabBarStyle: Style cho thanh tab bar
     */
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2ec276", // Màu chữ khi active
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: '#282828', // Chuyển Tab Bar thành màu đen
          borderTopColor: 'transparent', // Ẩn viền trên
        },
        tabBarInactiveTintColor: '#FFFF', // Màu chữ khi không active
      }}
    >
      /**
       * Tab Trang chủ
       * - index.tsx là trang mặc định
       * - Sử dụng icon house.fill
       */
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      /**
       * Tab Vé của tôi
       * - Hiển thị thông tin vé người dùng
       * - Sử dụng icon ticket
       */
      <Tabs.Screen
        name="Ticket"
        options={{
          title: "Vé của tôi",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="ticket" color={color} />
          ),
        }}
      />

      /**
       * Tab Thông báo
       * - Hiển thị badge số lượng thông báo chưa đọc
       * - Badge được positioned absolute
       * - Xử lý hiển thị số lượng lớn hơn 99
       * - Sử dụng icon bell
       */
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông báo",
          tabBarIcon: ({ color }) => (
            <View>
              <IconSymbol size={28} name="bell" color={color} />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    right: -6,
                    top: -3,
                    backgroundColor: 'red',
                    borderRadius: 10,
                    width: unreadCount > 99 ? 20 : 16,
                    height: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      /**
       * Tab Tài khoản
       * - Hiển thị thông tin người dùng
       * - Sử dụng icon person
       */
      <Tabs.Screen
        name="Account"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
