/**
 * HOME SCREEN
 * 
 * Những điều cần học:
 * 1. React Native Components:
 *    - FlatList: Hiệu suất cao khi render danh sách
 *    - ScrollView vs FlatList
 *    - View và StyleSheet
 * 
 * 2. Layout và Styling:
 *    - Flexbox trong React Native
 *    - Dimensions API
 *    - Style inheritance
 * 
 * 3. Component Organization:
 *    - Chia nhỏ components
 *    - Component composition
 *    - Props passing
 */

import {
  ScrollView,
  StyleSheet,
  Dimensions,
  FlatList,
  View
} from "react-native";
import React from "react";
import LiveMusicEvents from "../index_creen/LiveMusicEvents";
import TrendingEvent from "../index_creen/TrendingEvent"
import Events from "../index_creen/Events";
import Recommendation from "../index_creen/Recommendation"
import Wekend_And_Month from "../index_creen/Wekend_And_Month";
import Header from "../index_creen/Header";
import InterestingDestinations from "../index_creen/InterestingDestinations";

// Mảng các components con để render trong FlatList
const COMPONENTS = [
  { id: "1", component: <Header /> },
  { id: "2", component: <Events /> },
  { id: "3", component: <TrendingEvent /> },
  { id: "4", component: <Recommendation /> },
  { id: "5", component: <Wekend_And_Month /> },
  { id: "6", component: <LiveMusicEvents /> },
  { id: "7", component: <InterestingDestinations /> },
];

export default function HomeScreen() {
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 20 }} // Padding cho container
      showsVerticalScrollIndicator={false} // Ẩn thanh cuộn
      data={COMPONENTS} // Data source cho FlatList
      keyExtractor={(item) => item.id} // Unique key cho mỗi item
      renderItem={({ item }) => <View>{item.component}</View>} // Render từng component
    />
  );
}

// Styles sử dụng StyleSheet.create để tối ưu hiệu suất
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282828",
  },
});
