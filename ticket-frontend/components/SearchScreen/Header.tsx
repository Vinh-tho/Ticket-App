import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  ActivityIndicator,
  Animated,
  Easing
} from "react-native";
import { Ionicons, MaterialCommunityIcons, AntDesign, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getTrendingSearches, TrendingSearch } from "@/services/eventService";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearch: () => void;
}

export default function Header({ searchQuery, onSearchChange, onSearch }: HeaderProps) {
  const router = useRouter();
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  
  // Animation references
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start pulse animation for search icon
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  // Animate search bar on focus
  const handleFocus = () => {
    Animated.timing(searchBarAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    if (!searchQuery) {
      Animated.timing(searchBarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    // Lấy xu hướng tìm kiếm khi component được mount
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const trending = await getTrendingSearches();
        setTrendingSearches(trending);
      } catch (error) {
        console.error("Error fetching trending searches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BlurView intensity={20} tint="dark" style={styles.blurButton}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </BlurView>
        </Pressable>
        <Text style={styles.headerText}>Tìm kiếm</Text>
      </View>

      {/* Search Bar */}
      <Animated.View 
        style={[
          styles.searchBar,
          {
            transform: [
              { 
                scale: searchBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.02]
                }) 
              }
            ],
            shadowOpacity: searchBarAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.3]
            })
          }
        ]}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Feather name="search" size={18} color="#22c55e" />
        </Animated.View>
        <TextInput
          placeholder="Nhập từ khóa tìm kiếm"
          placeholderTextColor="rgba(255,255,255,0.5)"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={onSearchChange}
          onSubmitEditing={onSearch}
          returnKeyType="search"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => onSearchChange('')}>
            <BlurView intensity={20} tint="dark" style={styles.clearButton}>
              <Ionicons name="close" size={14} color="white" />
            </BlurView>
          </Pressable>
        )}
      </Animated.View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <Pressable style={styles.filterButton}>
          <BlurView intensity={10} tint="dark" style={styles.filterButtonInner}>
            <Ionicons name="calendar-outline" size={16} color="white" style={styles.filterIcon} />
            <Text style={styles.filterText}>Tất cả các ngày</Text>
          </BlurView>
        </Pressable>
        <Pressable style={styles.filterButton}>
          <BlurView intensity={10} tint="dark" style={styles.filterButtonInner}>
            <MaterialCommunityIcons name="tune-variant" size={16} color="white" style={styles.filterIcon} />
            <Text style={styles.filterText}>Bộ lọc</Text>
          </BlurView>
        </Pressable>
      </View>

      {/* Trending Keywords */}
      <View style={styles.sectionSpacing}>
        <Text style={styles.trendingTitle}>Gợi ý tìm kiếm phổ biến</Text>
        
        {loading ? (
          <ActivityIndicator size="small" color="#22c55e" style={styles.loader} />
        ) : (
          <>
            {trendingSearches.map((item, index) => (
              <Pressable 
                key={index} 
                onPress={() => {
                  onSearchChange(item.name);
                  onSearch();
                }}
                style={({ pressed }) => [
                  styles.trendingItem,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                ]}
              >
                <BlurView intensity={15} tint="dark" style={styles.trendingItemInner}>
                  <View style={styles.checkboxContainer}>
                    <AntDesign name="checkcircle" size={18} color="#22c55e" />
                  </View>
                  <View style={styles.trendingContent}>
                    <Text style={styles.trendingKeyword}>{item.name}</Text>
                    <Text style={styles.trendingType}>
                      {item.type === 'event' ? 'Sự kiện' : 'Địa điểm'}
                    </Text>
                  </View>
                </BlurView>
              </Pressable>
            ))}
          </>
        )}
        
        <Text style={styles.trendingNote}>
          Dựa trên lượt tìm kiếm nhiều nhất trong 30 ngày qua
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      paddingHorizontal: 16,
    },
    headerContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      paddingTop: 10,
    },
    headerText: {
      color: '#fff',
      fontSize: 22,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    backButton: {
      position: 'absolute',
      left: 0,
      top: 8,
    },
    blurButton: {
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    searchBar: {
      backgroundColor: 'rgba(32, 32, 36, 0.8)',
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: 'rgba(34, 197, 94, 0.3)',
      shadowColor: '#22c55e',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 10,
    },
    searchInput: {
      marginLeft: 12,
      color: '#fff',
      flex: 1,
      fontWeight: '500',
    },
    clearButton: {
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    filterButton: {
      flex: 1,
      marginHorizontal: 5,
      borderRadius: 12,
      overflow: 'hidden',
    },
    filterButtonInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
    },
    filterIcon: {
      marginRight: 8,
    },
    filterText: {
      color: '#fff',
      fontWeight: '500',
    },
    sectionSpacing: {
      marginBottom: 24,
    },
    trendingTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      letterSpacing: 0.5,
    },
    trendingItem: {
      marginBottom: 12,
      borderRadius: 14,
      overflow: 'hidden',
    },
    trendingItemInner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    checkboxContainer: {
      marginRight: 12,
    },
    trendingContent: {
      flex: 1,
    },
    trendingKeyword: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    trendingType: {
      color: 'rgba(156, 163, 175, 0.8)',
      fontSize: 13,
      marginTop: 4,
    },
    trendingNote: {
      color: 'rgba(156, 163, 175, 0.7)',
      fontSize: 12,
      marginTop: 12,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    loader: {
      marginVertical: 20,
    },
  });
