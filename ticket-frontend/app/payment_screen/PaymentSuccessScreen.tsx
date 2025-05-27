import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { markOrderAsPaid } from "./api";

export default function PaymentSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    // Khi vào màn hình thành công, xác nhận thanh toán với backend
    const confirmPayment = async () => {
      try {
        const orderId = await AsyncStorage.getItem('lastOrderId');
        if (orderId) {
          const res = await markOrderAsPaid(Number(orderId));
          // Nếu backend trả về message đã thanh toán thì chỉ log thông tin, không log lỗi
          if (res?.message === 'Đơn hàng đã thanh toán' || res?.message === 'Cập nhật trạng thái thanh toán thành công') {
            console.log('Xác nhận thanh toán:', res.message);
          } else {
            // Nếu có message khác, vẫn log để debug
            console.log('Kết quả xác nhận thanh toán:', res);
          }
        }
      } catch (e: any) {
        // Nếu lỗi là do đơn hàng đã thanh toán thì không log lỗi
        if (e?.response?.data?.message === 'Đơn hàng đã thanh toán' || e?.response?.data?.message === 'Cập nhật trạng thái thanh toán thành công') {
          console.log('Xác nhận thanh toán:', e.response.data.message);
        } else {
          // Chỉ log lỗi thực sự khác
          console.log('Lỗi xác nhận thanh toán:', e);
        }
      } finally {
        // Xóa lastOrderId khi vào màn hình thành công
        AsyncStorage.removeItem('lastOrderId');
      }
    };
    confirmPayment();
  }, []);

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={90} color="#00FF99" style={{ marginBottom: 24 }} />
      <Text style={styles.title}>Thanh toán thành công!</Text>
      <Text style={styles.desc}>
        Cảm ơn bạn đã đặt vé. Thông tin vé đã được gửi về email hoặc bạn có thể xem trong mục "Vé của tôi".
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace("/(tabs)/Ticket")}> 
        <Ionicons name="ticket-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Xem vé của tôi</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: "#232526", marginTop: 12 }]} onPress={() => router.replace("/")}> 
        <Ionicons name="home-outline" size={22} color="#00FF99" style={{ marginRight: 8 }} />
        <Text style={[styles.buttonText, { color: "#00FF99" }]}>Về trang chủ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#18191A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#00FF99",
    fontWeight: "bold",
    fontSize: 28,
    marginBottom: 12,
    textAlign: "center",
  },
  desc: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00FF99",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 4,
  },
}); 