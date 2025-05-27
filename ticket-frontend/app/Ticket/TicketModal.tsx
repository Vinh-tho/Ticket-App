import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from './types';
import { formatCurrency } from './utils';

interface TicketModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
  onPayOrder?: (order: Order) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'paid':
      return '#21C064';
    case 'confirmed':
      return '#007AFF';
    case 'pending':
      return '#FF9500';
    case 'cancelled':
      return '#FF3B30';
    default:
      return '#8E8E93';
  }
};

const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'Hoàn thành';
    case 'paid':
      return 'Đã thanh toán';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'pending':
      return 'Đang xử lý';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

const formatSeat = (seat: string) => {
  // Tách theo nhóm chữ đầu, nhóm chữ zone, và phần còn lại (số, dấu -)
  // VD: VIPC-5 => VIP C-5, PremiumG-5 => Premium G-5
  const match = seat.match(/^([A-Za-z]+?)([A-Z])(-.*)$/);
  if (match) {
    return `${match[1]} ${match[2]}${match[3]}`.trim();
  }
  return seat;
};

const TicketItem = ({ ticket }: { ticket: any }) => {
  return (
    <View style={styles.ticketItem}>
      <View style={styles.ticketHeader}>
        <Text style={styles.eventName}>{ticket.eventName}</Text>
        <Text style={styles.ticketType}>{ticket.type}</Text>
      </View>
      
      <View style={styles.ticketDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
          <Text style={styles.detailText}>{ticket.eventDate}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={20} color="#8E8E93" />
          <Text style={styles.detailText}>{ticket.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="ticket-outline" size={20} color="#8E8E93" />
          <Text style={styles.detailText}>Ghế: </Text>
          {Array.isArray(ticket.seat) ? ticket.seat.map((s: string, idx: number) => (
            <View key={idx} style={styles.seatBadge}>
              <Text style={styles.seatText}>{formatSeat(s)}</Text>
            </View>
          )) : (
            <View style={styles.seatBadge}>
              <Text style={styles.seatText}>{formatSeat(ticket.seat)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={20} color="#8E8E93" />
          <Text style={styles.detailText}>{formatCurrency(ticket.price)}</Text>
        </View>
      </View>
    </View>
  );
};

export default function TicketModal({ visible, onClose, order, onPayOrder }: TicketModalProps) {
  if (!order) return null;

  const statusColor = getStatusColor(order.status);
  const statusText = getStatusText(order.status);
  
  // Điều kiện hiển thị nút thanh toán: Chỉ hiển thị với đơn hàng chưa thanh toán
  const needsPayment = 
    order.status.toLowerCase() === 'unpaid' || 
    (order.status.toLowerCase() === 'pending' && 
     (!order.paymentStatus || order.paymentStatus.toLowerCase() !== 'paid'));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.orderInfo}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>Đơn hàng #{order.orderNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.statusText}>{statusText}</Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
                  <Text style={styles.detailText}>Ngày đặt: {order.orderDate}</Text>
                </View>
                
                {order.paymentMethod && (
                  <View style={styles.detailRow}>
                    <Ionicons name="card-outline" size={20} color="#8E8E93" />
                    <Text style={styles.detailText}>Thanh toán: {order.paymentMethod}</Text>
                  </View>
                )}
                
              </View>
              
              {needsPayment && (
                <View style={styles.paymentAlert}>
                  <Ionicons name="alert-circle" size={20} color="#FF9500" />
                  <Text style={styles.paymentAlertText}>
                    Đơn hàng của bạn đang chờ thanh toán
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.ticketsSection}>
              <Text style={styles.sectionTitle}>Danh sách vé</Text>
              {order.tickets.map((ticket, index) => (
                <TicketItem key={index} ticket={ticket} />
              ))}
            </View>

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Tổng tiền</Text>
              <Text style={styles.totalAmount}>{formatCurrency(order.totalAmount)}</Text>
            </View>
          </ScrollView>

          {needsPayment && onPayOrder && (
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => onPayOrder(order)}
            >
              <Ionicons name="wallet-outline" size={20} color="#FFFFFF" style={styles.payButtonIcon} />
              <Text style={styles.payButtonText}>Thanh toán ngay</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Dimensions.get('window').height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  orderInfo: {
    padding: 16,
    backgroundColor: '#F8F8F8',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },
  ticketsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  ticketItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  ticketType: {
    fontSize: 14,
    color: '#8E8E93',
  },
  ticketDetails: {
    marginTop: 8,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    backgroundColor: '#FFFFFF',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#21C064',
  },
  seatBadge: {
    backgroundColor: '#E0F7FA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 4,
    marginRight: 16,
  },
  seatText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  paymentAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  paymentAlertText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  payButton: {
    backgroundColor: '#21C064',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  payButtonIcon: {
    marginRight: 8,
  },
}); 