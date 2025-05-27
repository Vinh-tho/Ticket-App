import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BASE_URL } from "@/constants/config";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

const DESTINATION_IMAGES: Record<string, any> = {
  "Hà Nội": require("../../assets/city/HaNoi.png"),
  "Hồ Chí Minh": require("../../assets/city/HoChiMinh.png"),
  "Đà Nẵng": require("../../assets/city/DaNang.png"),
  "Hải Phòng": require("../../assets/city/HaiPhong.png"),
  "Cần Thơ": require("../../assets/city/CanTho.png"),
  "Đà Lạt": require("../../assets/city/DaLat.png"),
  "Nha Trang": require("../../assets/city/NhaTrang.png"),
  "Vũng Tàu": require("../../assets/city/VungTau.png"),
  // Thêm các địa chỉ khác nếu muốn
};

interface Event {
  id: number;
  mainImageUrl: string;
  eventName: string;
  eventDetails: {
    detailImageUrl: string;
    startTime: string;
    price: number;
    location?: string;
  }[];
}

export default function EventsByDestination() {
  const { destinationName } = useLocalSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/events`);
        const data = await response.json();
        // Lọc sự kiện theo địa điểm (location)
        const filtered = data.filter((event: Event) => {
          const location = event.eventDetails?.[0]?.location || "";
          return location.includes(destinationName as string);
        });
        setEvents(filtered);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sự kiện:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [destinationName]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrapper}>
        <Image
          source={DESTINATION_IMAGES[destinationName as string] || require('../../assets/images/splash.png')}
          style={styles.headerBg}
          blurRadius={8}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.2)']}
          style={styles.headerOverlay}
        />
        <View style={[styles.header, { paddingTop: insets.top }]}> 
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            <Ionicons name="location-outline" size={20} color="red" /> Sự kiện tại {destinationName}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#21C064" style={{ flex: 1, justifyContent: 'center' }} />
        ) : events.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={60} color="#21C064" />
            <Text style={styles.emptyText}>Không có sự kiện nào tại địa điểm này</Text>
          </View>
        ) : (
          <FlatList
            data={events}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
            renderItem={({ item }) => {
              const sortedDetails = (item.eventDetails || []).filter(e => e.startTime).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
              const firstDetail = sortedDetails[0];
              const formattedDate = firstDetail?.startTime 
                ? new Date(firstDetail.startTime).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })
                : "Chưa có ngày";
              const formattedPrice = firstDetail?.price 
                ? `${firstDetail.price.toLocaleString('vi-VN')} đ`
                : "Miễn phí";
              return (
                <TouchableOpacity
                  style={styles.eventContainer}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/events_detail/${item.id}`)}
                >
                  <View style={styles.imageWrapper}>
                    {firstDetail?.price === 0 && (
                      <View style={styles.tagBox}>
                        <Text style={styles.tagText}>Miễn phí</Text>
                      </View>
                    )}
                    <Image source={{ uri: firstDetail?.detailImageUrl || item.mainImageUrl }} style={styles.eventImage} />
                    <LinearGradient
                      colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.7)"]}
                      style={styles.imageOverlay}
                    />
                    <Text style={styles.eventTitleOverlay} numberOfLines={2}>{item.eventName}</Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.eventPrice}>Từ {formattedPrice}</Text>
                    <View style={styles.eventDateContainer}>
                      <Ionicons name="calendar-outline" size={14} color="#21C064" />
                      <Text style={styles.eventDateText}>{formattedDate}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerWrapper: {
    position: 'relative',
    height: 110,
    marginBottom: 10,
  },
  headerBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    textAlign: 'center',
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 5,
    paddingBottom: 20,
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
  tagBox: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#21C064',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 2,
  },
  tagText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  eventImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
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
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
}); 