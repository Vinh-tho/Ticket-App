import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

export interface PaymentOrderCardProps {
  ticketType: string;
  ticketPrice: number;
  seatLabel: string;
  total: number;
  selectedSeats: Array<any>; // Thay đổi kiểu dữ liệu để linh hoạt hơn
}

export default function PaymentOrderCard({ ticketType, ticketPrice, seatLabel, total, selectedSeats }: PaymentOrderCardProps) {
  // Ghi log thông tin ghế để debug
  useEffect(() => {
    console.log('PaymentOrderCard selectedSeats:', JSON.stringify(selectedSeats, null, 2));
  }, [selectedSeats]);

  const formatSeatDisplay = (seat: any) => {
    // Nếu seat có thuộc tính seat là chuỗi
    if (typeof seat.seat === 'string') {
      return seat.seat;
    }
    
    // Nếu seat có seatDetails với row và number
    if (seat.seatDetails?.row && seat.seatDetails?.number) {
      return `${seat.seatDetails.row}-${seat.seatDetails.number}`;
    }
    
    // Fallback
    return seat.seatId || 'Không xác định';
  };

  // Hàm lấy loại vé phù hợp
  const getTicketType = (seat: any) => {
    // Kiểm tra các thuộc tính có thể chứa thông tin loại vé theo thứ tự ưu tiên
    if (seat.seatDetails?.ticket?.type) {
      console.log('Lấy loại vé từ seat.seatDetails.ticket.type:', seat.seatDetails.ticket.type);
      return seat.seatDetails.ticket.type;
    }
    if (seat.type) {
      console.log('Lấy loại vé từ seat.type:', seat.type);
      return seat.type;
    }
    if (seat.ticket?.type) {
      console.log('Lấy loại vé từ seat.ticket.type:', seat.ticket.type);
      return seat.ticket.type;
    }
    if (seat.ticketType) {
      console.log('Lấy loại vé từ seat.ticketType:', seat.ticketType);
      return seat.ticketType;
    }
    if (ticketType) {
      console.log('Lấy loại vé từ props ticketType:', ticketType);
      return ticketType;
    }
    
    console.log('Không tìm thấy loại vé, sử dụng mặc định "Tiêu chuẩn"');
    console.log('Cấu trúc seat:', JSON.stringify(seat, null, 2));
    return "Tiêu chuẩn";
  };

  // Kiểm tra xem có dữ liệu ghế không
  const hasSeats = selectedSeats && selectedSeats.length > 0;

  return (
    <View style={styles.ticketOrderCard}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="confirmation-number" size={22} color="#00FF99" style={{ marginRight: 8 }} />
          <Text style={styles.ticketOrderTitle}>Thông tin đặt vé</Text>
        </View>
      </View>
      
      {hasSeats ? (
        selectedSeats.map((seat, index) => (
          <View key={seat.seatId || seat.id || index} style={styles.ticketOrderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ticketOrderType}>
                {getTicketType(seat)}
              </Text>
              <Text style={styles.ticketSeat}>
                Ghế: <Text style={{fontWeight: 'bold'}}>{formatSeatDisplay(seat)}</Text>
              </Text>
              <View style={styles.ticketOrderSeatBox}>
                <Text style={styles.ticketOrderSeat}>Giá: {(seat.price || seat.seatDetails?.ticket?.price || 0).toLocaleString('vi-VN')} đ</Text>
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.ticketOrderQty}>{seat.quantity || '01'}</Text>
              <Text style={styles.ticketOrderPrice}>{(seat.price || seat.seatDetails?.ticket?.price || 0).toLocaleString('vi-VN')} đ</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.noDataContainer}>
          <MaterialIcons name="info-outline" size={24} color="#FF9500" />
          <Text style={styles.noDataText}>Không có thông tin vé</Text>
        </View>
      )}
      
      <View style={styles.ticketOrderDivider} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <MaterialIcons name="receipt" size={20} color="#00FF99" style={{ marginRight: 8 }} />
        <Text style={styles.ticketOrderTitle}>Thông tin đơn hàng</Text>
      </View>
      <View style={styles.ticketOrderRowSimple}>
        <Text style={styles.ticketOrderLabel}>Tạm tính ({selectedSeats.length} ghế)</Text>
        <Text style={styles.ticketOrderValue}>{total.toLocaleString('vi-VN')} đ</Text>
      </View>
      <View style={styles.ticketOrderDivider} />
      <View style={styles.ticketOrderRowSimple}>
        <Text style={styles.ticketOrderLabelBold}>Tổng tiền</Text>
        <Text style={styles.ticketOrderValueBold}>{total.toLocaleString('vi-VN')} đ</Text>
      </View>
      <Text style={styles.ticketOrderNote}>
        Bằng việc tiến hành đặt mua, bạn đã đồng ý với{" "}
        <Text style={styles.ticketOrderLink}>Điều Kiện Giao Dịch Chung</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ticketOrderCard: {
    backgroundColor: "#232526",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    marginTop: 8,
    shadowColor: "#00FF99",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  ticketOrderTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 0,
  },
  ticketOrderChange: {
    color: "#00FF99",
    fontWeight: "bold",
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,255,153,0.08)',
  },
  ticketOrderRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    marginTop: 8,
  },
  ticketOrderLabel: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  ticketOrderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  ticketOrderType: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  ticketSeat: {
    color: "#eee",
    fontSize: 14,
    marginTop: 4,
  },
  ticketOrderQty: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  ticketOrderPrice: {
    color: "#00FF99",
    fontSize: 14,
    marginTop: 2,
  },
  ticketOrderSeatBox: {
    backgroundColor: "#FFD966",
    borderRadius: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketOrderSeat: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 14,
  },
  ticketOrderDivider: {
    height: 1,
    backgroundColor: "#00FF99",
    marginVertical: 14,
    opacity: 0.2,
  },
  ticketOrderRowSimple: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  ticketOrderValue: {
    color: "#fff",
    fontSize: 15,
  },
  ticketOrderLabelBold: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  ticketOrderValueBold: {
    color: "#00FF99",
    fontWeight: "bold",
    fontSize: 20,
  },
  ticketOrderNote: {
    color: "#bbb",
    fontSize: 13,
    marginTop: 10,
  },
  ticketOrderLink: {
    color: "#00FF99",
    textDecorationLine: "underline",
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    flexDirection: 'row',
  },
  noDataText: {
    color: '#FF9500',
    marginLeft: 8,
    fontSize: 16,
  },
});
