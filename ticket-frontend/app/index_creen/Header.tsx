import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASE_URL } from "@/constants/config";
import { BlurView } from 'expo-blur';
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";

interface EventDetail {
  detailImageUrl: string;
  startTime: string;
  location: string;
}

interface Event {
  id: number;
  mainImageUrl: string;
  eventName: string;
  eventDetails: EventDetail[];
}

const { width, height } = Dimensions.get("window");

export default function Header() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  
  // Animation for search icon
  const searchPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate search icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(searchPulse, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(searchPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/events`);
        const data = await response.json();
        
        // Xáo trộn mảng sự kiện
        const shuffledEvents = [...data].sort(() => Math.random() - 0.5);
        
        // Lấy tối đa 3 sự kiện đầu tiên sau khi xáo trộn
        const randomEvents = shuffledEvents.slice(0, 3);
        
        setEvents(randomEvents);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sự kiện:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(newIndex);
      }
    }
  );

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleDotPress = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setCurrentIndex(index);
  };

  // Animation values for parallax effect
  const getInputRange = (index: number) => [
    (index - 1) * width,
    index * width,
    (index + 1) * width,
  ];

  const getImageTranslate = (index: number) => {
    return scrollX.interpolate({
      inputRange: getInputRange(index),
      outputRange: [-width * 0.2, 0, width * 0.2],
      extrapolate: 'clamp',
    });
  };

  return (
    <View>
      {/* Header */}
      <LinearGradient
        colors={['#21C064', '#18A050']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10, minHeight: 80 }]}
      >
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          style={styles.logoContainer}
        >
          <Text style={styles.logo}>
            Ticket<Text style={styles.boldText}>box</Text>
          </Text>
          <View style={styles.logoUnderline} />
        </MotiView>
        
        <Pressable 
          style={({ pressed }) => [
            styles.searchButton,
            pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }
          ]}
          onPress={() => router.push("/SearchScreen")}
        >
          <BlurView intensity={20} tint="light" style={styles.searchButtonInner}>
            <Animated.View style={{ transform: [{ scale: searchPulse }] }}>
              <Feather name="search" size={22} color="#fff" />
            </Animated.View>
          </BlurView>
        </Pressable>
      </LinearGradient>

      {/* Image Slider */}
      <View style={styles.sliderContainer}>
        <FlatList
          ref={flatListRef}
          data={events}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          onScroll={handleScroll}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={{ 
            viewAreaCoveragePercentThreshold: 50,
            minimumViewTime: 0
          }}
          renderItem={({ item, index }) => {
            const eventDetail = item.eventDetails?.[0];
            return (
              <View style={styles.imageContainer}>
                <Animated.Image 
                  source={{ uri: eventDetail?.detailImageUrl || item.mainImageUrl }} 
                  style={[
                    styles.fullWidthImage,
                    {
                      transform: [{ translateX: getImageTranslate(index) }]
                    }
                  ]} 
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
                  style={styles.imageOverlay}
                >
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {item.eventName}
                  </Text>
                  {eventDetail?.location && (
                    <View style={styles.eventLocationRow}>
                      <Ionicons name="location-outline" size={14} color="#fff" />
                      <Text style={styles.eventLocation} numberOfLines={1}>
                        {eventDetail.location}
                      </Text>
                    </View>
                  )}
                  <Pressable
                    style={({ pressed }) => [
                      styles.detailButton,
                      pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                    ]}
                    onPress={() => router.push(`/events_detail/${item.id}`)}
                  >
                    <BlurView intensity={30} tint="light" style={styles.detailButtonInner}>
                      <Text style={styles.detailText}>Xem chi tiết</Text>
                      <Feather name="arrow-right" size={16} color="#000" style={styles.arrowIcon} />
                    </BlurView>
                  </Pressable>
                </LinearGradient>
              </View>
            );
          }}
        />

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {events.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 16, 8],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { 
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: currentIndex === index ? '#21C064' : 'rgba(255,255,255,0.6)'
                  }
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 30,
    color: "white",
    fontWeight: "400",
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  logoUnderline: {
    width: 20,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginTop: 3,
  },
  boldText: {
    fontWeight: "bold",
  },
  searchButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchButtonInner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  sliderContainer: {
    position: 'relative',
  },
  fullWidthImage: {
    width,
    height: height * 0.35,
    resizeMode: "cover",
  },
  imageContainer: {
    width,
    height: height * 0.35,
    overflow: "hidden",
    position: 'relative',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 50, // Leave space for pagination
  },
  eventTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventLocation: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
    opacity: 0.9,
  },
  pagination: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 6,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  detailButton: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    overflow: 'hidden',
  },
  detailButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  detailText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
  arrowIcon: {
    marginLeft: 6,
  },
});
