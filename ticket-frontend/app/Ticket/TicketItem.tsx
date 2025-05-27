import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TicketItemProps } from './types';
import { ticketStyles } from './styles';
import { getStatusColor, formatStatus } from './utils';

export default function TicketItem({ item, onPress }: TicketItemProps) {
  const statusColor = getStatusColor(item.status);
  const formattedStatus = formatStatus(item.status);

  return (
    <TouchableOpacity
      style={ticketStyles.ticketItem}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={ticketStyles.ticketHeader}>
        <View style={ticketStyles.eventInfo}>
          <Text style={ticketStyles.ticketTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.eventName && item.eventName !== "Không xác định" 
              ? item.eventName 
              : `Vé ${item.type} - Ghế ${item.seat}`}
          </Text>
          {item.eventDate && (
            <Text style={ticketStyles.ticketDate}>
              <Ionicons name="calendar-outline" size={14} color="#666" /> {item.eventDate}
            </Text>
          )}
        </View>
        <View style={[ticketStyles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[ticketStyles.statusText, { color: statusColor }]}>
            {formattedStatus}
          </Text>
        </View>
      </View>

      <View style={ticketStyles.ticketDivider} />
      
      <View style={ticketStyles.ticketDetails}>
        <View style={ticketStyles.detailRow}>
          <Text style={ticketStyles.detailLabel}>Loại vé:</Text>
          <Text style={ticketStyles.detailValue}>{item.type}</Text>
        </View>
        
        <View style={ticketStyles.detailRow}>
          <Text style={ticketStyles.detailLabel}>Ghế:</Text>
          <Text style={ticketStyles.detailValue}>{item.seat}</Text>
        </View>
        
        {item.location && (
          <View style={ticketStyles.detailRow}>
            <Text style={ticketStyles.detailLabel}>Địa điểm:</Text>
            <Text style={ticketStyles.detailValue} numberOfLines={1}>{item.location}</Text>
          </View>
        )}
        
        <View style={ticketStyles.detailRow}>
          <Text style={ticketStyles.detailLabel}>Ngày mua:</Text>
          <Text style={ticketStyles.detailValue}>{item.orderDate}</Text>
        </View>
      </View>
      
      <View style={ticketStyles.ticketFooter}>
        <Text style={ticketStyles.viewDetails}>
          Xem chi tiết <Ionicons name="chevron-forward" size={14} color="#21C064" />
        </Text>
      </View>
    </TouchableOpacity>
  );
} 