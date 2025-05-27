import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL, ENDPOINTS } from '../../constants/api';
import { useLocalSearchParams } from 'expo-router';

// Định nghĩa kiểu dữ liệu cho thông tin sự kiện
interface EventDetailResponse {
  id: number;
  location: string;
  startTime: string;
  endTime: string;
  description?: string;
  status: string;
  capacity: number;
  detailImageUrl?: string;
  event?: {
    id: number;
    eventName: string;
    mainImageUrl?: string;
    startTime?: string;
    endTime?: string;
  };
}

// Nhận eventDetailId từ props, nếu không có thì lấy từ URL params
export default function EventInfo(props: { eventDetailId?: string | number }) {
  const params = useLocalSearchParams();
  let id: string | undefined = undefined;
  if (props.eventDetailId) {
    id = String(props.eventDetailId);
  } else if (typeof params.eventDetailId === 'string') {
    id = params.eventDetailId;
  }

  const [eventDetail, setEventDetail] = useState<EventDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm format thời gian từ ISO string thành định dạng ngày tháng dễ đọc
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN');
    } catch (e) {
      return "Không có dữ liệu";
    }
  };

  // Hàm format thời gian từ ISO string thành định dạng giờ dễ đọc
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "Không có dữ liệu";
    }
  };

  useEffect(() => {
    if (!id) return;
    
    // Hàm fetch có cơ chế retry
    const fetchEventDetail = async () => {
      let retryCount = 0;
      const maxRetries = 2;
      let success = false;
      
      setLoading(true);
      setError('');
      
      // Thử fetch từ endpoint chính
      while (retryCount <= maxRetries && !success) {
        try {
          console.log(`[EventInfo] Đang gọi API event-detail/${id} (lần ${retryCount + 1})`);
          
          const response = await axios.get(`${ENDPOINTS.EVENT_DETAIL}/${id}`, {
            timeout: 5000 // Thêm timeout để tránh chờ quá lâu
          });
          
          if (response.data) {
            console.log(`[EventInfo] Lấy dữ liệu thành công:`, JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
            
            // Xử lý đặc biệt cho thông tin lịch diễn từ eventDetail
            const eventDetailData = response.data;
            
            // Log chi tiết cấu trúc dữ liệu để debug
            console.log(`[EventInfo] Cấu trúc dữ liệu eventDetail:`, {
              hasStartTime: !!eventDetailData.startTime,
              hasEndTime: !!eventDetailData.endTime,
              hasEvent: !!eventDetailData.event,
              eventDetailId: eventDetailData.id
            });
            
            setEventDetail(eventDetailData);
            success = true;
            break;
          } else {
            console.warn(`[EventInfo] API trả về dữ liệu rỗng cho ID: ${id}`);
          }
        } catch (err: any) {
          // Chỉ hiển thị lỗi chi tiết ở lần thử cuối cùng trong môi trường phát triển
          if (retryCount >= maxRetries && __DEV__) {
            console.log(`[EventInfo] Chuyển sang phương pháp thay thế sau ${retryCount + 1} lần thử API chính`);
          }
        }
        
        retryCount++;
        if (retryCount <= maxRetries && !success) {
          console.log(`[EventInfo] Đang thử lại sau ${retryCount}s...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
        }
      }
      
      // Nếu endpoint chính thất bại, thử endpoint khác
      if (!success) {
        try {
          // Thử lấy từ /events/{id} thay vì /events-detail/{id}
          console.log(`[EventInfo] Thử phương pháp thay thế để lấy dữ liệu sự kiện ${id}`);
          const eventResponse = await axios.get(`${ENDPOINTS.EVENTS}/${id}`, {
            timeout: 5000
          });
          
          if (eventResponse.data) {
            console.log(`[EventInfo] Lấy dữ liệu thành công từ phương pháp thay thế`);
            const eventData = eventResponse.data;
            
            // Log chi tiết cấu trúc dữ liệu để debug chỉ trong môi trường phát triển
            if (__DEV__) {
              console.log(`[EventInfo] Cấu trúc dữ liệu thay thế:`, {
                hasStartTime: !!eventData.startTime,
                hasEventTime: !!eventData.eventTime,
                hasDate: !!eventData.date,
                hasEventDetails: !!eventData.eventDetails,
                eventId: eventData.id
              });
            }
            
            // Kiểm tra eventDetails trong eventData
            let correctEventDetail = null;
            if (eventData.eventDetails && Array.isArray(eventData.eventDetails) && eventData.eventDetails.length > 0) {
              // Nếu có nhiều eventDetails, tìm eventDetail phù hợp với id
              correctEventDetail = eventData.eventDetails.find((ed: any) => String(ed.id) === id);
              
              // Nếu không tìm thấy, lấy eventDetail đầu tiên
              if (!correctEventDetail) {
                correctEventDetail = eventData.eventDetails[0];
              }
              
              console.log(`[EventInfo] Tìm thấy eventDetail trong dữ liệu thay thế:`, {
                detailId: correctEventDetail.id,
                hasDetailStartTime: !!correctEventDetail.startTime,
                hasDetailEndTime: !!correctEventDetail.endTime
              });
            }
            
            // Chuyển đổi dữ liệu từ /events thành định dạng tương thích với /events-detail
            setEventDetail({
              id: Number(id),
              location: correctEventDetail?.location || eventData.location || eventData.venue || "",
              // Ưu tiên lấy thời gian từ correctEventDetail nếu có
              startTime: correctEventDetail?.startTime || eventData.startTime || eventData.eventTime || eventData.date || new Date().toISOString(),
              endTime: correctEventDetail?.endTime || eventData.endTime || new Date().toISOString(),
              status: correctEventDetail?.status || eventData.status || "active",
              capacity: correctEventDetail?.capacity || eventData.capacity || 0,
              event: {
                id: Number(eventData.id),
                eventName: eventData.eventName || eventData.name || "",
                startTime: correctEventDetail?.startTime || eventData.startTime || eventData.eventTime || eventData.date || new Date().toISOString(),
                endTime: correctEventDetail?.endTime || eventData.endTime || new Date().toISOString(),
              }
            });
            success = true;
          }
        } catch (err: any) {
          // Chỉ log rằng phương pháp thay thế không thành công, không hiện chi tiết lỗi
          if (__DEV__) {
            console.log(`[EventInfo] Thử phương pháp thay thế khác cho sự kiện ${id}`);
          }
          // Không đặt lỗi ở đây để vẫn hiển thị UI loading
        }
      }
      
      // Nếu vẫn thất bại, kiểm tra xem có thể lấy dữ liệu từ list events không
      if (!success) {
        try {
          console.log(`[EventInfo] Tìm kiếm sự kiện trong danh sách`);
          const eventsResponse = await axios.get(`${ENDPOINTS.EVENTS}`, {
            timeout: 5000
          });
          
          if (eventsResponse.data && Array.isArray(eventsResponse.data)) {
            // Tìm event phù hợp trong danh sách
            const event = eventsResponse.data.find((item: any) => 
              String(item.id) === id || 
              String(item.eventDetailId) === id || 
              (item.eventDetails && item.eventDetails.some((ed: any) => String(ed.id) === id))
            );
            
            if (event) {
              console.log(`[EventInfo] Tìm thấy event trong danh sách events`);
              
              // Nếu event có eventDetails, tìm eventDetail phù hợp
              let eventDetail = null;
              if (event.eventDetails && Array.isArray(event.eventDetails)) {
                eventDetail = event.eventDetails.find((ed: any) => String(ed.id) === id);
              }
              
              setEventDetail({
                id: Number(id),
                location: eventDetail?.location || event.location || event.venue || "",
                startTime: eventDetail?.startTime || event.startTime || event.eventTime || event.date || new Date().toISOString(),
                endTime: eventDetail?.endTime || event.endTime || new Date().toISOString(),
                status: eventDetail?.status || event.status || "active",
                capacity: eventDetail?.capacity || event.capacity || 0,
                event: {
                  id: event.id,
                  eventName: event.eventName || event.name || "",
                  startTime: eventDetail?.startTime || event.startTime || event.eventTime || event.date || new Date().toISOString(),
                  endTime: eventDetail?.endTime || event.endTime || new Date().toISOString(),
                }
              });
              success = true;
            }
          }
        } catch (err: any) {
          // Chỉ hiển thị thông báo lỗi ngắn gọn và không hiện chi tiết lỗi
          if (__DEV__) {
            console.log(`[EventInfo] Không thể lấy thông tin từ danh sách sự kiện`);
          }
          setError('Không thể tải thông tin sự kiện');
        }
      }
      
      if (!success) {
        setError('Không thể tải thông tin sự kiện');
      }
      
      setLoading(false);
    };
    
    fetchEventDetail();
  }, [id]);

  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>ID sự kiện không hợp lệ</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!eventDetail) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không thể lấy dữ liệu sự kiện</Text>
      </View>
    );
  }

  // Sử dụng dữ liệu từ API
  return (
    <View style={styles.container}>
      {/* Hiển thị tên sự kiện */}
      {eventDetail.event?.eventName && (
        <View style={styles.infoRowCentered}> 
          <Ionicons name="star" size={20} color="#FFD700" style={styles.iconTitle} />
          <Text style={styles.eventTitle}>{eventDetail.event.eventName}</Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="location" size={20} color="#22c55e" />
          <Text style={styles.infoText}>
            {eventDetail.location || "Địa điểm không xác định"}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItemFullWidth}> 
          <Ionicons name="time" size={20} color="#22c55e" />
          <Text style={styles.infoText}>
            {
              // Ưu tiên lấy thời gian từ eventDetail trước
              (eventDetail.startTime && eventDetail.endTime)
                ? `${formatTime(eventDetail.startTime)} - ${formatTime(eventDetail.endTime)}, ${formatDate(eventDetail.startTime)}`
                // Nếu không có endTime, chỉ hiển thị startTime
                : eventDetail.startTime
                  ? `${formatTime(eventDetail.startTime)}, ${formatDate(eventDetail.startTime)}`
                  // Thử lấy từ event nếu có và nếu event có thuộc tính startTime/endTime
                  : (eventDetail.event?.startTime && eventDetail.event?.endTime)
                    ? `${formatTime(eventDetail.event.startTime)} - ${formatTime(eventDetail.event.endTime)}, ${formatDate(eventDetail.event.startTime)}`
                    : eventDetail.event?.startTime
                      ? `${formatTime(eventDetail.event.startTime)}, ${formatDate(eventDetail.event.startTime)}`
                      // Đúng là message "Thời gian không xác định"
                      : "Thời gian không xác định"
            }
          </Text>
        </View>
      </View>

      {/* Bạn có thể giữ lại phần hiển thị capacity nếu cần */}
      {eventDetail.capacity !== null && eventDetail.capacity !== undefined && (
         <View style={styles.infoRow}>
            <View style={styles.infoItemFullWidth}>
                <Ionicons name="people" size={20} color="#22c55e" />
                <Text style={styles.infoText}>
                    {`Sức chứa: ${eventDetail.capacity} người`}
                </Text>
            </View>
         </View>
      )}

      {/* Hiển thị mô tả sự kiện nếu có */}
      {eventDetail.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Mô tả</Text>
          <Text style={styles.descriptionText}>{eventDetail.description}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    minHeight: 120,
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoRowCentered: { // Style mới cho tên sự kiện
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  eventTitle: { // Style mới cho tên sự kiện
    color: "#fff",
    fontSize: 20, // Tăng kích thước font
    fontWeight: "bold",
    marginLeft: 8,
    textAlign: "center",
  },
  iconTitle: { // Style cho icon cạnh title
    // marginRight: 8, // Không cần margin nếu đã có ở eventTitle
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c313a",
    padding: 12,
    borderRadius: 12,
    flex: 1, // Để các item có thể co dãn
    marginHorizontal: 4, // Thêm khoảng cách ngang giữa các item
  },
  infoItemFullWidth: { // Style mới cho item chiếm toàn bộ chiều rộng
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c313a",
    padding: 12,
    borderRadius: 12,
    flex: 1,
  },
  infoText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  errorText: {
    color: "#ff4545",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 8,
  },
  descriptionContainer: {
    marginTop: 16, 
    backgroundColor: "#2c313a",
    borderRadius: 12,
    padding: 12,
  },
  descriptionTitle: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  descriptionText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
});