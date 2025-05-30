import { View, Text, StyleSheet } from "react-native";

export default function CompanyInfo() {
  return (
    <View style={styles.container}>
      <Text style={styles.version}>Phiên bản 3.0.39</Text>
      <Text style={styles.text}>Công ty TNHH Ticketbox</Text>
      <Text style={styles.text}>Đại diện theo pháp luật: Phạm Thị Hường</Text>
      <Text style={styles.text}>
        Địa chỉ: Tầng 12, Tòa nhà Viettel, 285 Cách Mạng Tháng Tám, Phường 12,
        Quận 10, TP. Hồ Chí Minh
      </Text>
      <Text style={styles.text}>
        Tel: 1900.6408 - Hotline: support@ticketbox.vn
      </Text>
      <Text style={styles.text}>
        Giấy chứng nhận đăng ký doanh nghiệp số: 0313605444, cấp lần đầu ngày
        07/01/2016 bởi Sở Kế Hoạch và Đầu Tư TP. Hồ Chí Minh
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    bottom: -35,
  },
  version: {
    color: "gray",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  text: {
    color: "#8E8E93", // Màu xám nhạt giống hình
    fontSize: 14,
    textAlign: "left",
    marginBottom: 0,
  },
});
