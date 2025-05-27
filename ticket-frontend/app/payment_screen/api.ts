import axios from "axios";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../constants/config";

export const fetchTicket = async (ticketId: number | string) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}/tickets/${ticketId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000,
  });
  return response.data;
};

export const fetchEvent = async (eventId: number | string) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}/events/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000,
  });
  return response.data;
};

export const fetchSeat = async (seatId: number | string) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}/seats/${seatId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000,
  });
  return response.data;
};

export const handlePayment = async (orderId: number | string, selectedSeats: any[], userEmail: string, giftId?: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    
    // Log chi tiết dữ liệu đầu vào
    console.log('OrderId:', orderId);
    console.log('Raw selectedSeats:', JSON.stringify(selectedSeats, null, 2));
    console.log('UserEmail:', userEmail);
    console.log('Selected giftId:', giftId);
    
    // Xử lý dữ liệu ghế
    const processedSeats = selectedSeats.map(seat => {
      // Log chi tiết từng ghế
      console.log('Processing seat:', JSON.stringify(seat, null, 2));
      
      // Lấy seatId từ đúng vị trí
      const seatId = seat.id || seat.seatId || seat.seatDetails?.id;
      console.log('Found seatId:', seatId);
      
      if (!seatId) {
        console.error('Missing seatId for seat:', seat);
        throw new Error('Thiếu thông tin ID ghế');
      }

      // Lấy ticketId
      const ticketId = seat.ticketId || seat.ticket?.id || seat.seatDetails?.ticket?.id;
      console.log('Found ticketId:', ticketId);
      
      if (!ticketId) {
        console.error('Missing ticket ID for seat:', seat);
        throw new Error('Thiếu thông tin vé cho ghế đã chọn');
      }

      // Lấy giá
      let price = 0;
      if (seat.price) {
        price = parseFloat(seat.price);
      } else if (seat.seatDetails?.ticket?.price) {
        price = parseFloat(seat.seatDetails.ticket.price);
      } else if (seat.seatDetails?.price) {
        price = parseFloat(seat.seatDetails.price);
      } else if (seat.ticket?.price) {
        price = parseFloat(seat.ticket.price);
      }
      
      if (isNaN(price) || price <= 0) {
        console.error('Invalid price for seat:', seat);
        throw new Error('Giá vé không hợp lệ');
      }

      const processedSeat = {
        ticketId: parseInt(String(ticketId), 10),
        quantity: seat.quantity || 1,
        seatId: parseInt(String(seatId), 10),
        price: Math.round(price * 100) / 100
      };

      console.log('Processed seat:', processedSeat);
      return processedSeat;
    });

    // Log dữ liệu đã xử lý
    console.log('All processed seats:', JSON.stringify(processedSeats, null, 2));

    // Hàm tạo URL thanh toán với cơ chế retry
    const createPaymentUrl = async (orderId: string | number, totalAmount: number, retryCount = 0) => {
      try {
        console.log(`Đang tạo payment URL với orderId: ${orderId}, totalAmount: ${totalAmount}`);
        // Kiểm tra token trước khi gọi API
        let currentToken = await AsyncStorage.getItem("token");
        if (!currentToken || currentToken.length < 10) {
          console.log("Token không hợp lệ, thử lấy lại token từ SecureStore");
          const secureToken = await import("expo-secure-store").then(module => 
            module.getItemAsync("access_token")
          );
          if (secureToken) {
            currentToken = secureToken;
            await AsyncStorage.setItem("token", secureToken);
            console.log("Đã cập nhật token mới từ SecureStore");
          }
        }
        
        if (!currentToken) {
          throw new Error("Không có token hợp lệ để thanh toán");
        }

        const paymentResponse = await axios.post(
          `${BASE_URL}/payments/vnpay/create`,
          {
            orderId: orderId,
            amount: totalAmount,
          },
          {
            headers: { Authorization: `Bearer ${currentToken}` },
            timeout: 15000, // Tăng timeout
          }
        );

        return paymentResponse.data;
      } catch (error) {
        console.error("Lỗi khi tạo URL thanh toán:", error);
        if (retryCount < 2) {
          console.log(`Thử tạo lại payment URL lần ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 1s
          return createPaymentUrl(orderId, totalAmount, retryCount + 1);
        }
        throw error;
      }
    };

    // Nếu orderId là "create_new", tạo đơn hàng mới luôn
    if (orderId === "create_new") {
      console.log("Bắt đầu tạo đơn hàng mới theo yêu cầu");
      // Đi thẳng đến tạo đơn hàng mới
    } else {
      // Kiểm tra xem đã có order sẵn hay chưa
      try {
        const existingOrder = await fetchOrder(orderId);
        if (existingOrder && existingOrder.id) {
          console.log('Order đã tồn tại, tạo thanh toán trực tiếp:', existingOrder.id);
          
          // Kiểm tra trạng thái order
          if (existingOrder.status === 'PAID' || existingOrder.status === 'COMPLETED') {
            console.log('Order đã thanh toán, trả về thành công');
            return { success: true, status: 'success', orderId: existingOrder.id };
          }
          
          // Tính tổng tiền
          const totalAmount = processedSeats.reduce((sum, seat) => sum + seat.price, 0);
          
          // Tạo URL thanh toán VNPay với cơ chế thử lại
          const paymentData = await createPaymentUrl(existingOrder.id, totalAmount);
          const { paymentUrl } = paymentData;
          
          if (!paymentUrl) throw new Error("Không nhận được URL thanh toán.");

          return { paymentUrl, orderId: existingOrder.id };
        }
      } catch (error) {
        console.log("Không tìm thấy hoặc có lỗi khi kiểm tra order, tạo mới:", error);
        // Nếu có lỗi khi kiểm tra order, tiếp tục tạo mới
      }
    }

    // Tạo đơn hàng mới
    // Nếu chưa có order, tạo order mới
    const orderData = {
      userId: await getUserIdFromEmail(userEmail), // Chuyển email thành userId
      eventDetailId: selectedSeats[0]?.eventDetailId ? Number(selectedSeats[0].eventDetailId) : undefined,
      items: processedSeats,
      ...(giftId !== undefined && giftId !== null ? { giftId: Number(giftId) } : {})
    };

    console.log('Final order data:', JSON.stringify(orderData, null, 2));

    // Gửi request tạo đơn hàng
    const orderResponse = await axios.post(
      `${BASE_URL}/orders`,
      orderData,
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      }
    );

    console.log('Order response:', JSON.stringify(orderResponse.data, null, 2));

    const order = orderResponse.data.data;
    if (!order.id) {
      console.error("Order API response:", orderResponse.data);
      throw new Error(orderResponse.data?.message || "Không tạo được đơn hàng.");
    }

    // Calculate total amount
    const totalAmount = processedSeats.reduce((sum, seat) => sum + seat.price, 0);

    // Thử tạo URL thanh toán với cơ chế retry
    const paymentData = await createPaymentUrl(order.id, totalAmount);

    const { paymentUrl } = paymentData;
    if (!paymentUrl) throw new Error("Không nhận được URL thanh toán.");

    return { paymentUrl, orderId: order.id };
  } catch (error) {
    console.error("Lỗi trong quá trình thanh toán:", error);
    throw error; // Ném lỗi để hàm gọi có thể xử lý
  }
};

export const fetchOrder = async (orderId: number | string) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000,
  });
  return response.data.data;
};

export const markOrderAsPaid = async (orderId: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.patch(
    `${BASE_URL}/orders/${orderId}/pay`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    }
  );
  return response.data;
};

export const fetchGifts = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/gifts`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    return response.data.data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách quà tặng:", error);
    // Trả về mảng rỗng nếu có lỗi
    return [];
  }
};

export const fetchGiftsByEvent = async (eventId: number) => {
  try {
    // Kiểm tra eventId có hợp lệ không
    if (!eventId || isNaN(Number(eventId))) {
      console.log(`EventId không hợp lệ: ${eventId}`);
      return [];
    }

    const token = await AsyncStorage.getItem("token");
    console.log(`Đang gọi API lấy quà tặng cho sự kiện ID: ${eventId}`);
    
    // Thử gọi API theo cả hai endpoint (events và events-detail) để tăng khả năng thành công
    try {
      // Thử endpoint đầu tiên: /events/{eventId}/gifts
      const response = await axios.get(`${BASE_URL}/events/${eventId}/gifts`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      console.log(`Lấy quà tặng thành công từ endpoint events với ID: ${eventId}`);
      return response.data.data || [];
    } catch (error1) {
      console.log(`Thử endpoint thứ hai sau khi gặp lỗi: ${error1}`);
      // Nếu endpoint đầu tiên thất bại, thử endpoint thứ hai: /events-detail/{eventId}/gifts
      try {
        const response = await axios.get(`${BASE_URL}/events-detail/${eventId}/gifts`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });
        console.log(`Lấy quà tặng thành công từ endpoint events-detail với ID: ${eventId}`);
        return response.data.data || [];
      } catch (error2) {
        // console.error(`Cả hai endpoint đều thất bại cho sự kiện ${eventId}`);
        throw error2;
      }
    }
  } catch (error) {
    // console.error(`Lỗi khi lấy danh sách quà tặng cho sự kiện ${eventId}:`, error);
    
    // Log chi tiết hơn về lỗi API
    if (axios.isAxiosError(error)) {
      // console.error('Chi tiết lỗi API lấy quà tặng:', {
      //   status: error.response?.status,
      //   data: error.response?.data,
      //   headers: error.response?.headers
      // });
    }
    
    // Trả về mảng rỗng nếu có lỗi
    return [];
  }
};

export const fetchEventDetailInfo = async (eventDetailId: number | string) => {
  // <<< LOG ĐẶC BIỆT ĐỂ NHẬN BIẾT >>>
  console.log(`[DEBUG_API] fetchEventDetailInfo: BẮT ĐẦU xử lý cho eventDetailId = ${eventDetailId}`);

  if (!eventDetailId) {
    console.error("[DEBUG_API] fetchEventDetailInfo: eventDetailId bị rỗng hoặc undefined!");
    return null; // Hoặc ném lỗi tùy theo cách bạn muốn xử lý
  }

  // Thêm cơ chế thử lại khi API fails
  const MAX_RETRIES = 2;
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[DEBUG_API] fetchEventDetailInfo: Thử lại lần thứ ${attempt} cho eventDetailId = ${eventDetailId}`);
        // Đợi 1 giây trước khi thử lại để tránh quá tải server
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const token = await AsyncStorage.getItem("token");
      console.log(`[DEBUG_API] fetchEventDetailInfo: Đang chuẩn bị gọi API cho eventDetailId = ${eventDetailId} với token: ${token ? 'có token' : 'KHÔNG CÓ TOKEN'}`);
      
      // Đường dẫn API chính
      const apiUrl = `${BASE_URL}/events-detail/${eventDetailId}`;
      try {
        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000, // Tăng timeout để chắc chắn
        });

        // <<< LOG QUAN TRỌNG NHẤT: DỮ LIỆU THÔ TỪ API >>>
        console.log(`[DEBUG_API] fetchEventDetailInfo: Kết quả API THÔ cho eventDetailId = ${eventDetailId}:`, JSON.stringify(response.data, null, 2));
        
        let eventDetailData = null;
        if (response.data?.data) {
          eventDetailData = response.data.data;
          console.log(`[DEBUG_API] fetchEventDetailInfo: Trích xuất eventDetailData từ response.data.data cho id ${eventDetailId}`);
        } else if (response.data && typeof response.data === 'object') {
          eventDetailData = response.data;
          console.log(`[DEBUG_API] fetchEventDetailInfo: Trích xuất eventDetailData trực tiếp từ response.data cho id ${eventDetailId}`);
        } else {
          console.warn(`[DEBUG_API] fetchEventDetailInfo: Response.data không có cấu trúc data mong đợi cho id ${eventDetailId}. Response.data:`, response.data);
        }
        
        console.log(`[DEBUG_API] fetchEventDetailInfo: Dữ liệu eventDetailData SẼ TRẢ VỀ cho id ${eventDetailId}:`, JSON.stringify(eventDetailData, null, 2));
        return eventDetailData;
      } catch (error) {
        // Nếu endpoint đầu tiên thất bại, thử endpoint thứ hai
        console.log(`[DEBUG_API] fetchEventDetailInfo: Endpoint chính thất bại, thử endpoint phụ...`);
        const backupApiUrl = `${BASE_URL}/events/${eventDetailId}/detail`;
        const response = await axios.get(backupApiUrl, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        
        console.log(`[DEBUG_API] fetchEventDetailInfo: Kết quả từ API phụ cho eventDetailId = ${eventDetailId}:`, JSON.stringify(response.data, null, 2));
        
        let eventDetailData = null;
        if (response.data?.data) {
          eventDetailData = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          eventDetailData = response.data;
        }
        
        console.log(`[DEBUG_API] fetchEventDetailInfo: Dữ liệu từ API phụ SẼ TRẢ VỀ cho id ${eventDetailId}:`, JSON.stringify(eventDetailData, null, 2));
        return eventDetailData;
      }
    } catch (error: any) {
      lastError = error;
      console.error(`[DEBUG_API] fetchEventDetailInfo: LỖI (lần thử ${attempt + 1}/${MAX_RETRIES + 1}) khi gọi API cho eventDetailId = ${eventDetailId}:`, error.message);
      
      if (axios.isAxiosError(error)) {
        console.error('[DEBUG_API] Axios error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config,
        });
      } else {
        console.error('[DEBUG_API] Non-Axios error details:', error);
      }
      
      // Nếu đây không phải là lần thử cuối cùng, tiếp tục vòng lặp để thử lại
      if (attempt < MAX_RETRIES) {
        continue;
      }
    }
  }

  // Tất cả các lần thử đều thất bại, thử fallback cuối cùng: lấy từ /events
  try {
    console.log(`[DEBUG_API] fetchEventDetailInfo: Tất cả cách thử đều thất bại, thử endpoint fallback cuối cùng...`);
    const token = await AsyncStorage.getItem("token");
    const fallbackResponse = await axios.get(`${BASE_URL}/events/${eventDetailId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    
    console.log(`[DEBUG_API] fetchEventDetailInfo: Kết quả từ endpoint fallback:`, JSON.stringify(fallbackResponse.data, null, 2));
    
    // Tạo đối tượng event detail từ event data
    const eventData = fallbackResponse.data?.data || fallbackResponse.data;
    if (eventData) {
      const eventDetailData = {
        id: eventDetailId,
        eventId: eventData.id,
        event: eventData,
        name: eventData.name || eventData.eventName || eventData.title,
        location: eventData.location || eventData.venue,
        time: eventData.time || eventData.startTime
      };
      
      console.log(`[DEBUG_API] fetchEventDetailInfo: Đã tạo eventDetailData từ fallback:`, JSON.stringify(eventDetailData, null, 2));
      return eventDetailData;
    }
  } catch (fallbackError) {
    console.error(`[DEBUG_API] fetchEventDetailInfo: Cả endpoint fallback cuối cùng cũng thất bại:`, fallbackError);
  }
  
  // Nếu tất cả đều thất bại, trả về null
  return null;
};

// Hàm lấy userId từ token JWT hoặc từ email
export const getUserIdFromEmail = async (email: string): Promise<number> => {
  try {
    // Thử lấy từ token
    const token = await AsyncStorage.getItem("token");
    if (token) {
      try {
        // Giải mã token để lấy userId
        const { jwtDecode } = await import("jwt-decode");
        const decoded: any = jwtDecode(token);
        
        if (decoded.userId && typeof decoded.userId === 'number') {
          console.log(`Lấy được userId=${decoded.userId} từ token JWT`);
          return decoded.userId;
        }
        
        if (decoded.sub && typeof decoded.sub === 'number') {
          console.log(`Lấy được userId=${decoded.sub} từ token JWT (field sub)`);
          return decoded.sub;
        }
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
      }
    }
    
    // Nếu không lấy được từ token, thử gọi API lấy thông tin người dùng từ email
    try {
      const response = await axios.get(`${BASE_URL}/users/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      
      if (response.data && response.data.id) {
        console.log(`Lấy được userId=${response.data.id} từ API với email=${email}`);
        return response.data.id;
      }
    } catch (apiError) {
      console.error("Lỗi khi lấy thông tin người dùng từ API:", apiError);
    }
    
    // Không tìm được, dùng số ngẫu nhiên từ email
    const randomId = Math.floor(1000 + Math.random() * 9000);
    console.log(`Không tìm được userId, sử dụng ID tạm thời: ${randomId}`);
    return randomId;
  } catch (error) {
    console.error("Lỗi khi lấy userId:", error);
    // Trả về ID mặc định nếu có lỗi
    return 1;
  }
};
