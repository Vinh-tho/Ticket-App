import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Gift {
  id: number;
  name: string;
  image: string;
}

interface PaymentGiftSelectProps {
  gifts: Gift[];
  selectedGifts: number[];
  setSelectedGifts: (ids: number[]) => void;
}

export default function PaymentGiftSelect({ gifts, selectedGifts, setSelectedGifts }: PaymentGiftSelectProps) {
  const selectGift = (giftId: number) => {
    if (selectedGifts[0] === giftId) {
      setSelectedGifts([]); // bỏ chọn nếu click lại
    } else {
      setSelectedGifts([giftId]); // chỉ chọn 1 món quà
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialIcons name="card-giftcard" size={22} color="#00FF99" />
        <Text style={styles.title}>Quà tặng</Text>
      </View>
      
      <View style={styles.giftList}>
        {gifts.map(gift => (
          <TouchableOpacity
            key={gift.id}
            style={[
              styles.giftItem,
              selectedGifts[0] === gift.id && styles.giftItemSelected
            ]}
            onPress={() => selectGift(gift.id)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: gift.image }} style={styles.giftImage} />
            <Text style={styles.giftName}>
              {gift.name}
            </Text>
            {selectedGifts[0] === gift.id && (
              <View style={styles.checkmarkContainer}>
                <MaterialIcons name="check-circle" size={20} color="#00FF99" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#232526',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  giftList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  giftItem: {
    width: '31%',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444444',
  },
  giftItemSelected: {
    borderColor: '#00FF99',
    borderWidth: 2,
    backgroundColor: 'rgba(0, 255, 153, 0.1)',
  },
  giftImage: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  giftName: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    height: 36,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
}); 