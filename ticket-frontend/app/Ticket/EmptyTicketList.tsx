import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { EmptyTicketListProps } from './types';
import { emptyStyles } from './styles';

export default function EmptyTicketList({ onBrowsePress }: EmptyTicketListProps) {
  return (
    <View style={emptyStyles.emptyContainer}>
      <Image 
        source={require('../../assets/images/avatar.png')} 
        style={emptyStyles.emptyImage}
        defaultSource={require('../../assets/images/avatar.png')}
      />
      <Text style={emptyStyles.emptyTitle}>Chưa có vé nào</Text>
      <Text style={emptyStyles.emptyText}>
        Bạn chưa có vé nào. Hãy mua vé để tham gia sự kiện!
      </Text>
      <TouchableOpacity 
        style={emptyStyles.browseButton}
        onPress={onBrowsePress}
      >
        <Text style={emptyStyles.browseButtonText}>Khám phá sự kiện</Text>
      </TouchableOpacity>
    </View>
  );
} 