import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { BASE_URL } from "@/constants/config";

const { width } = Dimensions.get("window");

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

const extractCityName = (address: string) => {
  // Tìm "Thành Phố" hoặc "Tỉnh" trong địa chỉ
  const cityMatch = address.match(/(Thành Phố|Tỉnh)\s+([^,]+)/i);
  if (cityMatch) {
    // Trả về phần tên thành phố sau từ "Thành Phố" hoặc "Tỉnh"
    return cityMatch[2].trim();
  }
  
  // Nếu không tìm thấy, tách theo dấu phẩy và lấy phần cuối
  const parts = address.split(',');
  const lastPart = parts[parts.length - 1].trim();
  // Loại bỏ "Thành Phố" hoặc "Tỉnh" nếu có
  return lastPart.replace(/(Thành Phố|Tỉnh)\s+/i, '').trim();
};

export default function InterestingDestinations() {
  const [destinations, setDestinations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch(`${BASE_URL}/events`);
        const data = await response.json();
        // Lấy ra các địa chỉ duy nhất và xử lý để chỉ lấy tên thành phố
        const addressSet = new Set();
        data.forEach((event: any) => {
          const location = event.eventDetails?.[0]?.location;
          if (location) {
            const cityName = extractCityName(location);
            addressSet.add(cityName);
          }
        });
        setDestinations(Array.from(addressSet) as string[]);
      } catch (error) {
        console.error("Lỗi khi lấy địa chỉ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#21C064" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Điểm đến thú vị</Text>
      <FlatList
        data={destinations}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.destinationContainer}
            onPress={() => router.push({
              pathname: "/index_creen/EventsByDestination",
              params: { destinationName: item }
            })}
          >
            <Image source={DESTINATION_IMAGES[item] || require("../../assets/images/splash.png")} style={styles.destinationImage} />
            <View style={styles.overlay} />
            <Text style={styles.destinationName}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    paddingLeft: 7,
  },
  sectionTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
  },
  destinationContainer: {
    position: "relative",
    width: width * 0.6,
    marginRight: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  destinationImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 16,
  },
  destinationName: {
    position: "absolute",
    bottom: 20,
    left: 20,
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});
