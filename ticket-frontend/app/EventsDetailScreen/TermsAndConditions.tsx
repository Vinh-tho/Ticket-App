import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";

export default function TermsAndConditions() {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLines = 8;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>ĐIỀU KHOẢN VÀ ĐIỀU KIỆN</Text>
      <Text 
        style={[styles.description, !isExpanded && styles.collapsed]}
        numberOfLines={isExpanded ? undefined : maxLines}
      >
        <Text style={styles.articleTitle}>Điều 1. Độ tuổi tham gia{"\n"}</Text>
        • Chương trình dành cho đối tượng khán giả trên 16 tuổi.{"\n"}
        • Khán giả từ 10-15 tuổi tham gia chương trình phải có người giám hộ đi kèm (người giám hộ phải từ 18 tuổi trở lên, một người giám hộ kèm một trẻ vị thành niên) để quản lý và chịu hoàn toàn trách nhiệm nếu có bất kỳ sự cố nào xảy ra trong sự kiện.{"\n\n"}

        <Text style={styles.articleTitle}>Điều 2. Sức khỏe{"\n"}</Text>
        • Phụ nữ mang thai và người có vấn đề về sức khoẻ tự cân nhắc khi tham gia chương trình.{"\n"}
        • Trong trường hợp có vấn đề xảy ra, BTC không chịu trách nhiệm.{"\n\n"}

        <Text style={styles.articleTitle}>Điều 3. Quy định về vé{"\n"}</Text>
        • Mỗi vé chỉ dành cho một khán giả tham dự, không kèm trẻ em và trẻ vị thành niên.{"\n"}
        • Người giám hộ đi kèm theo khán giả vị thành niên phải mua vé để tham dự.{"\n\n"}

        <Text style={styles.articleTitle}>Điều 4. Chính sách vé{"\n"}</Text>
        • Vé đã mua không được đổi hoặc hoàn trả dưới mọi hình thức.{"\n"}
        • Khán giả có trách nhiệm tự bảo quản, bảo mật thông tin mã vé của mình.{"\n"}
        • BTC từ chối giải quyết trường hợp có nhiều hơn một người check-in cùng một mã vé.{"\n"}
        • Theo quy định, BTC cho phép người check-in đầu tiên mã vé bị trùng được tham dự sự kiện.{"\n\n"}

        <Text style={styles.articleTitle}>Điều 5. Kiểm tra thông tin{"\n"}</Text>
        • Hãy kiểm tra kỹ thông tin trước khi đặt vé, BTC không hỗ trợ đổi chặng hay hoàn tiền đối với những trường hợp đặt nhầm chặng/hạng vé.{"\n\n"}

        <Text style={styles.articleTitle}>Điều 6. Nguồn mua vé{"\n"}</Text>
        • Vui lòng không mua vé từ bất kỳ nguồn nào khác ngoài Ticketbox tránh trường hợp vé giả hoặc lừa đảo.{"\n"}
        • BTC từ chối giải quyết cho những trường hợp mua vé từ nguồn khác nếu có vấn đề hay tranh chấp xảy ra.{"\n\n"}

        <Text style={styles.articleTitle}>Điều 7. Quyền sử dụng hình ảnh{"\n"}</Text>
        • Khi tham gia chương trình, khán giả đồng ý với việc hình ảnh của mình được sử dụng để khai thác cho sản phẩm ghi hình, thu âm, quảng bá cho chương trình.{"\n\n"}

        <Text style={styles.articleTitle}>Điều 8. Trách nhiệm cá nhân{"\n"}</Text>
        • Khán giả tham dự sự kiện phải tự ý thức và có trách nhiệm bảo vệ sức khoẻ của bản thân khi tham gia.{"\n"}
        • Khi tham gia show đồng nghĩa với việc khán giả đã cân nhắc về các vấn đề bao gồm điều kiện thời tiết bất lợi trước, trong hoặc sau sự kiện, các rủi ro từ tình trạng sức khỏe hiện có hoặc trong quá trình di chuyển đi và đến từ địa điểm.{"\n\n"}

        <Text style={styles.articleTitle}>Điều 9. Quy định bổ sung{"\n"}</Text>
        • Vui lòng theo dõi thêm và tuân thủ các quy định cũng như những đồ dùng bị cấm mang sẽ được đăng tải tại trang Facebook của chương trình trước khi chương trình được diễn ra.
      </Text>
      <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
        <Text style={styles.expandButtonText}>
          {isExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#222",
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "left",
  },
  description: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    textAlign: "justify",
    letterSpacing: 0.3,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    letterSpacing: 0.5,
  },
  collapsed: {
    overflow: "hidden",
  },
  expandButton: {
    marginTop: 12,
    alignItems: "center",
  },
  expandButtonText: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "600",
  },
});