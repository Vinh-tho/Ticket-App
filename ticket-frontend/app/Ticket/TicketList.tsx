import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Order } from './types';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from './utils';

interface TicketListProps {
  orders: Order[];
  onOrderPress: (order: Order) => void;
  refreshing: boolean;
  onRefresh: () => void;
  onBrowsePress: () => void;
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

const OrderItem = ({ order, onPress }: { order: Order; onPress: () => void }) => {
  const statusColor = getStatusColor(order.status);
  const statusText = getStatusText(order.status);
  
  // Đơn hàng cần thanh toán khi:
  // 1. Trạng thái là 'unpaid' HOẶC
  // 2. Trạng thái là 'pending' VÀ paymentStatus không phải 'paid'
  const needsPayment = 
    order.status.toLowerCase() === 'unpaid' || 
    (order.status.toLowerCase() === 'pending' && 
     (!order.paymentStatus || order.paymentStatus.toLowerCase() !== 'paid'));

  return (
    <TouchableOpacity style={styles.orderItem} onPress={onPress}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Đơn hàng #{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{order.orderDate}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>

      <View style={styles.ticketSummary}>
        <Text style={styles.eventName} numberOfLines={1}>
          {order.tickets[0]?.eventName || 'Không xác định'}
        </Text>
        <Text style={styles.ticketCount}>
          {order.tickets.length} {order.tickets.length > 1 ? 'vé' : 'vé'}
        </Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>{formatCurrency(order.totalAmount)}</Text>
        {needsPayment ? (
          <TouchableOpacity
            style={styles.payNowButton}
            onPress={onPress}
          >
            <Text style={styles.payNowText}>Thanh toán ngay</Text>
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const EmptyList = ({ onBrowsePress }: { onBrowsePress: () => void }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="ticket-outline" size={64} color="#8E8E93" />
    <Text style={styles.emptyTitle}>Bạn chưa có vé nào</Text>
    <Text style={styles.emptySubtitle}>
      Hãy khám phá các sự kiện và mua vé ngay hôm nay
    </Text>
    <TouchableOpacity style={styles.browseButton} onPress={onBrowsePress}>
      <Text style={styles.browseButtonText}>Khám phá sự kiện</Text>
    </TouchableOpacity>
  </View>
);

export default function TicketList({ orders, onOrderPress, refreshing, onRefresh, onBrowsePress }: TicketListProps) {
  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <OrderItem order={item} onPress={() => onOrderPress(item)} />}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#21C064" />
      }
      ListEmptyComponent={<EmptyList onBrowsePress={onBrowsePress} />}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
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
  ticketSummary: {
    marginBottom: 12,
  },
  eventName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  ticketCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  payNowButton: {
    backgroundColor: '#21C064',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  payNowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#21C064',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 