/**
 * TICKET MANAGEMENT SCREEN
 * 
 * Những điều cần học:
 * 1. API Integration:
 *    - Axios setup và sử dụng
 *    - Error handling
 *    - Data transformation
 * 
 * 2. Navigation & Routing:
 *    - expo-router navigation
 *    - Route params
 *    - Deep linking
 * 
 * 3. Authentication Flow:
 *    - Token management
 *    - Secure storage
 *    - Auth redirects
 * 
 * 4. Complex Data Handling:
 *    - Data mapping
 *    - Type definitions
 *    - Error boundaries
 * 
 * 5. UI/UX Patterns:
 *    - Loading states
 *    - Modal patterns
 *    - Pull-to-refresh
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { BASE_URL } from "@/constants/config";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import TicketList from "@/app/Ticket/TicketList";
import TicketModal from "@/app/Ticket/TicketModal";
import { Order } from "@/app/Ticket/types";
import { checkForNewOrUpdatedTickets, getSampleTickets } from "@/app/Ticket/utils";
import { fetchEventDetailInfo } from "@/app/payment_screen/api";

/**
 * Format date string to local format
 * Chuyển đổi ISO date string sang format local
 */
const formatDateTime = (isoString: string | undefined) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${minute}`;
};

/**
 * Interface định nghĩa props cho TicketList component
 * Giúp type checking và code completion
 */
interface TicketListProps {
  orders: Order[];
  onOrderPress: (order: Order) => void;
  refreshing: boolean;
  onRefresh: () => void;
  onBrowsePress: () => void;
}

export default function Ticket() {
  // Router và layout hooks
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State management
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);

  /**
   * Authentication check và data fetching khi screen focus
   * Redirect to login nếu không có token
   */
  useFocusEffect(
    useCallback(() => {
      const checkLoginAndFetch = async () => {
        try {
          const token = await SecureStore.getItemAsync("access_token");
          if (!token) {
            router.replace("/LoginScreen");
          } else {
            setLoading(false);
            fetchOrders(token);
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra đăng nhập:", error);
          router.replace("/LoginScreen");
        }
      };
      checkLoginAndFetch();
    }, [])
  );

  /**
   * Transform API data sang format phù hợp với UI
   * Xử lý nhiều edge cases và data inconsistencies
   */
  const mapApiDataToOrders = async (apiData: any): Promise<Order[]> => {
    if (!apiData || !Array.isArray(apiData)) {
      console.warn("Dữ liệu API không phải là mảng:", apiData);
      return [];
    }
    
    // Xử lý từng đơn hàng và chờ kết quả
    const orderPromises = apiData.map(async (item) => {
      const ticketPromises = (item.orderDetails || []).map(async (detail: any, index: number) => {
        let eventId = undefined;
        let eventDetailId = undefined;
        
        // Xác định event ID và eventDetailId
        if (detail.ticket?.event?.id) {
          eventId = detail.ticket.event.id;
        } else if (detail.ticket?.eventId) {
          eventId = detail.ticket.eventId;
        }
        
        if (detail.ticket?.eventDetailId) {
          eventDetailId = detail.ticket.eventDetailId;
        }
        
        // Lấy thông tin event detail từ API nếu có eventDetailId
        let eventData = null;
        if (eventDetailId) {
          eventData = await fetchEventDetailInfo(eventDetailId);
        }
        // Lấy eventDetails từ event
        const eventDetailsArr = detail.ticket?.event?.eventDetails || [];
        let matchedEventDetail = null;
        // Lấy eventDetailId từ order (item)
        const orderEventDetailId = item.eventDetailId;
        if (orderEventDetailId && eventDetailsArr.length > 0) {
          matchedEventDetail = eventDetailsArr.find((ed: any) => ed.id == orderEventDetailId);
        }
        if (!matchedEventDetail && eventDetailsArr.length > 0) {
          matchedEventDetail = eventDetailsArr[0];
        }

        const location = matchedEventDetail?.location ||
                         eventData?.location ||
                         eventData?.address ||
                         detail.ticket?.event?.location ||
                         detail.ticket?.event?.address ||
                         detail.ticket?.location ||
                         detail.ticket?.address ||
                         item.location ||
                         item.address ||
                         "Không xác định";

        let eventDate = matchedEventDetail?.startTime ||
                        matchedEventDetail?.date ||
                        eventData?.time ||
                        eventData?.date ||
                        detail.ticket?.event?.eventDate ||
                        detail.ticket?.event?.time ||
                        detail.ticket?.event?.date ||
                        detail.ticket?.eventDate ||
                        detail.ticket?.time ||
                        detail.ticket?.date ||
                        item.eventDate ||
                        item.time ||
                        item.date ||
                        undefined;
        if (!eventDate) {
          eventDate = item?.event?.eventDate || item?.event?.time || item?.event?.date || undefined;
        }
        if (eventDate) {
          eventDate = formatDateTime(eventDate);
        } else {
          eventDate = "Không xác định";
        }
        
        return {
          id: detail.id?.toString() || "N/A",
          eventName: eventData?.name || 
                         detail.ticket?.event?.eventName || 
                         detail.ticket?.eventName || 
                         item.eventName ||
                         item.name ||
                         "Không xác định",
          type: detail.ticket?.type || detail.ticket?.ticketType || "Tiêu chuẩn",
          seat:
            detail.seat
              ? `${detail.seat.zone || ''}${detail.seat.row || ''}-${detail.seat.number || ''}`
              : detail.ticket?.seat ||
                detail.ticket?.seatNumber ||
                detail.ticket?.seat_code ||
                detail.ticket?.seatNo ||
                detail.ticket?.seatInfo?.code ||
                "Chưa chọn",
          price: parseFloat(detail.unitPrice) || parseFloat(detail.ticket?.price) || 0,
          quantity: detail.quantity || 1,
          eventDate: eventDate,
          location: location,
          eventId: eventId,
          eventDetailId: eventDetailId // Thêm trường eventDetailId để sử dụng sau này
        };
      });
      
      // Đợi kết quả của tất cả các vé
      const tickets = await Promise.all(ticketPromises);
      
      let formattedDate = item.orderDate;
      try {
        if (item.orderDate && typeof item.orderDate === 'string') {
          const date = new Date(item.orderDate);
          formattedDate = date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (e) {
        console.warn("Lỗi khi định dạng ngày:", e);
      }

      // Xác định trạng thái thanh toán
      let status = item.status || "pending";
      let paymentStatus = item.paymentStatus || "pending";
      
      // Nếu trạng thái đơn hàng là pending và paymentStatus chưa có hoặc là pending, đánh dấu là chưa thanh toán
      if (
        (status.toLowerCase() === 'pending' && (!paymentStatus || paymentStatus.toLowerCase() === 'pending')) ||
        paymentStatus.toLowerCase() === 'unpaid'
      ) {
        status = 'unpaid';
        paymentStatus = 'unpaid';
      }

      return {
        id: item.id?.toString() || item._id?.toString() || "N/A",
        orderNumber: item.id?.toString() || item._id?.toString() || "N/A",
        orderDate: formattedDate || item.createdAt || new Date().toISOString(),
        status: status,
        totalAmount: parseFloat(item.totalAmount) || 0,
        tickets,
        paymentMethod: item.paymentMethod,
        paymentStatus: paymentStatus,
      };
    });
    
    // Đợi kết quả của tất cả các đơn hàng
    return await Promise.all(orderPromises);
  };

  /**
   * Fetch orders từ API
   * - Xử lý loading states
   * - Error handling
   * - Data transformation
   */
  const fetchOrders = async (token: string) => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${BASE_URL}/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let newOrders: Order[] = [];
      if (res.data && res.data.data) {
        newOrders = await mapApiDataToOrders(res.data.data);
      } else if (res.data && Array.isArray(res.data)) {
        newOrders = await mapApiDataToOrders(res.data);
      } else {
        console.warn("Cấu trúc dữ liệu không như mong đợi:", res.data);
        if (process.env.NODE_ENV === 'development') {
          console.log("Sử dụng dữ liệu mẫu để kiểm tra");
          newOrders = [];
        }
      }
      if (orders.length > 0) {
        const hasNewOrUpdated = checkForNewOrUpdatedTickets(orders, newOrders);
        setHasNotification(hasNewOrUpdated);
      }
      setOrders(newOrders);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách vé:", err);
      setOrders([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  /**
   * Refresh data
   * Kiểm tra token và gọi lại fetchOrders
   */
  const onRefresh = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    if (token) {
      fetchOrders(token);
    }
  };

  /**
   * Handle order selection
   * Hiển thị modal với thông tin chi tiết
   */
  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  /**
   * Handle payment flow
   * - Validate order data
   * - Prepare navigation params
   * - Navigate to payment screen
   */
  const handlePayOrder = (order: Order) => {
    // Kiểm tra nếu đơn hàng không có dữ liệu phù hợp
    if (!order || !order.id || !order.tickets || order.tickets.length === 0) {
      Alert.alert(
        "Lỗi dữ liệu",
        "Không thể tìm thấy thông tin đầy đủ của đơn hàng. Vui lòng thử lại sau.",
        [{ text: "Đóng", style: "cancel" }]
      );
      return;
    }

    setModalVisible(false);
    
    // Thêm loading trước khi chuyển trang
    setLoading(true);
    
    // Chuẩn bị dữ liệu vé và giá để truyền sang màn hình thanh toán
    const firstTicket = order.tickets[0];
    
    // Lấy event ID và eventDetailId từ ticket
    const eventId = firstTicket.eventId?.toString() || '';
    const eventDetailId = firstTicket.eventDetailId?.toString() || '';
    
    // Lấy thông tin sự kiện từ vé
    const eventName = firstTicket.eventName || order.tickets[0]?.eventName || 'Liveshow Ca Nhạc';
    const location = firstTicket.location || 'Trung tâm Hội nghị Quốc gia';
    const eventTime = firstTicket.eventDate || '22/5/2025 19:30';
    
    const selectedSeatsData = order.tickets.map(ticket => ({
      id: ticket.id,
      seatId: ticket.id,
      seat: ticket.seat,
      price: ticket.price,
      ticketId: ticket.id,
      eventName: ticket.eventName,
      location: ticket.location,
      eventDate: ticket.eventDate,
      quantity: ticket.quantity,
      type: ticket.type,
      eventId: ticket.eventId,
      eventDetailId: ticket.eventDetailId
    }));

    // Chuẩn bị dữ liệu JSON của ghế đã chọn
    const seatsDataJson = JSON.stringify(selectedSeatsData);
    
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/payment_screen/PaymentScreen',
        params: { 
          orderId: order.id,
          returnPath: '/(tabs)/Ticket',
          ticketId: firstTicket.id,
          selectedSeatsData: seatsDataJson,
          eventId: eventId,
          eventDetailId: eventDetailId,
          eventName: eventName,
          location: location,
          time: eventTime,
          totalAmount: order.totalAmount.toString()
        }
      });
    }, 300);
  };

  // Loading state UI
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#21C064" />
      </SafeAreaView>
    );
  }

  // Main UI
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header với notification dot */}
      <View style={[styles.header, { paddingTop: insets.top }]}> 
        <Text style={styles.headerTitle}>Vé của tôi</Text>
        {hasNotification && (
          <View style={styles.notificationDot} />
        )}
      </View>

      {/* Ticket list với refresh capability */}
      <TicketList
        orders={orders}
        onOrderPress={handleOrderPress}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onBrowsePress={() => router.push('/(tabs)')}
      />

      {/* Modal hiển thị chi tiết vé */}
      <TicketModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        order={selectedOrder}
        onPayOrder={handlePayOrder}
      />
    </View>
  );
}

// Styles với semantic naming
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#21C064",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  notificationDot: {
    position: "absolute",
    right: 20,
    top: 18,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF3B30",
  },
});

