import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, ColorValue } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function PaymentCountdown({ initialSeconds = 900 }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  useEffect(() => {
    // Tạo hiệu ứng nhịp đập khi thời gian còn ít
    if (seconds < 60) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [seconds < 60]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  // Xác định màu sắc dựa trên thời gian còn lại
  const getColors = (): [string, string] => {
    if (seconds < 60) return ['#FF3B30', '#FF9500']; // Đỏ khi còn ít thời gian
    if (seconds < 300) return ['#FF9500', '#FFCC00']; // Cam khi còn dưới 5 phút
    return ['#00FF99', '#00B14F']; // Xanh lá khi còn nhiều thời gian
  };

  return (
    <LinearGradient 
      colors={['#18191A', '#232526'] as [string, string]} 
      style={styles.countdownCard}
    >
      <View style={styles.contentContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <MaterialIcons name="timer" size={22} color="#00FF99" style={{ marginRight: 8 }} />
          <Text style={styles.countdownLabel}>Hoàn tất thanh toán trong</Text>
      </View>
        
        <Animated.View 
          style={[
            styles.countdownBox,
            {transform: [{ scale: seconds < 60 ? pulseAnim : 1 }]}
          ]}
        >
          <LinearGradient 
            colors={getColors()} 
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 0}}
            style={styles.timeGradient}
          >
        <Text style={styles.countdownTime}>{mm}</Text>
          </LinearGradient>
          
        <Text style={styles.countdownColon}>:</Text>
          
          <LinearGradient 
            colors={getColors()}
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 0}}
            style={styles.timeGradient}
          >
        <Text style={styles.countdownTime}>{ss}</Text>
          </LinearGradient>
        </Animated.View>
        
        <Text style={styles.countdownNote}>
          Đơn hàng sẽ tự động hủy sau khi hết thời gian
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  countdownCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  contentContainer: {
    padding: 16,
    alignItems: 'center',
  },
  countdownLabel: { 
    color: "#fff", 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  countdownBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 8,
    justifyContent: 'center',
  },
  timeGradient: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  countdownTime: { 
    color: "#000", 
    fontWeight: "bold", 
    fontSize: 28,
    textAlign: 'center',
  },
  countdownColon: { 
    color: "#00FF99", 
    fontWeight: "bold", 
    fontSize: 28, 
    marginHorizontal: 8,
    textShadowColor: 'rgba(0,255,153,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  countdownNote: {
    color: '#999',
    fontSize: 12,
    marginTop: 8,
  }
});
