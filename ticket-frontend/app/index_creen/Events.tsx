import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { BASE_URL } from "@/constants/config";

const { width, height } = Dimensions.get("window");

interface Event {
  id: number;
  eventName: string;
  mainImageUrl: string;
  status: string;
  eventDetails: Array<{
    id: number;
    startTime: string;
    endTime: string;
    location: string;
  }>;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/events`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải dữ liệu sự kiện</Text>
      </View>
    );
  }

  if (!events || events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có sự kiện nào</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Sự kiện đặc biệt</Text>
      <FlatList
        data={events}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => router.push(`/events_detail/${item.id}`)}
            style={styles.eventContainer}
          >
            <Image 
              source={{ uri: item.mainImageUrl }} 
              style={styles.eventImage}
              defaultSource={require('@/assets/images/icon.png')}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
  },
  eventContainer: {
    marginLeft: 20,
    marginTop: 10,
    width: width * 0.48,
  },
  sectionTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginLeft: 20,
    marginTop: 38,
  },
  eventImage: {
    width: width * 0.48,
    height: height * 0.32,
    resizeMode: "cover",
    borderRadius: 8,
    marginHorizontal: -5,
  },
});
