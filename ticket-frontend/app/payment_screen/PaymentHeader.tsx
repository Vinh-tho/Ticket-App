import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentHeader({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={styles.placeholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#00B14F",
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  placeholder: {
    width: 26,
  },
});
