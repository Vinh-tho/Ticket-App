import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router"; // Import router
import { XCircle } from "phosphor-react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header() {
  const router = useRouter(); // Lấy router để điều hướng
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.replace("/")}
          style={styles.closeButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          activeOpacity={0.7}
        >
          <XCircle size={35} color="white" weight="fill" />
        </TouchableOpacity>
        <Text style={styles.title}>Đăng nhập</Text>
        <View style={styles.imageWrapper}>
          <Image
            source={require("../../assets/images/shiba.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#2ec276",
    paddingTop: 50, // khoảng cách với status bar
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: "absolute", // Trải rộng ngang màn hình
    width: "120%",
    height: 160,
  },
  header: {
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  closeButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    bottom: -30,
  },
  imageWrapper: {
    position: 'absolute',
    right: 20,
    top: 6,
    width: 120,
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
