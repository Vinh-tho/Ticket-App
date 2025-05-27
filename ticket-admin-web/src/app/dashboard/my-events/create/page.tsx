"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import authService from "@/services/auth.service";

const CLOUD_NAME = "dgqk4pu2n";
const UPLOAD_PRESET = "events";

interface EventDetailForm {
  startTime: string;
  endTime: string;
}

interface TicketForm {
  type: string;
  price: string;
  quantity: string;
}

interface Gift {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

interface OrganizerForm {
  name: string;
  logo_url: string;
  legal_representative: string;
  address: string;
  hotline: string;
  email: string;
  business_license: string;
}

// Add global styles
const globalStyles = `
  select option {
    background-color: #1a1a2e !important;
    color: white !important;
  }
`;

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    eventName: "",
    mainImageUrl: "",
    description: "",
    location: "",
    detailImageUrl: ""
  });
  const [eventDetails, setEventDetails] = useState<EventDetailForm[]>([]);
  const [detailForm, setDetailForm] = useState<EventDetailForm>({
    startTime: "",
    endTime: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingDetail, setUploadingDetail] = useState(false);
  const [tickets, setTickets] = useState<TicketForm[]>([]);
  const [ticketForm, setTicketForm] = useState<TicketForm>({ type: "", price: "", quantity: "" });
  const [ticketMessage, setTicketMessage] = useState("");
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [selectedGiftIds, setSelectedGiftIds] = useState<number[]>([]);
  const [organizerForm, setOrganizerForm] = useState<OrganizerForm>({
    name: "",
    logo_url: "",
    legal_representative: "",
    address: "",
    hotline: "",
    email: "",
    business_license: ""
  });

  const TICKET_TYPES = ["VIP", "Premium", "Standard", "Economy"];

  // Add style tag to head
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = globalStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Kiểm tra authentication khi vào trang
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    // Fetch danh sách quà tặng khi component mount
    const fetchGifts = async () => {
      try {
        const response = await api.get("/events/gifts");
        setGifts(response.data);
      } catch (err) {
        console.error("Error fetching gifts:", err);
      }
    };
    fetchGifts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUploadMain = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setForm(f => ({ ...f, mainImageUrl: data.secure_url }));
    } catch (err) {
      setError("Lỗi upload ảnh. Vui lòng thử lại.");
    } finally {
      setUploadingMain(false);
    }
  };

  const handleUploadDetail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDetail(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setForm(f => ({ ...f, detailImageUrl: data.secure_url }));
    } catch (err) {
      setError("Lỗi upload ảnh. Vui lòng thử lại.");
    } finally {
      setUploadingDetail(false);
    }
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetailForm(prev => ({ ...prev, [name]: value }));
    setError(""); // Clear any existing error when user makes changes
  };

  const handleAddDetail = () => {
    if (!detailForm.startTime || !detailForm.endTime) {
      setError("Vui lòng chọn thời gian bắt đầu và kết thúc");
      return;
    }
    
    const startDate = new Date(detailForm.startTime);
    const endDate = new Date(detailForm.endTime);
    const now = new Date();
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError("Thời gian không hợp lệ");
      return;
    }

    // Validate start time must be in the future
    if (startDate <= now) {
      setError("Thời gian bắt đầu phải sau thời điểm hiện tại");
      return;
    }

    if (endDate <= startDate) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    // Check if there is any overlap with existing event details
    const hasOverlap = eventDetails.some(detail => {
      const existingStart = new Date(detail.startTime);
      const existingEnd = new Date(detail.endTime);
      return (startDate <= existingEnd && endDate >= existingStart);
    });

    if (hasOverlap) {
      setError("Thời gian này bị trùng với lịch diễn khác");
      return;
    }

    setEventDetails([...eventDetails, detailForm]);
    setDetailForm({ startTime: "", endTime: "" });
    setError(""); // Clear error message after successful add
  };

  const handleRemoveDetail = (idx: number) => {
    setEventDetails(eventDetails.filter((_, i) => i !== idx));
  };

  const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketForm({ ...ticketForm, [e.target.name]: e.target.value });
  };

  const handleTicketTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTicketForm({ ...ticketForm, type: e.target.value });
  };

  const handleAddTicket = () => {
    setTicketMessage("");
    if (tickets.length >= 4) {
      setTicketMessage("Đã đủ loại vé");
      return;
    }
    if (!ticketForm.type || !ticketForm.price || !ticketForm.quantity) {
      setTicketMessage("Vui lòng điền đầy đủ thông tin vé");
      return;
    }

    // Validate price
    const price = Number(ticketForm.price);
    if (isNaN(price) || price <= 0) {
      setTicketMessage("Giá vé phải là số dương");
      return;
    }

    // Validate quantity
    const quantity = Number(ticketForm.quantity);
    if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      setTicketMessage("Số lượng vé phải là số nguyên dương");
      return;
    }

    if (tickets.some(t => t.type === ticketForm.type)) {
      setTicketMessage("Loại vé này đã được thêm");
      return;
    }
    setTickets([...tickets, ticketForm]);
    setTicketForm({ type: "", price: "", quantity: "" });
  };

  const handleRemoveTicket = (idx: number) => {
    setTickets(tickets.filter((_, i) => i !== idx));
  };

  const handleGiftToggle = (giftId: number) => {
    setSelectedGiftIds(prev => {
      if (prev.includes(giftId)) {
        return prev.filter(id => id !== giftId);
      } else {
        return [...prev, giftId];
      }
    });
  };

  const handleOrganizerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setOrganizerForm({ ...organizerForm, [e.target.name]: e.target.value });
  };

  const handleOrganizerLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setOrganizerForm(f => ({ ...f, logo_url: data.secure_url }));
    } catch (err) {
      setError("Lỗi upload ảnh. Vui lòng thử lại.");
    } finally {
      setUploadingMain(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Validate organizer form
    if (!organizerForm.name || !organizerForm.logo_url || !organizerForm.legal_representative || 
        !organizerForm.address || !organizerForm.hotline || !organizerForm.email || !organizerForm.business_license) {
      setError("Vui lòng điền đầy đủ thông tin ban tổ chức");
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(organizerForm.email)) {
      setError("Email không hợp lệ");
      setLoading(false);
      return;
    }

    // Validate phone number format (Vietnam)
    const phoneRegex = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
    if (!phoneRegex.test(organizerForm.hotline)) {
      setError("Số điện thoại không hợp lệ");
      setLoading(false);
      return;
    }

    // Validate all required fields
    if (!form.eventName.trim()) {
      setError("Vui lòng nhập tên sự kiện");
      setLoading(false);
      return;
    }

    if (!form.mainImageUrl) {
      setError("Vui lòng upload ảnh chính cho sự kiện");
      setLoading(false);
      return;
    }

    if (!form.description.trim()) {
      setError("Vui lòng nhập mô tả chi tiết");
      setLoading(false);
      return;
    }

    if (!form.location.trim()) {
      setError("Vui lòng nhập địa điểm");
      setLoading(false);
      return;
    }

    if (!form.detailImageUrl) {
      setError("Vui lòng upload ảnh chi tiết cho sự kiện");
      setLoading(false);
      return;
    }

    if (eventDetails.length === 0) {
      setError("Vui lòng thêm ít nhất 1 lịch diễn cho sự kiện");
      setLoading(false);
      return;
    }

    if (tickets.length === 0) {
      setError("Vui lòng thêm ít nhất 1 loại vé cho sự kiện");
      setLoading(false);
      return;
    }

    try {
      // First create organizer
      const organizerResponse = await api.post("/organizers", organizerForm);
      const organizerId = organizerResponse.data.id;

      const eventData = {
        eventName: form.eventName,
        mainImageUrl: form.mainImageUrl,
        description: form.description,
        location: form.location,
        detailImageUrl: form.detailImageUrl,
        eventDetails: eventDetails.map(detail => ({
          startTime: detail.startTime,
          endTime: detail.endTime,
          location: form.location,
          description: form.description,
          detailImageUrl: form.detailImageUrl,
          status: 'active'
        })),
        tickets: tickets.map(t => ({
          type: t.type,
          price: Number(t.price),
          quantity: Number(t.quantity)
        })),
        giftIds: selectedGiftIds,
        organizer: {
          id: organizerId
        }
      };

      await api.post("/events", eventData);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/my-events");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tạo sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const availableTypes = TICKET_TYPES.filter(type => !tickets.some(t => t.type === type));
  const isAddTicketDisabled = availableTypes.length === 0;

  return (
    <div className="flex flex-col min-h-screen py-8 items-center">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative">
        <button
          className="absolute top-4 left-4 px-4 py-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-semibold shadow hover:from-indigo-400 hover:to-cyan-400 transition-all"
          onClick={() => router.push("/dashboard/my-events")}
        >
          ← Quay lại
        </button>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 mb-8 text-center">Thêm sự kiện mới</h2>
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="mb-4 text-green-500 text-center font-semibold">Thêm sự kiện thành công!</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-indigo-300 mb-4">Thông tin ban tổ chức</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1">Tên ban tổ chức</label>
                <input 
                  name="name" 
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={organizerForm.name} 
                  onChange={handleOrganizerChange} 
                  placeholder="Nhập tên ban tổ chức"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1">Logo</label>
                <input type="file" accept="image/*" onChange={handleOrganizerLogoUpload} className="text-white"/>
                {uploadingMain && <div className="text-xs text-indigo-400 mt-1">Đang upload...</div>}
                {organizerForm.logo_url && <img src={organizerForm.logo_url} alt="logo" className="mt-2 rounded-xl max-h-32" />}
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1">Người đại diện pháp luật</label>
                <input 
                  name="legal_representative" 
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={organizerForm.legal_representative} 
                  onChange={handleOrganizerChange} 
                  placeholder="Nhập tên người đại diện"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1">Địa chỉ</label>
                <input 
                  name="address" 
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={organizerForm.address} 
                  onChange={handleOrganizerChange} 
                  placeholder="Nhập địa chỉ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1">Hotline</label>
                <input 
                  name="hotline" 
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={organizerForm.hotline} 
                  onChange={handleOrganizerChange} 
                  placeholder="Nhập số hotline"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1">Email</label>
                <input 
                  name="email" 
                  type="email"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={organizerForm.email} 
                  onChange={handleOrganizerChange} 
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1">Giấy phép kinh doanh</label>
                <textarea 
                  name="business_license" 
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={organizerForm.business_license} 
                  onChange={handleOrganizerChange} 
                  placeholder="Nhập thông tin giấy phép kinh doanh"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-indigo-300 mb-4">Thông tin sự kiện</h3>
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-1">Tên sự kiện</label>
            <input 
              name="eventName" 
              className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              value={form.eventName} 
              onChange={handleChange} 
              placeholder="Nhập tên sự kiện"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-1">Ảnh chính</label>
            <input type="file" accept="image/*" onChange={handleUploadMain} className="text-white"/>
            {uploadingMain && <div className="text-xs text-indigo-400 mt-1">Đang upload...</div>}
            {form.mainImageUrl && <img src={form.mainImageUrl} alt="main" className="mt-2 rounded-xl max-h-32" />}
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-1">Mô tả chi tiết</label>
            <textarea 
              name="description" 
              className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              value={form.description} 
              onChange={handleChange}
              placeholder="Nhập mô tả chi tiết" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-1">Địa điểm</label>
            <input 
              name="location" 
              className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              value={form.location} 
              onChange={handleChange}
              placeholder="Nhập địa điểm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-1">Ảnh chi tiết</label>
            <input type="file" accept="image/*" onChange={handleUploadDetail} className="text-white"/>
            {uploadingDetail && <div className="text-xs text-indigo-400 mt-1">Đang upload...</div>}
            {form.detailImageUrl && <img src={form.detailImageUrl} alt="detail" className="mt-2 rounded-xl max-h-32" />}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-indigo-300">Danh sách lịch diễn</span>
              <span className="text-xs text-indigo-200">(Có thể thêm nhiều lịch diễn cho 1 sự kiện)</span>
            </div>
            {eventDetails.length === 0 && <div className="text-sm text-gray-400 mb-2">Chưa có lịch diễn nào.</div>}
            <ul className="space-y-3 mb-4">
              {eventDetails.map((d, idx) => (
                <li key={idx} className="bg-white/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="font-semibold text-white">{form.eventName || "Chưa có tên sự kiện"}</div>
                    <div className="text-xs text-indigo-200">
                      {form.location || "Chưa có địa điểm"} | {new Date(d.startTime).toLocaleString('vi-VN')} - {new Date(d.endTime).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <button type="button" className="text-red-400 hover:text-red-600 font-bold text-lg" onClick={() => handleRemoveDetail(idx)}>Xóa</button>
                </li>
              ))}
            </ul>
            <div className="bg-white/10 rounded-xl p-4 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-indigo-200 mb-1">Bắt đầu <span className="text-red-400">*</span></label>
                  <input 
                    name="startTime" 
                    type="datetime-local" 
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={detailForm.startTime} 
                    onChange={handleDetailChange}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-indigo-200 mb-1">Kết thúc <span className="text-red-400">*</span></label>
                  <input 
                    name="endTime" 
                    type="datetime-local" 
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={detailForm.endTime} 
                    onChange={handleDetailChange}
                  />
                </div>
              </div>
              {error && error.includes("thời gian") && (
                <div className="text-red-400 text-sm">{error}</div>
              )}
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={handleAddDetail}
                  disabled={!detailForm.startTime || !detailForm.endTime}
                  className="px-4 py-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-semibold shadow hover:from-indigo-400 hover:to-cyan-400 transition-all disabled:opacity-50"
                >
                  Thêm lịch diễn
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-indigo-300">Cấu hình vé cho sự kiện</span>
              <span className="text-xs text-indigo-200">(Có thể thêm nhiều loại vé)</span>
            </div>
            {tickets.length === 0 && <div className="text-sm text-gray-400 mb-2">Chưa có loại vé nào.</div>}
            <ul className="space-y-3 mb-4">
              {tickets.map((t, idx) => (
                <li key={idx} className="bg-white/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="font-semibold text-white">{t.type}</div>
                    <div className="text-xs text-indigo-200">Giá: {t.price} | Số lượng: {t.quantity}</div>
                  </div>
                  <button type="button" className="text-red-400 hover:text-red-600 font-bold text-lg" onClick={() => handleRemoveTicket(idx)}>Xóa</button>
                </li>
              ))}
            </ul>
            <div className="bg-white/10 rounded-xl p-4 space-y-3">
              <div className="flex gap-2 flex-wrap">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-indigo-200 mb-1">Loại vé</label>
                  <select 
                    name="type" 
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={ticketForm.type} 
                    onChange={handleTicketTypeChange}
                    disabled={isAddTicketDisabled}
                  >
                    <option value="">Chọn loại vé</option>
                    {availableTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-indigo-200 mb-1">Giá vé</label>
                  <input 
                    name="price" 
                    type="number" 
                    min="0" 
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={ticketForm.price} 
                    onChange={handleTicketChange}
                    placeholder="Nhập giá vé" 
                    disabled={isAddTicketDisabled}
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-indigo-200 mb-1">Số lượng</label>
                  <input 
                    name="quantity" 
                    type="number" 
                    min="1" 
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={ticketForm.quantity} 
                    onChange={handleTicketChange}
                    placeholder="Nhập số lượng" 
                    disabled={isAddTicketDisabled}
                  />
                </div>
              </div>
              {ticketMessage && <div className="text-red-500 text-sm mt-2">{ticketMessage}</div>}
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={handleAddTicket}
                  disabled={isAddTicketDisabled || !ticketForm.type || !ticketForm.price || !ticketForm.quantity}
                  className="px-4 py-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-semibold shadow hover:from-indigo-400 hover:to-cyan-400 transition-all disabled:opacity-50"
                >
                  Thêm vé
                </button>
              </div>
              {isAddTicketDisabled && <div className="text-indigo-300 text-xs mt-2">Đã thêm đủ các loại vé.</div>}
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-indigo-300">Quà tặng cho sự kiện</span>
              <span className="text-xs text-indigo-200">(Có thể chọn nhiều quà tặng)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gifts.map(gift => (
                <div
                  key={gift.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedGiftIds.includes(gift.id)
                      ? 'bg-indigo-500/30 border-2 border-indigo-500'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  onClick={() => handleGiftToggle(gift.id)}
                >
                  <div className="flex items-center gap-3">
                    <img src={gift.imageUrl} alt={gift.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <h3 className="font-semibold text-white">{gift.name}</h3>
                      <p className="text-xs text-indigo-200">{gift.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button type="submit" disabled={loading || uploadingMain || uploadingDetail} className="px-6 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-semibold shadow-lg hover:from-indigo-400 hover:to-cyan-400 transition-all disabled:opacity-60">
              {loading ? "Đang thêm..." : "Tạo sự kiện"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 