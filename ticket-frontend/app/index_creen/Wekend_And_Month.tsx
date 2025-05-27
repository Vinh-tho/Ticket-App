import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Animated,
    ActivityIndicator,
  } from "react-native";
  import { Ionicons } from "@expo/vector-icons";
  import React, { useRef, useState, useEffect } from "react";
  import { useRouter } from "expo-router";
  import { BASE_URL } from "@/constants/config";

interface Event {
  id: number;
  mainImageUrl: string;
  eventName: string;
  eventDetails: {
    detailImageUrl: string;
    startTime: string;
  }[];
  tickets: {
    id: number;
    type: string;
    price: number;
    quantity: number;
    status: string;
  }[];
}

const { width, height } = Dimensions.get("window");

export default function Wekend_And_Month() {
  const [selectedTab, setSelectedTab] = useState("weekend");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/events`);
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sự kiện:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const moveIndicator = (tab: string) => {
    Animated.timing(indicatorPosition, {
      toValue: tab === "weekend" ? 0 : width * 0.5,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleTabPress = (tab: string) => {
    setSelectedTab(tab);
    moveIndicator(tab);
  };

  const getFilteredEvents = () => {
    const now = new Date();
    
    // Lấy ngày đầu tuần (thứ 2) và cuối tuần (chủ nhật)
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    // Nếu hôm nay là chủ nhật (0), lấy từ thứ 2 tuần trước
    const currentDay = now.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // -6 nếu là chủ nhật, không thì lùi về thứ 2
    startOfWeek.setDate(now.getDate() + diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Lấy ngày đầu tháng và cuối tháng
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Debug thông tin
    console.log('Current time:', now.toLocaleString('vi-VN'));
    console.log('Week range:', startOfWeek.toLocaleString('vi-VN'), 'to', endOfWeek.toLocaleString('vi-VN'));
    console.log('Month range:', startOfMonth.toLocaleString('vi-VN'), 'to', endOfMonth.toLocaleString('vi-VN'));

    return events.filter(event => {
      // Lấy thời gian sự kiện từ eventDetails
      const eventStartTime = event.eventDetails?.[0]?.startTime;
      if (!eventStartTime) return false;

      const eventDate = new Date(eventStartTime);
      
      // Debug thông tin sự kiện
      console.log('Event:', event.eventName, 'Date:', eventDate.toLocaleString('vi-VN'));

      if (selectedTab === "weekend") {
        // Sự kiện trong tuần này
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      } else {
        // Sự kiện trong tháng này
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#21C064" />
      </View>
    );
  }

  const filteredEvents = getFilteredEvents();

  return (
    <View>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => handleTabPress("weekend")}> 
          <Text style={[styles.tabText, selectedTab === "weekend" && styles.activeTab]}>Tuần này</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => handleTabPress("month")}> 
          <Text style={[styles.tabText, selectedTab === "month" && styles.activeTab]}>Tháng này</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.indicatorWrapper}>
        <Animated.View
          style={[
            styles.indicator,
            {
              left: indicatorPosition,
            },
          ]}
        />
      </View>
      <FlatList
        data={filteredEvents}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const eventDetail = item.eventDetails?.[0];
          const formattedDate = eventDetail?.startTime 
            ? new Date(eventDetail.startTime).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              })
            : "Chưa có ngày";

          // Tìm giá vé thấp nhất từ mảng tickets
          let minPrice = Number.MAX_VALUE;
          
          // Duyệt qua tất cả các vé để tìm giá thấp nhất
          if (item.tickets && item.tickets.length > 0) {
            item.tickets.forEach(ticket => {
              // Chỉ xét các vé còn available và có giá > 0
              if (ticket.status === 'available' && ticket.price > 0 && ticket.price < minPrice) {
                minPrice = parseFloat(ticket.price.toString());
              }
            });
          }

          // Nếu không tìm thấy vé nào có giá > 0, đặt minPrice = 0
          if (minPrice === Number.MAX_VALUE) {
            minPrice = 0;
          }

          const formattedPrice = minPrice > 0
            ? `${minPrice.toLocaleString('vi-VN')}đ`
            : "Miễn phí";

          return (
            <TouchableOpacity 
              style={styles.recommendedEventContainer}
              onPress={() => router.push(`/events_detail/${item.id}`)}
            >
              <Image 
                source={{ uri: eventDetail?.detailImageUrl || item.mainImageUrl }} 
                style={styles.recommendedEventImage} 
              />
              <Text style={styles.eventTitle} numberOfLines={2}>
                {item.eventName}
              </Text>
              <Text style={styles.eventPrice}>Từ {formattedPrice}</Text>
              <View style={styles.eventDate}>
                <Ionicons name="calendar-outline" size={14} color="gray" />
                <Text style={styles.eventDateText}>{formattedDate}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 39,
    marginBottom: 0,
  },
  tabBtn: {
    width: width * 0.5,
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabText: {
    fontSize: 18,
    color: "#b0b0b0",
    fontWeight: "bold",
  },
  activeTab: {
    color: "#fff",
  },
  indicatorWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 6,
    marginBottom: 8,
  },
  indicator: {
    position: 'absolute',
    height: 4,
    width: width * 0.5,
    backgroundColor: "#21C064",
    borderRadius: 4,
    bottom: 0,
  },
  recommendedEventContainer: {
    backgroundColor: "#1e1e1e",
    width: width * 0.6,
    marginLeft: 15,
    borderRadius: 10,
    overflow: "hidden",
    paddingBottom: 10,
    marginTop: 26,
  },
  recommendedEventImage: {
    width: "100%",
    height: height * 0.15,
    resizeMode: "cover",
  },
  eventTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    margin: 5,
  },
  eventPrice: {
    color: "#21C064",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  eventDate: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },
  eventDateText: {
    color: "gray",
    fontSize: 12,
    marginLeft: 5,
  },
});
