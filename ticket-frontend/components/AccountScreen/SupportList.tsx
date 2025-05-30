import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { IconSymbol } from "../ui/IconSymbol";

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
];

export default function SupportList() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hỗ trợ</Text>
      {supportItems.map((item, index) => (
        <TouchableOpacity key={index} style={styles.item}>
          <IconSymbol name={item.icon} size={18} color="gray" />
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
    elevation: 2, // Bóng đổ cho Android
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
    color: "black",
    marginLeft: 8,
  },
});
