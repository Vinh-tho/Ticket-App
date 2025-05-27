import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BASE_URL } from "@/constants/config";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

interface Event {
  id: number;
  mainImageUrl: string;
  eventName: string;
  eventDetails: {
    detailImageUrl: string;
    startTime: string;
    category?: string;
  }[];
  tickets: {
    id: number;
    type: string;
    price: number;
    quantity: number;
    status: string;
  }[];
}

export default function LiveMusicEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/events`);
        const data = await response.json();
        // Xáo trộn và lấy 4 sự kiện đầu tiên
        const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 4);
        setEvents(shuffled);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#21C064" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Nhạc sống</Text>
        <TouchableOpacity onPress={() => router.push("/index_creen/LiveMusicEventsAll") }>
          <Text style={styles.seeMore}>Xem thêm <MaterialIcons name="keyboard-arrow-right" size={18} color="gray" /></Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={events}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 10,
          alignItems: events.length < 3 ? 'flex-start' : 'stretch',
        }}
        renderItem={({ item }) => {
          // Tìm lịch diễn có startTime nhỏ nhất
          const sortedDetails = (item.eventDetails || []).filter(e => e.startTime).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          const firstDetail = sortedDetails[0];
          const formattedDate = firstDetail?.startTime 
            ? new Date(firstDetail.startTime).toLocaleDateString("vi-VN", {
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
              style={styles.eventContainer}
              activeOpacity={0.85}
              onPress={() => router.push(`/events_detail/${item.id}`)}
            >
              <View style={styles.imageWrapper}>
                <Image source={{ uri: firstDetail?.detailImageUrl || item.mainImageUrl }} style={styles.eventImage} />
                <View style={styles.imageOverlay} />
                <Text style={styles.eventTitleOverlay} numberOfLines={2}>{item.eventName}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.eventPrice}>Từ {formattedPrice}</Text>
                <View style={styles.eventDateContainer}>
                  <Ionicons name="calendar-outline" size={14} color="gray" />
                  <Text style={styles.eventDateText}>{formattedDate}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  seeMore: {
    color: "gray",
    fontSize: 14,
  },
  eventContainer: {
    backgroundColor: "#232323",
    borderRadius: 16,
    margin: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    width: width * 0.45,
  },
  imageWrapper: {
    width: "100%",
    height: height * 0.15,
    position: "relative",
    justifyContent: "flex-end",
  },
  eventImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  eventTitleOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoBox: {
    padding: 10,
  },
  eventPrice: {
    color: "#21C064",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
  },
  eventDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventDateText: {
    color: "gray",
    fontSize: 12,
    marginLeft: 5,
  },
});
