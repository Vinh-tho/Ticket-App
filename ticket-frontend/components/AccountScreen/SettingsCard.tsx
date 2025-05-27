import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function SettingsCard() {
  return (
    <View style={styles.container}>
      {/* Tiêu đề */}
      <Text style={styles.title}>Cài đặt</Text>

      {/* Mục Ngôn ngữ */}
      <TouchableOpacity style={styles.option}>
        <MaterialIcons name="language" size={24} color="#666" />
        <Text style={styles.optionText}>Ngôn ngữ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    bottom: -20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
});
