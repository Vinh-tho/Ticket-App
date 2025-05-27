import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Giả định SHARED_COLOR_MAP và LegendTicketType được import hoặc định nghĩa ở đây/constants
// Ví dụ:
const SHARED_COLOR_MAP: Record<string, string> = {
  VIP: '#F44336',
  Normal: '#4FC3F7',
  VVIP: '#800080', // Purple for VVIP
  Premium: '#FFD966',
  Standard: '#4FC3F7',
  Economy: '#D9D9D9',
};

interface LegendTicketType {
  name: string;
  price: number;
  color: string;
}

export enum TicketType {
  NORMAL = "Normal",
  VIP = "VIP",
  VVIP = "VVIP",
}

interface Ticket {
  id: number;
  type: TicketType;
  price: number;
  quantity: number;
  status: string; // available, limited, sold_out
  seat: string;
  seatCount: number;
  eventDetailId: number;
}

interface EventDetail {
  id: number;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  status: string;
}

interface Event {
  id: number;
  tickets: Ticket[];
  eventDetails: EventDetail[];
  status: 'upcoming' | 'active' | 'completed'; // Thêm trạng thái sự kiện
}

interface TicketInfoProps {
  event: Event;
}

export default function TicketInfo({ event }: TicketInfoProps) {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    console.log('Event data received:', event);
    checkLoginStatus();
    setLoading(false);
  }, [event]);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      setIsLoggedIn(!!token);
    } catch (error) {
      console.log('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
      setIsLoggedIn(false);
    }
  };

  const handleBuyTicket = (detail: EventDetail) => {
    console.log('handleBuyTicket called');
    // Kiểm tra xem tất cả vé cho sự kiện này có hết không
    const ticketsForThisDetail = event.tickets;
    console.log('Tickets for this detail:', ticketsForThisDetail);
    const allSoldOut = ticketsForThisDetail.every(ticket => ticket.status === 'sold_out');
    console.log('All tickets sold out for this detail:', allSoldOut);

    if (allSoldOut) {
      // Nếu đã hết vé, không cho phép mua
      return;
    }
    
    if (!isLoggedIn) {
      Alert.alert(
        "Vui lòng đăng nhập",
        "Bạn cần đăng nhập để mua vé",
        [
          {
            text: "Đăng nhập",
            onPress: () => router.push("/LoginScreen"),
            style: "default"
          },
          {
            text: "Hủy",
            style: "cancel"
          }
        ]
      );
      return;
    }

    // Trích xuất các loại vé duy nhất và giá từ event.tickets
    const uniqueTicketTypesForEvent: LegendTicketType[] = [];
    if (event && event.tickets) {
      event.tickets.forEach(ticket => {
        if (!uniqueTicketTypesForEvent.find(t => t.name === ticket.type)) {
          uniqueTicketTypesForEvent.push({
            name: ticket.type,
            price: ticket.price,
            color: SHARED_COLOR_MAP[ticket.type] || '#CCCCCC'
          });
        }
      });
    }
    const params = {
      eventId: String(event.id),
      eventTicketTypesParam: JSON.stringify(uniqueTicketTypesForEvent),
      eventDetailId: String(detail.id)
    };
    console.log('Attempting to push to /seat_screen with params:', params);
    router.push({ pathname: "/seat_screen", params: { ...params } as any });
  };

  if (loading) {
    return <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const getButtonStyle = (allSoldOut: boolean, status: string) => {
    if (status === 'completed') {
      return [styles.buyButton, styles.completedButton];
    }
    if (status === 'upcoming') {
      return [styles.buyButton, styles.upcomingButton];
    }
    if (allSoldOut) {
      return [styles.buyButton, styles.soldOutButton];
    }
    if (!isLoggedIn) {
      return [styles.buyButton, styles.buyButtonDisabled];
    }
    return [styles.buyButton];
  };

  const getButtonText = (allSoldOut: boolean, status: string) => {
    if (status === 'completed') {
      return "Đã kết thúc";
    }
    if (status === 'upcoming') {
      return "Sắp diễn ra";
    }
    if (allSoldOut) {
      return "Hết vé";
    }
    return "Mua vé ngay";
  };

  const isButtonDisabled = (allSoldOut: boolean, status: string) => {
    return !isLoggedIn || allSoldOut || status !== 'active';
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Thông tin vé</Text>
      {event.eventDetails.map((detail) => {
        const allSoldOut = event.tickets.every(ticket => ticket.status === 'sold_out');
        return (
          <View key={detail.id} style={styles.scheduleRow}>
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>
                {formatTime(detail.startTime)} - {formatTime(detail.endTime)}
              </Text>
              <Text style={styles.dateText}>{formatDate(detail.startTime)}</Text>
            </View>
            <TouchableOpacity
              style={getButtonStyle(allSoldOut, event.status)}
              onPress={() => handleBuyTicket(detail)}
              disabled={isButtonDisabled(allSoldOut, event.status)}
            >
              <Text style={styles.buyButtonText}>
                {getButtonText(allSoldOut, event.status)}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#23272f',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c313a',
    borderRadius: 10,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  dateText: {
    color: '#fff',
    fontSize: 15,
  },
  buyButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  soldOutButton: {
    backgroundColor: '#ff6b6b',
    opacity: 0.9,
  },
  upcomingButton: {
    backgroundColor: '#3b82f6', // Màu xanh dương cho sự kiện sắp diễn ra
  },
  completedButton: {
    backgroundColor: '#6b7280', // Màu xám cho sự kiện đã kết thúc
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  loadingText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
});