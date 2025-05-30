import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  Pressable, 
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SearchEventResult } from '@/services/eventService';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';

interface SearchResultsProps {
  results: SearchEventResult[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

const { width } = Dimensions.get('window');

export default function SearchResults({ results, loading, error, searchQuery }: SearchResultsProps) {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  if (loading) {
    return (
      <MotiView 
        style={styles.centerContainer}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400 }}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      </MotiView>
    );
  }

  if (error) {
    return (
      <MotiView 
        style={styles.centerContainer}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400 }}
      >
        <BlurView intensity={20} tint="dark" style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </BlurView>
      </MotiView>
    );
  }

  if (results.length === 0 && searchQuery) {
    return (
      <MotiView
        style={styles.centerContainer}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400 }}
      >
        <BlurView intensity={20} tint="dark" style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={48} color="#9ca3af" />
          <Text style={styles.noResultsText}>Không tìm thấy kết quả nào cho "{searchQuery}"</Text>
          <Text style={styles.suggestionText}>Hãy thử tìm kiếm với từ khóa khác</Text>
        </BlurView>
      </MotiView>
    );
  }

  if (!searchQuery) {
    return null; // Không hiển thị gì khi chưa tìm kiếm
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.resultsHeaderContainer,
        {
          opacity: scrollY.interpolate({
            inputRange: [0, 50],
            outputRange: [1, 0.8],
            extrapolate: 'clamp'
          }),
          transform: [
            { 
              translateY: scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [0, -20],
                extrapolate: 'clamp'
              }) 
            }
          ]
        }
      ]}>
        <Text style={styles.resultsHeading}>Kết quả cho "{searchQuery}"</Text>
        <Text style={styles.resultsCount}>{results.length} kết quả</Text>
      </Animated.View>
      
      <Animated.FlatList
        style={styles.flatList}
        data={results}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ 
              type: 'timing', 
              duration: 400,
              delay: index * 100, // Staggered animation
            }}
          >
            <Pressable
              style={({ pressed }) => [
                styles.eventCard,
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
              ]}
              onPress={() => {
                router.push(`/events_detail/${item.id}`);
              }}
            >
              <Image 
                source={{ uri: item.image }} 
                style={styles.eventImage} 
                resizeMode="cover"
              />
              <BlurView intensity={30} tint="dark" style={styles.eventInfo}>
                <View>
                  <Text style={styles.eventName} numberOfLines={1}>{item.name}</Text>
                  
                  <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={14} color="#22c55e" />
                      <Text style={styles.detailText}>{item.date}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={14} color="#22c55e" />
                      <Text style={styles.detailText}>{item.location}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.eventPrice}>{item.price}</Text>
                  <View style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>Xem</Text>
                  </View>
                </View>
              </BlurView>
            </Pressable>
          </MotiView>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8,
  },
  flatList: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 16,
    width: '100%',
    overflow: 'hidden',
  },
  errorText: {
    color: '#ef4444',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 16,
    width: '100%',
    overflow: 'hidden',
  },
  noResultsText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  suggestionText: {
    color: 'rgba(156, 163, 175, 0.8)',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  resultsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsHeading: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  resultsCount: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 30,
  },
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  eventInfo: {
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  eventName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  eventPrice: {
    color: '#22c55e',
    fontWeight: 'bold',
    fontSize: 18,
  },
  viewButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  viewButtonText: {
    color: '#22c55e',
    fontWeight: 'bold',
    fontSize: 14,
  }
}); 