import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated, Dimensions, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

interface SeatBlock {
  color: string;
  price: number;
  name: string;
  rows: Array<{
    label: string;
    seats: number;
  }>;
  eventId?: number;
  ticketType?: { id: number };
}

interface ApiSeat {
  id: number | undefined;
  seatNumber: string;
  status: "AVAILABLE" | "SOLD" | "HELD";
  zone: string;
  price: number;
  row: string;
  seatInRow: number;
  ticket?: {
    id: number;
    type: string;
    price: string;
    quantity: number;
    status: string;
  };
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

interface SeatDetailModalProps {
  visible: boolean;
  selectedSeats: SelectedSeatData[];
  seatBlocks: SeatBlock[];
  legendTicketTypes: { name: string; price: number; color: string; id?: number }[];
  onClose: () => void;
  eventDetailId: number | undefined;
}

export default function SeatDetailModal({
  visible,
  selectedSeats,
  seatBlocks,
  legendTicketTypes,
  onClose,
  eventDetailId,
}: SeatDetailModalProps) {
  const router = useRouter();
  const slideAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => {
      const price = Number(seat.seatDetails?.price);
      return total + (isNaN(price) ? 0 : price);
    }, 0);
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View 
        style={[
          styles.modalContainer,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY }] }
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.modalTitle}>Thông tin các ghế đã chọn</Text>
          
          <ScrollView style={styles.seatsList}>
            {selectedSeats.map((selectedSeat, index) => {
              const selectedBlock = seatBlocks[selectedSeat.blockIdx];
              const selectedRow = selectedBlock.rows[selectedSeat.rowIdx];
              const seatNumber = selectedSeat.seatIdx + 1;
              const ticketType = legendTicketTypes.find(t => t.name === selectedBlock.name);
              const price = ticketType ? ticketType.price : 0;

              return (
                <View key={index} style={styles.seatCard}>
                  <View style={styles.header}>
                    <View style={[styles.seatIndicator, { backgroundColor: selectedBlock.color }]} />
                    <Text style={styles.zoneTitle}>{selectedBlock.name}</Text>
                  </View>
                  <View style={styles.seatInfoContainer}>
                    <View style={styles.seatInfoRow}>
                      <Ionicons name="location" size={20} color="#00FF99" />
                      <Text style={styles.seatInfoText}>
                        Khu vực: {selectedBlock.name}
                      </Text>
                    </View>
                    <View style={styles.seatInfoRow}>
                      <Ionicons name="grid" size={20} color="#00FF99" />
                      <Text style={styles.seatInfoText}>
                        Hàng: {selectedRow.label}
                      </Text>
                    </View>
                    <View style={styles.seatInfoRow}>
                      <Ionicons name="ticket" size={20} color="#00FF99" />
                      <Text style={styles.seatInfoText}>
                        Số ghế: {seatNumber}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Giá vé</Text>
                    <Text style={styles.priceValue}>
                      {formatPrice(price)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Tổng tiền</Text>
            <Text style={styles.totalValue}>{formatPrice(getTotalPrice())}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                const firstSelectedSeat = selectedSeats[0];
                
                const seatsDataForPayment = selectedSeats.map(seat => {
                  const selectedBlock = seatBlocks[seat.blockIdx];
                  const ticketType = legendTicketTypes.find(t => t.name === selectedBlock.name);
                  const price = Number(seat.seatDetails?.price || seat.price || 0);
                  
                  return {
                    seatId: seat.seatId,
                    ticketId: ticketType?.id || seat.seatDetails?.ticket?.id,
                    price: Number(price.toFixed(2)),
                    quantity: 1,
                    eventDetailId: eventDetailId
                  };
                }).filter(seat => seat.seatId && seat.ticketId);

                router.push({
                  pathname: "/payment_screen/PaymentScreen",
                  params: {
                    eventId: firstSelectedSeat?.eventId ? String(firstSelectedSeat.eventId) : undefined,
                    ticketId: firstSelectedSeat?.ticketId ? String(firstSelectedSeat.ticketId) : undefined,
                    selectedSeatsData: JSON.stringify(seatsDataForPayment),
                    eventDetailId: eventDetailId ? String(eventDetailId) : undefined,
                  },
                } as any);
              }}
            >
              <Ionicons name="card" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Thanh toán ngay</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={20} color="#00FF99" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Chọn ghế khác</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000a",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  seatsList: {
    maxHeight: 400,
  },
  seatCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  seatIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  zoneTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  seatInfoContainer: {
    marginBottom: 16,
  },
  seatInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  seatInfoText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 12,
  },
  priceContainer: {
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00FF99",
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF99',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#00FF99",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#00FF99",
  },
  secondaryButtonText: {
    color: "#00FF99",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
});