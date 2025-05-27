import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PaymentTicketInfoProps {
  email?: string;
}

export default function PaymentTicketInfo({ email }: PaymentTicketInfoProps) {
  return (
    <LinearGradient
      colors={['#232526', '#1F2021']} 
      start={{x: 0, y: 0}} 
      end={{x: 0, y: 1}} 
      style={styles.sectionCard}
    >
      <View style={styles.headerContainer}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="email" size={20} color="#00FF99" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Thông tin nhận vé</Text>
          <Text style={styles.sectionDesc}>
            Vé điện tử sẽ được hiển thị trong mục{" "}
            <Text style={{ fontWeight: "bold", color: "#00FF99" }}>
              "Vé của tôi"
            </Text> của tài khoản
          </Text>
        </View>
      </View>
      
      <View style={styles.emailContainer}>
        <MaterialIcons name="account-circle" size={20} color="#CCCCCC" style={{marginRight: 8}} />
        <Text style={styles.sectionEmail}>{email || "[email]"}</Text>
      </View>
      
      <View style={styles.noteContainer}>
        <MaterialIcons name="info-outline" size={16} color="#999" style={{marginRight: 6}} />
        <Text style={styles.noteText}>
          Vui lòng kiểm tra email sau khi thanh toán hoàn tất
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 255, 153, 0.1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: "#00FF99",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  sectionDesc: { 
    color: "#CCCCCC", 
    fontSize: 14, 
    lineHeight: 20,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  sectionEmail: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteText: {
    color: '#999',
    fontSize: 12,
    flex: 1,
  }
});
