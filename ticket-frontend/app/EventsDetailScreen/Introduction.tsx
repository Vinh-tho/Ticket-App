import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";

export default function Introduction({ event }: { event: any }) {
  const eventDetail = event?.eventDetails?.[0];
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLines = 3;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>GIỚI THIỆU</Text>
      <Text 
        style={[styles.description, !isExpanded && styles.collapsed]} 
        numberOfLines={isExpanded ? undefined : maxLines}
      >
        {eventDetail?.description || "Chưa có mô tả"}
      </Text>
      {eventDetail?.description && (
        <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
          <Text style={styles.expandButtonText}>
            {isExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
          </Text>
        </TouchableOpacity>
      )}
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
    marginBottom: 10,
    textAlign: "left",
  },
  description: {
    fontSize: 15,
    color: "#222",
    lineHeight: 24,
    textAlign: "justify",
    fontWeight: "500",
    paddingHorizontal: 2,
    letterSpacing: 0.3,
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