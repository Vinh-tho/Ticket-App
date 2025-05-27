import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supportItems = [
  { icon: "delete", label: "Xoá tài khoản" },
  { icon: "help-outline", label: "Câu hỏi thường gặp" },
  { icon: "call", label: "Liên hệ" },
  { icon: "description", label: "Quy chế hoạt động" },
  { icon: "lock", label: "Chính sách bảo mật thông tin" },
  { icon: "gavel", label: "Cơ chế giải quyết tranh chấp/khiếu nại" },
  { icon: "security", label: "Chính sách bảo mật thanh toán" },
  { icon: "cached", label: "Chính sách đổi trả và kiểm hàng" },
  { icon: "local-shipping", label: "Điều kiện vận chuyển và giao nhận" },
  { icon: "people", label: "Điều khoản sử dụng cho khách hàng" },
  { icon: "business", label: "Điều khoản sử dụng cho ban tổ chức" },
  { icon: "credit-card", label: "Phương thức thanh toán" },
  { icon: "logout", label: "Đăng xuất" },
];

export default function SupportList() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn đăng xuất?", [
      {
        text: "Huỷ",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("access_token");
          await SecureStore.deleteItemAsync("user_info");
          await AsyncStorage.removeItem("token"); // Xóa luôn token ở AsyncStorage
          router.replace("/LoginScreen");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hỗ trợ</Text>
      {supportItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.item}
          onPress={item.label === "Đăng xuất" ? handleLogout : undefined}
        >
          <MaterialIcons name={item.icon} size={24} color="#666" />
          <Text style={styles.text}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    bottom: -34,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
});
