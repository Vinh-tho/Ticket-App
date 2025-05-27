import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from '@expo/vector-icons';

interface ApiSeat {
  id: number | undefined;
  seatNumber: string;
  status: "AVAILABLE" | "SOLD" | "HELD";
  zone: string;
  price: number;
  row: string;
  seatInRow: number;
}

interface SelectedSeatData {
  blockIdx: number;
  rowIdx: number;
  seatIdx: number;
  seatId?: number;
  seatDetails: ApiSeat;
  eventId?: number;
  ticketId?: number;
  eventDetailId?: number;
}

interface FixedButtonsProps {
  selectedSeats: SelectedSeatData[];
  setShowTicketInfo: (show: boolean) => void;
  setSelectedSeats: (seats: SelectedSeatData[]) => void;
}

export default function FixedButtons({ selectedSeats, setShowTicketInfo, setSelectedSeats }: FixedButtonsProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setShowTicketInfo(true);
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => {
      const price = Number(seat.seatDetails?.price);
      return total + (isNaN(price) ? 0 : price);
    }, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        {selectedSeats.length > 0 ? (
          <>
            <View style={styles.seatInfo}>
              <Ionicons name="ticket" size={24} color="#22c55e" />
              <View>
                <Text style={styles.seatText}>
                  {selectedSeats.length} ghế đã chọn
                </Text>
                <Text style={styles.priceText}>
                  {formatPrice(getTotalPrice())}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => {
                setSelectedSeats([]);
                setShowTicketInfo(false);
              }}
            >
              <Text style={styles.changeButtonText}>Chọn lại</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.noSeatText}>Vui lòng chọn ghế</Text>
        )}
      </View>

      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedSeats.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handlePress}
          disabled={selectedSeats.length === 0}
        >
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seatInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  seatText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  priceText: {
    color: "#22c55e",
    fontSize: 14,
    marginLeft: 8,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#2c313a",
  },
  changeButtonText: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "600",
  },
  noSeatText: {
    color: "#666",
    fontSize: 16,
  },
  buttonContainer: {
    width: "100%",
  },
  continueButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#2c313a",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
});