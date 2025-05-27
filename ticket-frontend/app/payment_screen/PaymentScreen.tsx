import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import PaymentHeader from "./PaymentHeader";
import PaymentEventInfo from "./PaymentEventInfo";
import PaymentCountdown from "./PaymentCountdown";
import PaymentTicketInfo from "./PaymentTicketInfo";
import PaymentGiftSelect from "./PaymentGiftSelect";
import PaymentOrderCard from "./PaymentOrderCard";
import { handlePayment, fetchTicket, fetchEvent, fetchSeat, fetchOrder, fetchGifts, fetchGiftsByEvent, fetchEventDetailInfo } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BASE_URL } from "../../constants/config";

function useUserEmail() {
  const [email, setEmail] = useState("");
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setEmail(decoded.email || "");
        } catch {}
      }
    })();
  }, []);
  return email;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedSeatsData, setSelectedSeatsData] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [seat, setSeat] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const email = useUserEmail();
  const [selectedGifts, setSelectedGifts] = useState<number[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [eventId, setEventId] = useState<number | null>(null);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [eventDetailId, setEventDetailId] = useState<number | null>(null);
  const [fromTicketScreen, setFromTicketScreen] = useState<boolean>(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [gifts, setGifts] = useState<any[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const moveAnim = useRef(new Animated.Value(20)).current;
  const orderIdRef = useRef<number | null>(null);

  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Kiểm tra nếu được gọi từ màn hình Ticket
        const isFromTicket = params.returnPath === '/(tabs)/Ticket';
        setFromTicketScreen(isFromTicket);
        console.log('[PaymentScreen] Được gọi từ màn hình Ticket:', isFromTicket);
        
        if (params.orderId) {
          // Đảm bảo orderId là string hoặc number, không phải mảng
          const orderIdParam = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
          // Ưu tiên lấy lại order từ API
          const order = await fetchOrder(orderIdParam);

          console.log('[PaymentScreen] Đang xử lý Order ID:', order.id, 'EventDetail ID từ Order:', order.eventDetailId);

          setOrderId(order.id);
          setEventDetailId(order.eventDetailId);
          
          // Thêm dòng này để lưu thông tin nguồn
          const fromTicketScreen = (params.returnPath === '/(tabs)/Ticket');
          console.log('[PaymentScreen] Được gọi từ màn hình Ticket:', fromTicketScreen);
          
          // Xử lý dữ liệu ghế đã chọn
          setSelectedSeatsData(order.orderDetails.map((od: any) => ({
            id: od.id,
            seatId: od.seat?.id,
            seat: od.seat ? `${od.seat.zone} ${od.seat.row}-${od.seat.number}` : "Không xác định",
            seatDetails: od.seat ? {
              id: od.seat.id,
              zone: od.seat.zone,
              row: od.seat.row,
              number: od.seat.number,
            } : undefined,
            price: Number(od.unitPrice) || Number(od.ticket?.price) || 0,
            type: od.ticket?.type || "Tiêu chuẩn",
            quantity: od.quantity || 1,
            ticketId: od.ticket?.id,
            ticket: od.ticket,
            eventName: od.ticket?.event?.eventName || od.ticket?.event?.name || od.ticket?.eventName || null,
          })));
          
          // Tìm thông tin sự kiện từ params truyền từ trang Ticket
          let eventNameFromParams = null;
          let locationFromParams = null;
          let timeFromParams = null;
          
          if (fromTicketScreen) {
            // Nếu có thông tin sự kiện từ params
            eventNameFromParams = Array.isArray(params.eventName) ? params.eventName[0] : params.eventName as string;
            locationFromParams = Array.isArray(params.location) ? params.location[0] : params.location as string;
            timeFromParams = Array.isArray(params.time) ? params.time[0] : params.time as string;
            
            if (eventNameFromParams) {
              console.log(`[PaymentScreen] Tìm thấy thông tin sự kiện từ params:`, {
                eventName: eventNameFromParams,
                location: locationFromParams,
                time: timeFromParams
              });
              
              // Lưu thông tin lịch diễn từ params để sử dụng ưu tiên sau này
              if (timeFromParams) {
                console.log("[PaymentScreen] Ưu tiên sử dụng thời gian từ màn hình chọn ghế:", timeFromParams);
                // Không làm gì thêm, chỉ đảm bảo timeFromParams có giá trị để sử dụng sau này
              }
            }
          }
          
          // Ưu tiên lấy thông tin event từ order
          const orderEventInfo = {
            eventName: order.event?.name || order.event?.eventName || order.eventName || eventNameFromParams || null,
            location: order.event?.location || order.venue || order.location || locationFromParams || null,
            time: order.event?.time || order.event?.eventTime || order.eventTime || order.time || timeFromParams || null,
            eventId: order.event?.id || order.eventId || null,
          };
          
          // Ưu tiên lấy từ ticket của order đầu tiên
          if (order.orderDetails && order.orderDetails.length > 0) {
            const firstTicket = order.orderDetails[0].ticket;
            setTicketId(firstTicket?.id);
            setTicket(firstTicket);
            
            if (firstTicket?.event) {
              setEventId(firstTicket.event.id || firstTicket.eventId);
              
              // Nếu có thông tin sự kiện từ ticket, ưu tiên sử dụng
              if (!orderEventInfo.eventName) {
                orderEventInfo.eventName = firstTicket.event.name || firstTicket.event.eventName || firstTicket.eventName;
              }
              
              if (!orderEventInfo.location) {
                orderEventInfo.location = firstTicket.event.location || firstTicket.event.venue || firstTicket.location;
              }
              
              if (!orderEventInfo.time) {
                orderEventInfo.time = firstTicket.event.time || firstTicket.event.eventTime || firstTicket.time;
              }
            }
          }
          
          // Nếu đến từ màn hình Ticket, ưu tiên sử dụng thông tin từ params
          if (fromTicketScreen && params.eventId) {
            const paramEventId = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId;
            setEventId(typeof paramEventId === 'number' ? paramEventId : Number(paramEventId));
          }
          
          // Nếu có thông tin sự kiện trực tiếp từ order/ticket, tạo đối tượng event ngay
          if (orderEventInfo.eventName || orderEventInfo.eventId) {
            // Tạo đối tượng event từ thông tin đã thu thập
            const eventFromOrderData = {
              id: orderEventInfo.eventId || order.id,
              eventName: orderEventInfo.eventName || (order.orderDetails[0]?.ticket?.type 
                ? `Vé ${order.orderDetails[0].ticket.type}` 
                : "Thông tin đặt vé"),
              location: orderEventInfo.location || "Trung tâm Hội nghị Quốc gia",
              time: orderEventInfo.time || "22/5/2025 19:30",
            };
            
            console.log("[PaymentScreen] Tạo thông tin sự kiện từ dữ liệu order:", eventFromOrderData);
            setEvent(eventFromOrderData);
          }

          // Fetch event detail từ API nếu có eventDetailId và chưa có đủ thông tin sự kiện
          if (order.eventDetailId && (!orderEventInfo.eventName || !orderEventInfo.location || !orderEventInfo.time)) {
            try {
              console.log(`[PaymentScreen] Đang lấy thông tin chi tiết sự kiện với EventDetail ID: ${order.eventDetailId}`);
              const eventDetail = await fetchEventDetailInfo(order.eventDetailId);
              
              console.log('[PaymentScreen] Dữ liệu eventDetail trả về từ fetchEventDetailInfo:', eventDetail);
              console.log('[PaymentScreen] Cấu trúc event bên trong eventDetail:', JSON.stringify(eventDetail?.event, null, 2));
              
              if (eventDetail && !event) { // Chỉ cập nhật nếu chưa có thông tin event từ order/ticket
                // Kiểm tra và xác định những trường cần lấy từ eventDetail
                console.log('[PaymentScreen] Xử lý dữ liệu eventDetail đã lấy được:', {
                  hasStartTime: !!eventDetail.startTime,
                  hasEndTime: !!eventDetail.endTime,
                  hasEvent: !!eventDetail.event
                });
                
                // Tạo đối tượng event từ thông tin đã thu thập
                const eventFromDetail = {
                  id: eventDetail.id,
                  eventName: eventDetail.event?.eventName || eventDetail.event?.name,
                  location: eventDetail.location || eventDetail.event?.location,
                  // Lưu các thông tin thời gian từ eventDetail để component PaymentEventInfo có thể xử lý
                  startTime: eventDetail.startTime,
                  endTime: eventDetail.endTime,
                  // Lưu thông tin chi tiết từ API
                  eventDetail: eventDetail,
                  // Gán event từ eventDetail
                  event: eventDetail.event,
                  // Kiểm tra nếu đến từ seat_screen thì sử dụng time từ params
                  time: (fromTicketScreen && timeFromParams) ? timeFromParams : ""
                };
                
                console.log('[PaymentScreen] Đã tạo thông tin event với dữ liệu lịch diễn từ eventDetail:', eventFromDetail);
                setEvent(eventFromDetail);
              } else {
                console.log(`Không tìm thấy chi tiết sự kiện cho ID: ${order.eventDetailId}, thử phương pháp khác...`);
                // Chỉ thử fallback nếu chưa có event
                if (!event) {
                  await fallbackToEventFromTicket();
                } else {
                  console.log("Đã có thông tin sự kiện từ order/ticket, không cần fallback");
                }
              }
            } catch (e) {
              console.error("Lỗi khi lấy thông tin chi tiết sự kiện:", e);
              // Nếu lỗi và chưa có event, thử tìm sự kiện qua ticket
              if (!event) {
                await fallbackToEventFromTicket();
              } else {
                console.log("Đã có thông tin sự kiện từ order/ticket, không cần fallback");
              }
            }
          } else {
            // Nếu không có eventDetailId và chưa có event, thử lấy thông tin từ ticket
            if (!event) {
              console.log("Không có eventDetailId, tìm sự kiện từ thông tin vé...");
              await fallbackToEventFromTicket();
            } else {
              console.log("Đã có thông tin sự kiện từ order/ticket, không cần tìm từ ticket");
            }
          }

          // Hàm tìm sự kiện từ thông tin vé
          async function fallbackToEventFromTicket() {
            try {
              // Kiểm tra nếu chuyển từ màn hình Ticket, ưu tiên thông tin từ params
              if (fromTicketScreen) {
                // Thử đọc thông tin từ selectedSeatsData được truyền từ Ticket
                const selectedSeatsJson = Array.isArray(params.selectedSeatsData) ? params.selectedSeatsData[0] : params.selectedSeatsData;
                if (selectedSeatsJson) {
                  try {
                    const parsedSeats = JSON.parse(selectedSeatsJson);
                    if (parsedSeats && parsedSeats.length > 0) {
                      // Tìm thông tin sự kiện từ dữ liệu ghế đã chọn
                      const firstSeat = parsedSeats[0];
                      
                      // Đọc trực tiếp các thông tin địa điểm và thời gian từ params
                      const location = params.location || params.venue || firstSeat.location || "Trung tâm Hội nghị Quốc gia";
                      const eventTime = params.eventTime || params.time || firstSeat.eventDate || firstSeat.time || "22/5/2025 19:30";
                      
                      if (firstSeat.eventName) {
                        const eventFromParams = {
                          id: firstSeat.eventId || firstSeat.eventDetailId || order.id,
                          eventName: firstSeat.eventName,
                          location: location,
                          time: eventTime,
                        };
                        console.log("Đã tạo thông tin sự kiện từ params selectedSeatsData:", eventFromParams);
                        setEvent(eventFromParams);
                        return true;
                      }
                    }
                  } catch (parseError) {
                    console.error("Lỗi khi phân tích dữ liệu ghế từ params:", parseError);
                  }
                }
                
                // Kiểm tra nếu có thông tin sự kiện trực tiếp từ params
                if (params.eventName) {
                  const location = params.location || params.venue || "Trung tâm Hội nghị Quốc gia";
                  const eventTime = params.eventTime || params.time || params.eventDate || "22/5/2025 19:30";
                  
                  const eventFromDirectParams = {
                    id: Array.isArray(params.eventId) ? params.eventId[0] : params.eventId,
                    eventName: Array.isArray(params.eventName) ? params.eventName[0] : params.eventName,
                    location: Array.isArray(location) ? location[0] : location,
                    time: Array.isArray(eventTime) ? eventTime[0] : eventTime,
                    // Đánh dấu thông tin này đến từ params
                    fromParams: true
                  };
                  
                  console.log("[PaymentScreen] Đã tạo thông tin sự kiện trực tiếp từ params:", eventFromDirectParams);
                  setEvent(eventFromDirectParams);
                  return true;
                }
              }
              
              // Tiếp tục logic hiện tại nếu không tìm được từ params
              // Ưu tiên lấy eventId từ ticket, nếu không có thì lấy từ selectedSeatsData hoặc order
              const ticketId = order.orderDetails[0]?.ticket?.id;
              let eventId = null;
              
              console.log(`Thử lấy thông tin sự kiện từ ticket. TicketId: ${ticketId}, EventId: ${eventId}`);
              
              if (order.orderDetails[0]?.ticket?.eventId) {
                eventId = order.orderDetails[0].ticket.eventId;
              } else if (order.orderDetails[0]?.ticket?.event?.id) {
                eventId = order.orderDetails[0].ticket.event.id;
              }
              
              if (!eventId && ticketId) {
                // Nếu không có eventId, fetch ticket để lấy eventId
                console.log(`Lấy thông tin ticket với ID: ${ticketId}`);
                const ticketData = await fetchTicket(ticketId);
                if (ticketData?.eventId) {
                  eventId = ticketData.eventId;
                } else if (ticketData?.event?.id) {
                  eventId = ticketData.event.id;
                }
                console.log(`Lấy được eventId từ ticket: ${eventId}`);
                
                // Nếu có ticketData, lưu lại để sử dụng sau này
                if (ticketData) {
                  setTicket(ticketData);
                }
              }
              
              if (eventId) {
                try {
                  console.log(`Lấy thông tin sự kiện với ID: ${eventId}`);
                  const eventData = await fetchEvent(eventId);
                  
                  // Kiểm tra và xây dựng thông tin sự kiện
                  let eventName = eventData?.name || eventData?.title || eventData?.eventName || "-";
                  let eventLocation = eventData?.location || eventData?.venue || "-";
                  let eventTime = "-";
                  
                  // Xử lý thời gian
                  if (eventData?.time) {
                    eventTime = eventData.time;
                  } else if (eventData?.startTime) {
                    const startDate = new Date(eventData.startTime);
                    const dateOptions = { day: "numeric", month: "long", year: "numeric" } as const;
                    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: false } as const;
                    
                    if (eventData.endTime) {
                      const endDate = new Date(eventData.endTime);
                      const startTimeStr = startDate.toLocaleTimeString('vi-VN', timeOptions);
                      const endTimeStr = endDate.toLocaleTimeString('vi-VN', timeOptions);
                      const dateStr = startDate.toLocaleDateString('vi-VN', dateOptions);
                      eventTime = `${startTimeStr} - ${endTimeStr}, ${dateStr}`;
                    } else {
                      eventTime = startDate.toLocaleString('vi-VN');
                    }
                  }
                  
                  setEvent({
                    ...eventData,
                    id: eventId,
                    eventName: eventName,
                    location: eventLocation,
                    time: eventTime,
                  });
                  
                  console.log("Đã cập nhật thông tin sự kiện từ ticket:", {
                    id: eventId,
                    eventName: eventName,
                    location: eventLocation,
                    time: eventTime
                  });
                  
                  // Đặt eventId vào state để có thể sử dụng cho các chức năng khác
                  setEventId(eventId);
                  return true;
                } catch (eventError) {
                  console.error("Lỗi khi lấy thông tin sự kiện:", eventError);
                }
              }
              
              // Nếu không tìm được sự kiện từ ticket hoặc có lỗi, tạo dữ liệu mặc định
              if (!event) {
                console.log("Không tìm được thông tin sự kiện, tạo thông tin mặc định từ dữ liệu đơn hàng");
                
                // Lấy loại vé để hiển thị
                let ticketType = "";
                if (selectedSeatsData.length > 0) {
                  ticketType = selectedSeatsData[0].type || selectedSeatsData[0].ticket?.type || "Tiêu chuẩn";
                  console.log(`Lấy loại vé từ seat.type: ${ticketType}`);
                }
                
                // Tạo thông tin cơ bản từ dữ liệu đơn hàng
                const defaultEvent = {
                  id: eventId || ticketId || order.id,
                  eventName: ticketType ? `Vé ${ticketType}` : "Thông tin đặt vé",
                  location: "Trung tâm Hội nghị Quốc gia",
                  time: "22/5/2025 19:30",
                };
                
                setEvent(defaultEvent);
                console.log("Đã tạo thông tin sự kiện mặc định:", defaultEvent);
                return true;
              }
              
              return false;
            } catch (error) {
              console.error("Lỗi khi tìm thông tin sự kiện từ ticket:", error);
              
              // Tạo thông tin mặc định nếu có lỗi
              const fallbackEvent = {
                id: order.id,
                eventName: "Đặt vé sự kiện",
                location: "Trung tâm Hội nghị Quốc gia",
                time: "22/5/2025 19:30",
              };
              
              setEvent(fallbackEvent);
              console.log("Đã tạo thông tin sự kiện mặc định khi có lỗi:", fallbackEvent);
              return true;
            }
          }
          return;
        }
        // Fallback: lấy từ selectedSeatsData như cũ
        const eventId = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId;
        let ticketId = Array.isArray(params.ticketId) ? params.ticketId[0] : params.ticketId;
        const selectedSeatsJson = Array.isArray(params.selectedSeatsData) ? params.selectedSeatsData[0] : params.selectedSeatsData;
        let parsedSeats = [];
        let hasEventInfo = false;
        
        if (selectedSeatsJson) {
          try {
            parsedSeats = JSON.parse(selectedSeatsJson);
            setSelectedSeatsData(parsedSeats);
            
            // Kiểm tra xem trong parsedSeats có thông tin sự kiện không
            if (parsedSeats.length > 0) {
              const firstSeat = parsedSeats[0];
              
              // Lấy ticketId nếu không có
              if ((!ticketId || ticketId === "undefined") && firstSeat.ticketId) {
                ticketId = firstSeat.ticketId;
              }
              
              // Thông tin địa điểm và thời gian từ params - ưu tiên sử dụng thông tin này
              const paramLocation = Array.isArray(params.location) ? params.location[0] : params.location;
              const paramTime = Array.isArray(params.time) ? params.time[0] : params.time;
              const paramEventName = Array.isArray(params.eventName) ? params.eventName[0] : params.eventName;
              
              // Tạo thông tin sự kiện từ params + seat nếu có
              if (firstSeat.eventName || firstSeat.eventId || paramEventName) {
                const eventFromSeat = {
                  id: firstSeat.eventId || firstSeat.eventDetailId || (typeof eventId === 'string' ? Number(eventId) : eventId),
                  eventName: paramEventName || firstSeat.eventName || `Vé ${firstSeat.type || "Tiêu chuẩn"}`,
                  location: paramLocation || firstSeat.location || "Trung tâm Hội nghị Quốc gia",
                  time: paramTime || firstSeat.time || firstSeat.eventDate || "22/5/2025 19:30",
                };
                
                console.log("[PaymentScreen] Đã tạo thông tin sự kiện từ selectedSeatsData và params:", eventFromSeat);
                setEvent(eventFromSeat);
                hasEventInfo = true;
                
                // Lưu eventId nếu có
                if (firstSeat.eventId) {
                  setEventId(typeof firstSeat.eventId === 'number' ? firstSeat.eventId : Number(firstSeat.eventId));
                }
              }
            }
          } catch (e) {
            console.error("Lỗi phân tích dữ liệu ghế đã chọn:", e);
            Alert.alert("Lỗi", "Không thể xử lý dữ liệu ghế đã chọn.");
          }
        }
        
        // Nếu có thông tin trực tiếp từ params (từ màn hình ghế chuyển sang) nhưng chưa tạo event
        if (!hasEventInfo && params.eventName) {
          const paramLocation = Array.isArray(params.location) ? params.location[0] : params.location;
          const paramTime = Array.isArray(params.time) ? params.time[0] : params.time;
          const paramEventName = Array.isArray(params.eventName) ? params.eventName[0] : params.eventName;
          
          const eventFromParams = {
            id: eventId ? (typeof eventId === 'string' ? Number(eventId) : eventId) : null,
            eventName: paramEventName || "Liveshow Ca Nhạc",
            location: paramLocation || "Trung tâm Hội nghị Quốc gia",
            time: paramTime || "22/5/2025 19:30",
          };
          
          console.log("[PaymentScreen] Đã tạo thông tin sự kiện từ params:", eventFromParams);
          setEvent(eventFromParams);
          hasEventInfo = true;
        }
        
        // Lấy dữ liệu sự kiện nếu chưa có và có eventId
        let eventData = null, ticketData = null;
        if (eventId && !hasEventInfo) {
          try {
            eventData = await fetchEvent(eventId);
            
            // Sau khi lấy được eventData, xử lý thông tin địa điểm và thời gian
            let eventLocation = "-";
            let eventTime = "-";
            
            // Kiểm tra thông tin địa điểm
            if (eventData.location) {
              eventLocation = eventData.location;
              console.log("Lấy location từ eventData.location:", eventLocation);
            } else if (eventData.eventDetails && eventData.eventDetails.length > 0) {
              // Nếu có eventDetails, lấy từ đây
              eventLocation = eventData.eventDetails[0].location || "-";
              console.log("Lấy location từ eventData.eventDetails:", eventLocation);
            } else if (eventData.eventDetail) {
              // Hoặc từ eventDetail nếu được trả về dạng đơn lẻ
              eventLocation = eventData.eventDetail.location || "-";
              console.log("Lấy location từ eventData.eventDetail:", eventLocation);
            }
            
            // Kiểm tra thông tin thời gian
            if (eventData.time) {
              eventTime = eventData.time;
              console.log("Lấy time từ eventData.time:", eventTime);
            } else if (eventData.eventDetails && eventData.eventDetails.length > 0 && eventData.eventDetails[0].startTime) {
              // Định dạng thời gian từ startTime và endTime
              const startDate = new Date(eventData.eventDetails[0].startTime);
              const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: false } as const;
              const dateOptions = { day: "numeric", month: "long", year: "numeric" } as const;
              
              if (eventData.eventDetails[0].endTime) {
                const endDate = new Date(eventData.eventDetails[0].endTime);
                const startTimeStr = startDate.toLocaleTimeString('vi-VN', timeOptions);
                const endTimeStr = endDate.toLocaleTimeString('vi-VN', timeOptions);
                const dateStr = startDate.toLocaleDateString('vi-VN', dateOptions);
                
                eventTime = `${startTimeStr} - ${endTimeStr}, ${dateStr}`;
              } else {
                eventTime = startDate.toLocaleString('vi-VN');
              }
              
              console.log("Đã định dạng time từ eventDetails:", eventTime);
            } else if (eventData.eventDetail && eventData.eventDetail.startTime) {
              // Tương tự nhưng từ eventDetail nếu được trả về dạng đơn lẻ
              const startDate = new Date(eventData.eventDetail.startTime);
              const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: false } as const;
              const dateOptions = { day: "numeric", month: "long", year: "numeric" } as const;
              
              if (eventData.eventDetail.endTime) {
                const endDate = new Date(eventData.eventDetail.endTime);
                const startTimeStr = startDate.toLocaleTimeString('vi-VN', timeOptions);
                const endTimeStr = endDate.toLocaleTimeString('vi-VN', timeOptions);
                const dateStr = startDate.toLocaleDateString('vi-VN', dateOptions);
                
                eventTime = `${startTimeStr} - ${endTimeStr}, ${dateStr}`;
              } else {
                eventTime = startDate.toLocaleString('vi-VN');
              }
              
              console.log("Đã định dạng time từ eventDetail:", eventTime);
            }
            
            setEvent({
              ...eventData,
              id: eventId,
              eventName: eventData?.eventName || eventData?.name || "-",
              location: eventLocation,
              address: eventData?.address || "-",
              time: eventTime,
            });
            
            console.log("Event info updated:", {
              eventName: eventData?.eventName || eventData?.name || "-",
              location: eventLocation,
              time: eventTime
            });
          } catch (e) {
            console.error("Lỗi khi lấy thông tin sự kiện:", e);
            Alert.alert("Lỗi", "Không thể lấy thông tin sự kiện.");
          }
        }
        if (ticketId) {
          ticketData = await fetchTicket(ticketId);
        }
        setTicket(ticketData);
      } catch (err) {
        Alert.alert("Lỗi", "Không thể lấy dữ liệu vé/sự kiện/ghế");
      }
    };
    fetchAll();
  }, [params.orderId, params.eventId, params.ticketId, params.seatId, params.selectedSeatsData]);

  useEffect(() => {
    const fetchSeatDetailsIfNeeded = async () => {
      const updatedSeats = await Promise.all(selectedSeatsData.map(async (seat) => {
        if (!seat.seatDetails) {
          try {
            const seatDetails = await fetchSeat(seat.seatId);
            return { ...seat, seatDetails };
          } catch {
            return seat;
          }
        }
        return seat;
      }));
      setSelectedSeatsData(updatedSeats);
    };
    if (selectedSeatsData.length > 0 && !selectedSeatsData[0].seatDetails) {
      fetchSeatDetailsIfNeeded();
    }
  }, [selectedSeatsData]);

  // Hàm lấy danh sách quà tặng từ server
  const loadGifts = async () => {
    try {
      let giftsList = [];
      
      // Xác định eventId
      let targetEventId = null;
      
      // Tạo mảng các khả năng để có thể lấy eventId
      const possibleEventIds = [
        event?.eventDetail?.event?.id,
        event?.id,
        event?.eventDetail?.id,
        event?.eventDetail?.eventId,
        eventDetailId,
        eventId,
        ticket?.eventId,
        ticket?.event?.id
      ].filter(id => id !== undefined && id !== null);
      
      if (possibleEventIds.length > 0) {
        targetEventId = possibleEventIds[0];
        console.log(`EventId được xác định để lấy quà tặng: ${targetEventId}`);
      } else {
        console.log(`Không tìm thấy eventId để lấy quà tặng`);
      }
      
      // Ưu tiên lấy quà tặng theo sự kiện nếu có thông tin targetEventId
      if (targetEventId) {
        console.log(`Đang lấy quà tặng theo sự kiện ID: ${targetEventId}`);
        try {
          giftsList = await fetchGiftsByEvent(targetEventId);
          console.log(`Đã lấy được ${giftsList.length} quà tặng từ eventId ${targetEventId}`);
        } catch (error) {
          console.log(`Lỗi khi lấy quà tặng theo sự kiện ${targetEventId}:`, error);
        }
      }
      
      // Nếu không có quà tặng theo sự kiện hoặc không có targetEventId, lấy tất cả quà tặng
      if (giftsList.length === 0) {
        console.log('Không có quà tặng theo sự kiện, lấy tất cả quà tặng...');
        try {
          giftsList = await fetchGifts();
          console.log(`Đã lấy được ${giftsList.length} quà tặng từ danh sách chung`);
        } catch (error) {
          console.log(`Lỗi khi lấy danh sách quà tặng chung:`, error);
        }
      }
      
      if (giftsList && giftsList.length > 0) {
        console.log(`Đã lấy được ${giftsList.length} quà tặng`);
        setGifts(giftsList);
      } else {
        // Fallback dữ liệu mẫu nếu không lấy được từ server
        const defaultGifts = [
          { id: 1, name: "Áo thun sự kiện", imageUrl: "https://cdn-icons-png.flaticon.com/512/892/892458.png" },
          { id: 2, name: "Móc khóa kỷ niệm", imageUrl: "https://cdn-icons-png.flaticon.com/512/4213/4213964.png" },
          { id: 3, name: "Sticker ca sĩ", imageUrl: "https://cdn-icons-png.flaticon.com/512/5266/5266248.png" },
          { id: 4, name: "Poster có chữ ký", imageUrl: "https://cdn-icons-png.flaticon.com/512/1355/1355275.png" },
          { id: 5, name: "Ly cốc đặc biệt", imageUrl: "https://cdn-icons-png.flaticon.com/512/1474/1474645.png" },
          { id: 6, name: "Vòng tay lưu niệm", imageUrl: "https://cdn-icons-png.flaticon.com/512/2416/2416714.png" },
        ];
        setGifts(defaultGifts);
        console.log("Đã sử dụng dữ liệu quà tặng mặc định");
      }
    } catch (error) {
      // Fallback dữ liệu mẫu nếu có lỗi
      const defaultGifts = [
        { id: 1, name: "Áo thun sự kiện", imageUrl: "https://cdn-icons-png.flaticon.com/512/892/892458.png" },
        { id: 2, name: "Móc khóa kỷ niệm", imageUrl: "https://cdn-icons-png.flaticon.com/512/4213/4213964.png" },
        { id: 3, name: "Sticker ca sĩ", imageUrl: "https://cdn-icons-png.flaticon.com/512/5266/5266248.png" },
        { id: 4, name: "Poster có chữ ký", imageUrl: "https://cdn-icons-png.flaticon.com/512/1355/1355275.png" },
        { id: 5, name: "Ly cốc đặc biệt", imageUrl: "https://cdn-icons-png.flaticon.com/512/1474/1474645.png" },
        { id: 6, name: "Vòng tay lưu niệm", imageUrl: "https://cdn-icons-png.flaticon.com/512/2416/2416714.png" },
      ];
      setGifts(defaultGifts);
      console.log("Đã sử dụng dữ liệu quà tặng mặc định khi có lỗi");
    }
  };

  useEffect(() => {
    // Load gifts khi có bất kỳ thay đổi nào về thông tin sự kiện
    loadGifts();
  }, [event, eventId, eventDetailId, fromTicketScreen]);

  useEffect(() => {
    // Animation effect on component mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(moveAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Khởi tạo hàm polling
  const startPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    // Hàm kiểm tra trạng thái đơn hàng
    const checkOrderStatus = async () => {
      console.log('[Polling] Đang kiểm tra trạng thái đơn hàng...');
      try {
        const currentOrderId = orderIdRef.current;
        if (currentOrderId) {
          console.log(`[Polling] orderId hiện tại: ${currentOrderId}`);
          console.log(`[Polling] Đang gọi fetchOrder(${currentOrderId})...`);
          const order = await fetchOrder(String(currentOrderId));
          console.log(`[Polling] Trạng thái từ API: type=${typeof order.status}, value='${order.status}'`);
          const isPaidOrCompleted = order.status === 'COMPLETED' || order.status === 'PAID' || order.status === 'paid';
          console.log(`[Polling] Điều kiện chuyển hướng (isPaidOrCompleted): ${isPaidOrCompleted}`);
          if (isPaidOrCompleted) {
            clearInterval(pollingRef.current!);
            pollingRef.current = null;
            await AsyncStorage.setItem('lastOrderId', String(currentOrderId));
            router.replace("/payment_screen/PaymentSuccessScreen");
            console.log(`[Polling] Trạng thái đơn hàng ${currentOrderId} là PAID/COMPLETED. Chuyển hướng thành công.`);
          } else {
            console.log(`[Polling] Trạng thái đơn hàng ${currentOrderId} là: ${order.status}. Tiếp tục polling.`);
          }
        }
      } catch (error) {
        console.error('[Polling] Lỗi khi kiểm tra trạng thái đơn hàng:', error);
      }
    };
    
    // Thiết lập polling mỗi 3 giây
    pollingRef.current = setInterval(checkOrderStatus, 3000);
  };

  // Hàm trợ giúp hiển thị lỗi và cho phép thử lại
  const showErrorAndRetry = (message: string, details?: string) => {
    console.error(`Lỗi thanh toán: ${message}`, details);
    setPaymentLoading(false);
    
    Alert.alert(
      "Lỗi thanh toán", 
      `${message}${details ? "\n\n" + details : ""}`,
      [
        { text: "Thử lại", onPress: () => onPayment() },
        { text: "Hủy", style: "cancel" }
      ]
    );
  };

  const onPayment = async () => {
    try {
      setPaymentLoading(true);
      
      // Kiểm tra email
      if (!email) {
        Alert.alert("Lỗi", "Bạn cần đăng nhập để thanh toán");
        setPaymentLoading(false);
        return;
      }

      let token = await AsyncStorage.getItem("token");
      if (!token) {
        token = await SecureStore.getItemAsync("access_token");
        if (token) {
          await AsyncStorage.setItem("token", token);
        }
      }
      
      if (!token) {
        Alert.alert("Bạn cần đăng nhập để thanh toán.");
        router.push("/LoginScreen");
        return;
      }

      // Log thông tin thanh toán để debug
      console.log("Thông tin thanh toán:", {
        orderId,
        selectedSeatsData,
        email,
        selectedGifts
      });

      // Kiểm tra dữ liệu ghế trước khi thanh toán
      if (!selectedSeatsData || selectedSeatsData.length === 0) {
        Alert.alert("Lỗi", "Không có thông tin ghế để thanh toán");
        setPaymentLoading(false);
        return;
      }

      // Kiểm tra thông tin giá vé
      const hasValidPrice = selectedSeatsData.every(seat => 
        seat.price && typeof seat.price === 'number' && seat.price > 0
      );
      
      if (!hasValidPrice) {
        Alert.alert("Lỗi", "Thông tin giá vé không hợp lệ");
        setPaymentLoading(false);
        return;
      }

      // Sửa lại việc gọi API - sử dụng orderId như là ticket, selectedGifts[0] nếu có, làm giftId
      const giftId = selectedGifts.length > 0 ? selectedGifts[0] : undefined;
      
      try {
        // Nếu không có orderId, chúng ta chỉ truyền selectedSeatsData và email
        // handlePayment sẽ tự tạo đơn hàng mới
        console.log("Gọi API thanh toán với orderId:", orderId || "Không có (sẽ tạo mới)");
        
        let result;
        if (orderId) {
          result = await handlePayment(orderId, selectedSeatsData, email, giftId);
        } else {
          // Tạo đơn hàng mới
          result = await handlePayment("create_new", selectedSeatsData, email, giftId);
        }
        
        console.log("Kết quả thanh toán:", result);

        // Cập nhật state orderId với orderId thực tế (có thể là mới tạo)
        setOrderId(result.orderId || orderId);

        if (result?.paymentUrl) {
          // Lưu orderId trước khi mở URL thanh toán
          await AsyncStorage.setItem('lastOrderId', String(result.orderId || orderId));
          Linking.openURL(result.paymentUrl);
          startPolling();
        } else if (result && 
          ((result.status && typeof result.status === 'string' && result.status === 'success') || 
           (result.success === true))) {
          // Nếu thanh toán thành công nhưng không cần chuyển hướng
          Alert.alert("Thành công", "Đơn hàng của bạn đã được xử lý thành công!");
          console.log(`[onPayment] Thanh toán thành công, không cần URL redirect. Chuyển hướng đến PaymentSuccessScreen.`);
          // Lưu orderId và chuyển đến màn hình Ticket
          await AsyncStorage.setItem('lastOrderId', String(result.orderId || orderId));
          router.replace("/payment_screen/PaymentSuccessScreen");
        } else {
          Alert.alert("Lỗi", "Không thể tạo URL thanh toán. Vui lòng thử lại sau.");
        }
      } catch (paymentError: any) {
        console.error("Chi tiết lỗi thanh toán:", paymentError);
        
        // Hiển thị thông báo lỗi cụ thể nếu có
        const errorMessage = paymentError.message || "Không thể xử lý thanh toán. Vui lòng thử lại sau.";
        showErrorAndRetry(errorMessage);
      }
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      showErrorAndRetry("Không thể xử lý thanh toán. Vui lòng thử lại sau.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Lấy thông tin động từ event (ưu tiên event, fallback ticketData nếu cần)
  const eventName = event?.eventName || event?.name || "-";
  const location = event?.location || "-";
  const time = event?.time || (event?.startTime ? new Date(event.startTime).toLocaleString('vi-VN') : "-");
  const ticketType = ticket?.data?.type || "-";

  // Hàm lấy label ghế đẹp
  const getSeatLabel = (seat: any) => {
    if (seat.seatDetails) {
      const row = seat.seatDetails.row || "";
      const number = seat.seatDetails.number || "";
      if (row && number) return `${row}-${number}`;
      if (row) return row;
      if (number) return number;
    }
    return seat.seatId || "-";
  };

  // Lấy thông tin ghế từ selectedSeatsData
  const seatLabels = selectedSeatsData.map(getSeatLabel).join(', ');

  // Tính tổng tiền từ danh sách ghế
  const total = selectedSeatsData.reduce((sum, seat) => sum + (Number(seat.price) || 0), 0);

  // Cleanup function
  const cleanup = useCallback(() => {
    setSelectedSeatsData([]);
    setEvent(null);
    setTicket(null);
    setSeat(null);
    setSelectedGifts([]);
  }, []);

  // Cleanup when unmounting
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // DEBUG - Kiểm tra điều kiện vô hiệu hóa nút
  console.log("DEBUG NÚT THANH TOÁN:", {
    paymentLoading,
    email,
    orderId,
    buttonDisabled: paymentLoading || !email || (!orderId && selectedSeatsData.length === 0)
  });

  return (
    <View style={styles.container}>
      <PaymentHeader onBack={() => router.back()} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: moveAnim }]
        }}>
          <PaymentCountdown initialSeconds={900} />
        </Animated.View>

        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: moveAnim }],
          marginBottom: 12
        }}>
          {event && (
            <PaymentEventInfo
              eventName={event.eventName || event.name || event.event?.eventName || ""}
              location={event.location || event.venue || event.event?.location || ""}
              time={event.time || event.eventTime || ""}
              eventNumber={event.eventNumber || ""}
              eventData={{
                ...event,
                // Đánh dấu thông tin này đến từ params nếu có
                fromParams: event.fromParams || false
              }}
            />
          )}
        </Animated.View>

        {selectedSeatsData?.length > 0 && (
          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: moveAnim }]
          }}>
            <PaymentOrderCard
              ticketType={ticket?.type || "Tiêu chuẩn"}
              ticketPrice={ticket?.price || 0}
              seatLabel={seat?.label || ""}
              total={selectedSeatsData.reduce((acc, curr) => acc + (curr.price || 0) * (curr.quantity || 1), 0)}
              selectedSeats={selectedSeatsData}
            />
          </Animated.View>
        )}

        {gifts?.length > 0 && (
          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: moveAnim }]
          }}>
            <PaymentGiftSelect
              gifts={gifts.map(gift => ({ 
                id: gift.id, 
                name: gift.name, 
                image: gift.imageUrl || "https://cdn-icons-png.flaticon.com/512/892/892458.png" 
              }))}
              selectedGifts={selectedGifts}
              setSelectedGifts={setSelectedGifts}
            />
          </Animated.View>
        )}
        
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: moveAnim }]
        }}>
          <PaymentTicketInfo email={email} />
        </Animated.View>
      </ScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.payButton, paymentLoading && styles.payButtonLoading]}
          onPress={onPayment}
          disabled={paymentLoading || !email || (!orderId && selectedSeatsData.length === 0)}
          activeOpacity={0.8}
        >
          {paymentLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" style={{marginRight: 10}} />
              <Text style={styles.payButtonText}>Đang xử lý...</Text>
            </View>
          ) : (
            <>
              <Ionicons name="wallet-outline" size={24} color="black" style={{marginRight: 10}} />
              <Text style={styles.payButtonText}>Thanh toán ngay</Text>
            </>
          )}
        </TouchableOpacity>
        
        <View style={styles.secureInfoContainer}>
          <MaterialIcons name="security" size={18} color="#00FF99" />
          <Text style={styles.secureInfoText}>Giao dịch an toàn & bảo mật</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  paymentCard: {
    backgroundColor: "#232526",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    marginTop: 8,
    shadowColor: "#00FF99",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    paddingTop: 12,
    backgroundColor: 'rgba(20, 20, 20, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: "#00FF99",
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 24,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#00FF99",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  payButtonLoading: {
    backgroundColor: "#009966",
  },
  payButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  secureInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  secureInfoText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginLeft: 6,
  },
});
