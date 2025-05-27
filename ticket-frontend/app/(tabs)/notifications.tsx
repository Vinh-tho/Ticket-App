import React, { useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Animated, Dimensions, StatusBar } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import useNotifications from '../../hooks/useNotifications';
import { formatDistance, subDays, formatDistanceToNow } from 'date-fns';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Hằng số để bật tắt debug mode
const DEBUG = true;
const { width } = Dimensions.get('window');

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { 
    notifications, 
    loading, 
    unreadCount, 
    fetchNotifications, 
    markAsRead,
    markAllAsRead 
  } = useNotifications();

  // Debug log
  useEffect(() => {
    if (DEBUG) {
      console.log("NOTIFICATIONS SCREEN - notifications:", notifications);
      console.log("NOTIFICATIONS SCREEN - loading:", loading);
      console.log("NOTIFICATIONS SCREEN - unreadCount:", unreadCount);
    }
  }, [notifications, loading, unreadCount]);

  // Cập nhật danh sách thông báo khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused, fetching notifications...");
      fetchNotifications();
    }, [])
  );

    /**
   * Format thời gian thông báo
   * - Hiển thị relative time cho thời gian gần
   * - Hiển thị ngày cụ thể cho thời gian xa
   */

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      // Logic hiển thị thời gian tương đối
      if (diffSecs < 60) {
        return 'Vừa xong';
      } else if (diffMins < 60) {
        return `${diffMins} phút trước`;
      } else if (diffHours < 24) {
        return `${diffHours} giờ trước`;
      } else if (diffDays < 30) {
        return `${diffDays} ngày trước`;
      } else {
        // Format ngày tháng cho thời gian xa
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    } catch (error) {
      return dateString;
    }
  };

  // Render mỗi item thông báo
  const renderNotificationItem = ({ item, index }: { item: any, index: number }) => {
    const isUnread = !item.isRead;
    
    return (
      <Animated.View 
        style={{
          opacity: 1,
          transform: [{ translateY: 0 }],
        }}
      >
        <TouchableOpacity 
          style={[
            styles.notificationItem, 
            isUnread && styles.unreadItem,
            { marginTop: index === 0 ? 12 : 8 }
          ]}
          onPress={() => markAsRead(item.id)}
        >
          <View style={styles.iconContainer}>
            <FontAwesome 
              name="bell" 
              size={20} 
              color={isUnread ? "#2196F3" : "#9E9E9E"} 
            />
          </View>
          <View style={styles.notificationContent}>
            <Text 
              style={[
                styles.message, 
                isUnread && styles.unreadMessage
              ]}
            >
              {item.message}
            </Text>
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>
          {isUnread && (
            <View style={styles.unreadDot} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.markAllButton} 
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Đánh dấu tất cả đã đọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#21C064" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchNotifications}
              colors={['#21C064']}
              tintColor="#21C064"
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <FontAwesome name="bell-o" size={50} color="#ccc" />
              </View>
              <Text style={styles.emptyText}>Bạn chưa có thông báo nào</Text>
              {DEBUG && (
                <View style={styles.debugContainer}>
                  <Text style={{fontWeight: 'bold'}}>Debug Info:</Text>
                  <Text>Notifications: {JSON.stringify(notifications)}</Text>
                  <Text>Loading: {loading ? "true" : "false"}</Text>
                  <Text>API URL: {Constants?.expoConfig?.extra?.apiUrl || 'not set'}</Text>
                  <View style={{marginTop: 10}}>
                    <TouchableOpacity 
                      style={{marginBottom: 8, padding: 8, backgroundColor: '#21C064', borderRadius: 4}}
                      onPress={fetchNotifications}
                    >
                      <Text style={{color: 'white', textAlign: 'center'}}>Refresh Data</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={{padding: 8, backgroundColor: '#4CAF50', borderRadius: 4}}
                      onPress={async () => {
                        const token = await AsyncStorage.getItem('token');
                        alert(`JWT Token: ${token ? token.substring(0, 20) + '...' : 'không tồn tại'}`);
                      }}
                    >
                      <Text style={{color: 'white', textAlign: 'center'}}>Kiểm tra JWT Token</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={{marginTop: 8, padding: 8, backgroundColor: '#FF9800', borderRadius: 4}}
                      onPress={async () => {
                        try {
                          const testToken = 'test_jwt_token_for_debugging';
                          await AsyncStorage.setItem('token', testToken);
                          alert('Đã lưu token test, hãy thử tải lại thông báo');
                        } catch (error) {
                          alert('Lỗi khi lưu token: ' + error);
                        }
                      }}
                    >
                      <Text style={{color: 'white', textAlign: 'center'}}>Lưu Token Test</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafe',
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#21C064",
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  headerTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  markAllButton: {
    position: 'absolute',
    right: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  markAllText: {
    color: '#fff',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 0,
  },
  unreadItem: {
    backgroundColor: '#EBF7FF',
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    marginBottom: 5,
    color: '#424242',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#212121',
  },
  time: {
    fontSize: 12,
    color: '#757575',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#757575',
    fontSize: 16,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 10,
  },
  debugContainer: {
    marginTop: 20, 
    padding: 15, 
    backgroundColor: '#f0f0f0', 
    width: '90%',
    borderRadius: 8,
  }
}); 