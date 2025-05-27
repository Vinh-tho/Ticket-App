import { View, Text, Image, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { API } from "@/constants/api";

interface OrganizerData {
  id: number;
  name: string;
  logo_url: string;
  legal_representative: string;
  address: string;
  hotline: string;
  email: string;
  business_license: string;
}

interface OrganizerProps {
  organizerId: number | undefined;
}

export default function Organizer({ organizerId }: OrganizerProps) {
  const [organizer, setOrganizer] = useState<OrganizerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (organizerId === undefined) {
      setError("No organizer information available");
      setLoading(false);
      return;
    }

    const fetchOrganizer = async () => {
      try {
        const response = await fetch(API.ORGANIZER.GET_BY_ID(organizerId));
        if (!response.ok) {
          throw new Error('Failed to fetch organizer data');
        }
        const data = await response.json();
        setOrganizer(data);
      } catch (error) {
        console.error("Error fetching organizer:", error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizer();
  }, [organizerId]);

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.sectionTitle}>BAN TỔ CHỨC</Text>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (error || !organizer) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.sectionTitle}>BAN TỔ CHỨC</Text>
        <Text>Không thể tải thông tin ban tổ chức</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>BAN TỔ CHỨC</Text>
      <Image 
        source={{ uri: organizer.logo_url }} 
        style={styles.organizerLogo}
        defaultSource={require('@/assets/images/icon.png')}
      />
      <Text style={styles.organizerName}>{organizer.name}</Text>
      <Text style={styles.organizerDetails}>
        Đại diện theo pháp luật: {organizer.legal_representative}{"\n"}
        Địa chỉ: {organizer.address}{"\n"}
        Hotline: {organizer.hotline}{"\n"}
        Email: {organizer.email}{"\n"}
        Giấy chứng nhận đăng ký doanh nghiệp số: {organizer.business_license}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#222",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
  },
  organizerLogo: {
    width: 80,
    height: 80,
    alignSelf: "flex-start",
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  organizerName: {
    fontSize: 16,
    color: "#222",
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 10,
  },
  organizerDetails: {
    fontSize: 13,
    color: "#444",
    textAlign: "left",
    lineHeight: 20,
  },
});
