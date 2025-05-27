import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PaymentEventInfoProps {
  eventName?: string;
  location?: string;
  time?: string;
  eventNumber?: string;
  eventData?: any; // Thêm trường dữ liệu gốc để phân tích
}

const PaymentEventInfo = ({ 
  eventName = "Thông tin sự kiện", 
  location = "Trung tâm Hội nghị Quốc gia", 
  time = "22/5/2025 19:30", 
  eventNumber = "", 
  eventData 
}: PaymentEventInfoProps) => {
  let displayName = eventName;
  let displayNumber = eventNumber;
  let displayLocation = location;
  let displayTime = time;
  
  // Ghi log để debug
  useEffect(() => {
    console.log("[PaymentEventInfo] received props:", { eventName, location, time, eventNumber, eventData });
    if (eventData) {
      console.log("[PaymentEventInfo] Cấu trúc dữ liệu eventData:", {
        hasEventDetail: !!eventData.eventDetail,
        hasEvent: !!eventData.event,
        hasStartTime: !!eventData.startTime,
        hasEndTime: !!eventData.endTime,
        hasEventDetailId: !!eventData.eventDetailId,
        hasEventId: !!eventData.eventId,
        fromParams: !!eventData.fromParams
      });
    }
    
    // Khi props thay đổi, ưu tiên sử dụng time từ props nếu đến từ màn hình chọn ghế
    if (time && eventData && eventData.fromParams) {
      console.log("[PaymentEventInfo] Giữ nguyên thời gian từ props vì đến từ màn hình khác:", time);
      displayTime = time;
    }
  }, [eventName, location, time, eventNumber, eventData]);
  
  // Xử lý tên sự kiện và số
  if (!displayNumber) {
    const matches = eventName?.match(/^(.*?)\s+(\d+)$/);
    if (matches && matches.length >= 3) {
      displayName = matches[1].trim();
      displayNumber = matches[2].trim();
      console.log(`[PaymentEventInfo] Tách "${eventName}" thành tên "${displayName}" và số "${displayNumber}"`);
    } else {
      console.log(`[PaymentEventInfo] Không tách được "${eventName}"`);
    }
  }

  // Hàm format thời gian từ ISO string thành định dạng giờ dễ đọc
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.warn(`[PaymentEventInfo] Lỗi format time:`, e);
      return "Không có dữ liệu";
    }
  };

  // Hàm format thời gian từ ISO string thành định dạng ngày tháng dễ đọc
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      console.warn(`[PaymentEventInfo] Lỗi format date:`, e);
      return "Không có dữ liệu";
    }
  };

  // Logic xử lý dữ liệu động từ eventData nếu location hoặc time bị thiếu
  if (eventData) {
    try {
      // Xử lý địa điểm nếu thiếu
      if (!location || location === "-" || location === "Chưa cập nhật địa điểm" || location === "Thông tin không có sẵn") {
        // Thử lấy từ các thuộc tính khác nhau của eventData
        const possibleLocations = [
          eventData.location,
          eventData.venue, 
          eventData.eventDetail?.location,
          eventData.address,
          // Thêm các đường dẫn lồng nhau
          eventData.event?.location,
          eventData.event?.venue,
          eventData.event?.address,
          eventData.eventDetail?.event?.location
        ].filter(Boolean);
        
        if (possibleLocations.length > 0) {
          displayLocation = possibleLocations[0];
          console.log("[PaymentEventInfo] Đã lấy địa điểm từ eventData:", displayLocation);
        } else {
          displayLocation = "Trung tâm Hội nghị Quốc gia"; // Giá trị mặc định
          console.log("[PaymentEventInfo] Sử dụng địa điểm mặc định");
        }
      }

      // Xử lý thời gian nếu thiếu - tương tự logic trong EventInfo.tsx
      if (!time || time === "-" || time === "Chưa cập nhật thời gian" || time === "Thông tin không có sẵn") {
        console.log("[PaymentEventInfo] Thời gian hiện tại không khả dụng, đang tìm kiếm từ eventData");
        
        // Kiểm tra xem có phải dữ liệu từ màn hình chọn ghế không
        if (eventData && eventData.fromParams && eventData.time) {
          // Sử dụng thời gian trực tiếp từ màn hình chọn ghế mà không định dạng lại
          displayTime = eventData.time;
          console.log("[PaymentEventInfo] Sử dụng thời gian trực tiếp từ màn hình chọn ghế:", displayTime);
        } else {
          // Ưu tiên lấy từ eventDetail trước
          const eventDetailStartTime = 
            eventData.eventDetail?.startTime || 
            eventData.eventDetail?.event?.startTime;
            
          const eventDetailEndTime = 
            eventData.eventDetail?.endTime || 
            eventData.eventDetail?.event?.endTime;
          
          // Sau đó đến event
          const eventStartTime = 
            eventData.event?.startTime || 
            eventData.startTime;
            
          const eventEndTime = 
            eventData.event?.endTime || 
            eventData.endTime;
          
          // Lấy thời gian từ các trường khác
          const otherTimeField =
            eventData.time ||
            eventData.eventTime ||
            eventData.eventDetail?.time ||
            eventData.event?.time ||
            eventData.date ||
            eventData.eventDate ||
            eventData.event?.date ||
            eventData.eventDetail?.date;
          
          // Log để debug
          console.log("[PaymentEventInfo] Các trường thời gian tìm thấy:", {
            eventDetailStartTime,
            eventDetailEndTime,
            eventStartTime,
            eventEndTime,
            otherTimeField
          });
          
          // Ưu tiên cặp startTime-endTime từ eventDetail
          if (eventDetailStartTime && eventDetailEndTime) {
            const startDate = new Date(eventDetailStartTime);
            const endDate = new Date(eventDetailEndTime);
            
            displayTime = `${formatTime(eventDetailStartTime)} - ${formatTime(eventDetailEndTime)}, ${formatDate(eventDetailStartTime)}`;
            console.log("[PaymentEventInfo] Đã định dạng thời gian từ eventDetail:", displayTime);
          } 
          // Nếu không có, thử cặp startTime-endTime từ event
          else if (eventStartTime && eventEndTime) {
            const startDate = new Date(eventStartTime);
            const endDate = new Date(eventEndTime);
            
            displayTime = `${formatTime(eventStartTime)} - ${formatTime(eventEndTime)}, ${formatDate(eventStartTime)}`;
            console.log("[PaymentEventInfo] Đã định dạng thời gian từ event:", displayTime);
          } 
          // Nếu chỉ có startTime từ eventDetail
          else if (eventDetailStartTime) {
            displayTime = `${formatTime(eventDetailStartTime)}, ${formatDate(eventDetailStartTime)}`;
            console.log("[PaymentEventInfo] Đã định dạng thời gian từ eventDetail.startTime:", displayTime);
          } 
          // Nếu chỉ có startTime từ event
          else if (eventStartTime) {
            displayTime = `${formatTime(eventStartTime)}, ${formatDate(eventStartTime)}`;
            console.log("[PaymentEventInfo] Đã định dạng thời gian từ event.startTime:", displayTime);
          } 
          // Thử các trường thời gian khác
          else if (otherTimeField) {
            // Kiểm tra xem otherTimeField có phải là ISO date string không
            if (otherTimeField.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) || 
                otherTimeField.match(/^\d{4}-\d{2}-\d{2}/)) {
              // Là ISO string, định dạng lại
              try {
                const date = new Date(otherTimeField);
                displayTime = `${formatTime(otherTimeField)}, ${formatDate(otherTimeField)}`;
                console.log("[PaymentEventInfo] Đã định dạng thời gian từ ISO string:", displayTime);
              } catch (e) {
                displayTime = otherTimeField;
                console.log("[PaymentEventInfo] Sử dụng thời gian gốc (lỗi parse):", displayTime);
              }
            } else {
              // Không phải ISO string, hiển thị nguyên bản
              displayTime = otherTimeField;
              console.log("[PaymentEventInfo] Sử dụng thời gian gốc:", displayTime);
            }
          } else {
            displayTime = "22/5/2025 19:30"; // Giá trị mặc định
            console.log("[PaymentEventInfo] Sử dụng thời gian mặc định");
          }
        }
      } else if (eventData && eventData.fromParams) {
        // Nếu đã có time và đến từ màn hình khác, ưu tiên giữ nguyên
        console.log("[PaymentEventInfo] Giữ nguyên thời gian từ màn hình khác:", time);
      }
    } catch (error) {
      console.error("[PaymentEventInfo] Lỗi khi xử lý dữ liệu sự kiện:", error);
      // Sử dụng giá trị mặc định nếu có lỗi
      if (!displayLocation || displayLocation === "-" || displayLocation === "Chưa cập nhật địa điểm" || displayLocation === "Thông tin không có sẵn") {
        displayLocation = "Trung tâm Hội nghị Quốc gia";
      }
      if (!displayTime || displayTime === "-" || displayTime === "Chưa cập nhật thời gian" || displayTime === "Thông tin không có sẵn") {
        displayTime = "22/5/2025 19:30";
      }
    }
  }

  return (
    <LinearGradient
      colors={['#232526', '#1F2021']} 
      start={{x: 0, y: 0}} 
      end={{x: 0, y: 1}} 
      style={styles.container}
    >
      <View style={styles.headerSection}>
        <LinearGradient 
          colors={['#00FF99', '#00B14F'] as [string, string]} 
          start={{x: 0, y: 0}} 
          end={{x: 1, y: 0}} 
          style={styles.headerBadge}
        >
          <Text style={styles.headerText}>Thông tin sự kiện</Text>
        </LinearGradient>
      </View>
      
      <View style={styles.eventNameContainer}>
        <Text style={styles.eventName} numberOfLines={2}>
          {displayName}
          {displayNumber ? <Text style={styles.eventHighlight}>{" " + displayNumber}</Text> : null}
        </Text>
      </View>
      
      <View style={styles.eventDetail}>
        <View style={styles.eventItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="location-outline" size={20} color="#00FF99" />
          </View>
          <Text style={styles.eventInfo} numberOfLines={2}>
            {displayLocation}
          </Text>
        </View>
        
        <View style={styles.eventItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={20} color="#00FF99" />
          </View>
          <Text style={styles.eventInfo} numberOfLines={2}>
            {displayTime}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerSection: {
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  headerText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  eventNameContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  eventName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  eventDetail: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0, 255, 153, 0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventInfo: {
    color: '#CCCCCC',
    fontSize: 15,
    flex: 1,
  },
  eventHighlight: {
    color: '#00FF99',
    fontWeight: 'bold',
  },
});

export default PaymentEventInfo;
