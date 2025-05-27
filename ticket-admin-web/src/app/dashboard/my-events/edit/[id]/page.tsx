"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import EventService, { Event, EventDetail, Gift as GiftType, Ticket } from "@/services/event.service";
import Link from "next/link";

interface Gift {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

interface Organizer {
  id: number;
  name: string;
  logo_url: string;
  legal_representative: string;
  address: string;
  hotline: string;
  email: string;
  business_license: string;
}

// Hàm chuyển đổi UTC string sang local ISO string cho input datetime-local
function toLocalISOString(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .slice(0, 16);
}

// Hàm chuyển đổi local datetime-local string về UTC ISO string
function toUTCISOString(localDateString: string) {
  if (!localDateString) return '';
  const date = new Date(localDateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString();
}

const CLOUD_NAME = "dgqk4pu2n";
const UPLOAD_PRESET = "events";

async function uploadToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  return data.secure_url;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id;

  const [event, setEvent] = useState<Event>({
    id: 0,
    eventName: '',
    mainImageUrl: '',
    eventDetails: [{
      id: 0,
      description: '',
      location: '',
      detailImageUrl: '',
      startTime: '',
      endTime: '',
      status: 'active'
    }],
    tickets: [],
    eventGifts: [],
    status: 'active',
    organizer: {
      id: 0,
      name: '',
      logo_url: '',
      legal_representative: '',
      address: '',
      hotline: '',
      email: '',
      business_license: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableGifts, setAvailableGifts] = useState<GiftType[]>([]);
  const [selectedGiftIds, setSelectedGiftIds] = useState<number[]>([]);

  useEffect(() => {
    if (eventId) {
      Promise.all([
        fetchEvent(Number(eventId)),
        fetchGifts()
      ]);
    }
  }, [eventId]);

  const fetchGifts = async () => {
    try {
      const gifts = await EventService.getAllGifts();
      setAvailableGifts(gifts);
    } catch (err) {
      console.error("Error fetching gifts:", err);
      setError("Không thể tải danh sách quà tặng.");
    }
  };

  const fetchEvent = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEvent = await EventService.getEventById(id);
      
      // Ensure tickets array is properly initialized
      const tickets = fetchedEvent.tickets || [];
      
      setEvent({
        ...fetchedEvent,
        tickets: tickets,  // Use the processed tickets array
        eventDetails: fetchedEvent.eventDetails?.length > 0 ? fetchedEvent.eventDetails : [{
          id: 0,
          description: '',
          location: '',
          detailImageUrl: '',
          startTime: '',
          endTime: '',
          status: 'active'
        }],
        organizer: fetchedEvent.organizer || {
          id: 0,
          name: '',
          logo_url: '',
          legal_representative: '',
          address: '',
          hotline: '',
          email: '',
          business_license: ''
        }
      });
      setSelectedGiftIds(fetchedEvent.eventGifts?.map(eg => eg.giftId) || []);

      console.log('Fetched tickets:', tickets); // For debugging
    } catch (err) {
      console.error("Lỗi khi lấy thông tin sự kiện:", err);
      setError("Không thể tải thông tin sự kiện.");
    } finally {
      setLoading(false);
    }
  };

  const handleEventDetailChange = (field: keyof EventDetail, value: string) => {
    setEvent(prev => ({
      ...prev,
      eventDetails: prev.eventDetails.map(detail =>
        field === 'description'
          ? { ...detail, description: value }
          : { ...detail, [field]: value }
      )
    }));
  };

  const handleShowTimeChange = (index: number, field: keyof EventDetail, value: string) => {
    setEvent(prev => ({
      ...prev,
      eventDetails: prev.eventDetails.map((detail, i) => 
        i === index ? { ...detail, [field]: value } : detail
      )
    }));
  };

  const handleAddShowTime = () => {
    setEvent(prev => ({
      ...prev,
      eventDetails: [...prev.eventDetails, {
        id: 0,
        description: prev.eventDetails[0].description,
        location: prev.eventDetails[0].location,
        detailImageUrl: prev.eventDetails[0].detailImageUrl,
        startTime: '',
        endTime: '',
        status: 'active'
      }]
    }));
  };

  const handleRemoveShowTime = (index: number) => {
    if (index === 0) return; // Không cho phép xóa chi tiết đầu tiên
    setEvent(prev => ({
      ...prev,
      eventDetails: prev.eventDetails.filter((_, i) => i !== index)
    }));
  };

  const handleTicketChange = (index: number, field: keyof Ticket, value: string | number) => {
    const newTickets = [...event.tickets];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setEvent({ ...event, tickets: newTickets });
  };

  const addTicket = () => {
    // Check if we already have tickets
    if (event.tickets.length > 0) {
      setError("Bạn đã có loại vé cho sự kiện này. Vui lòng chỉnh sửa loại vé hiện có hoặc xóa nó trước khi thêm mới.");
      return;
    }

    setEvent(prev => ({
      ...prev,
      tickets: [...prev.tickets, {
        type: '',
        price: 0,
        quantity: 0
      }]
    }));
  };

  const removeTicket = (index: number) => {
    setEvent(prev => ({
      ...prev,
      tickets: prev.tickets.filter((_, i) => i !== index)
    }));
  };

  const handleGiftSelection = (giftId: number) => {
    setSelectedGiftIds(prev => 
      prev.includes(giftId)
        ? prev.filter(id => id !== giftId)
        : [...prev, giftId]
    );
  };

  const handleOrganizerChange = (field: keyof Organizer, value: string) => {
    setEvent(prev => ({
      ...prev,
      organizer: {
        ...prev.organizer,
        [field]: value
      }
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const logoUrl = await uploadToCloudinary(file);
        handleOrganizerChange('logo_url', logoUrl);
      } catch (err) {
        console.error("Error uploading logo:", err);
        setError("Không thể tải lên logo.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!event.eventName || !event.mainImageUrl) {
        setError("Vui lòng điền đầy đủ thông tin cơ bản của sự kiện");
        setSaving(false);
        return;
      }

      // Validate event details
      for (const detail of event.eventDetails) {
        if (!detail.description || !detail.location || !detail.detailImageUrl || !detail.startTime || !detail.endTime) {
          setError("Vui lòng điền đầy đủ thông tin cho tất cả các lịch diễn");
          setSaving(false);
          return;
        }

        // Validate date ranges
        const startTime = new Date(detail.startTime);
        const endTime = new Date(detail.endTime);
        
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          setError("Thời gian không hợp lệ");
          setSaving(false);
          return;
        }

        if (endTime <= startTime) {
          setError("Thời gian kết thúc phải sau thời gian bắt đầu");
          setSaving(false);
          return;
        }
      }

      // Validate tickets
      if (!event.tickets || event.tickets.length === 0) {
        setError("Vui lòng thêm ít nhất một loại vé");
        setSaving(false);
        return;
      }

      for (const ticket of event.tickets) {
        if (!ticket.type || ticket.price < 0 || ticket.quantity < 0) {
          setError("Vui lòng kiểm tra lại thông tin vé");
          setSaving(false);
          return;
        }
      }

      // Validate organizer
      if (!event.organizer || !event.organizer.name || !event.organizer.legal_representative || 
          !event.organizer.address || !event.organizer.hotline || !event.organizer.email || 
          !event.organizer.business_license) {
        setError("Vui lòng điền đầy đủ thông tin nhà tổ chức");
        setSaving(false);
        return;
      }

      const updateData = {
        eventName: event.eventName,
        mainImageUrl: event.mainImageUrl,
        status: event.status,
        eventDetails: event.eventDetails.map(detail => ({
          id: detail.id || undefined,
          description: detail.description,
          location: detail.location,
          detailImageUrl: detail.detailImageUrl,
          startTime: toUTCISOString(detail.startTime),
          endTime: toUTCISOString(detail.endTime),
          status: detail.status || 'active'
        })),
        tickets: event.tickets.map(ticket => ({
          id: ticket.id || undefined,
          type: ticket.type,
          price: Number(ticket.price),
          quantity: Number(ticket.quantity)
        })),
        giftIds: selectedGiftIds,
        organizer: event.organizer ? {
          id: event.organizer.id || undefined,
          name: event.organizer.name,
          logo_url: event.organizer.logo_url,
          legal_representative: event.organizer.legal_representative,
          address: event.organizer.address,
          hotline: event.organizer.hotline,
          email: event.organizer.email,
          business_license: event.organizer.business_license
        } : undefined
      };

      await EventService.updateEvent(Number(eventId), updateData);
      router.push("/dashboard/my-events");
    } catch (err: any) {
      console.error("Lỗi khi cập nhật sự kiện:", err);
      setError(err.response?.data?.message || "Không thể cập nhật sự kiện. Vui lòng thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-white text-center">Đang tải thông tin sự kiện...</p>;
  if (error) return <p className="text-red-400 text-center">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 mb-6">
        Chỉnh sửa sự kiện
      </h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Thông tin cơ bản */}
        <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-semibold text-indigo-300">Thông tin cơ bản</h2>
          
          <div>
            <label className="block text-sm font-semibold text-indigo-300 mb-2">
              Tên sự kiện
            </label>
            <input
              type="text"
              value={event.eventName}
              onChange={(e) => setEvent({ ...event, eventName: e.target.value })}
              className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-indigo-300 mb-2">
              Trạng thái
            </label>
            <select
              value={event.status}
              onChange={(e) => setEvent({ ...event, status: e.target.value })}
              className="block w-full px-4 py-2 bg-[#232347] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              style={{ backgroundColor: '#232347', color: 'white' }}
            >
              <option value="upcoming" style={{ backgroundColor: '#232347', color: 'white' }}>Sắp diễn ra</option>
              <option value="active" style={{ backgroundColor: '#232347', color: 'white' }}>Đang hoạt động</option>
              <option value="completed" style={{ backgroundColor: '#232347', color: 'white' }}>Đã kết thúc</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-indigo-300 mb-2">
              Mô tả
            </label>
            <textarea
              value={event.eventDetails[0].description}
              onChange={(e) => handleEventDetailChange('description', e.target.value)}
              className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-indigo-300 mb-2">
              Địa điểm
            </label>
            <input
              type="text"
              value={event.eventDetails[0].location}
              onChange={(e) => handleEventDetailChange('location', e.target.value)}
              className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-indigo-300 mb-2">
              Ảnh chính
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={event.mainImageUrl}
                onChange={(e) => setEvent({ ...event, mainImageUrl: e.target.value })}
                className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="main-image-upload"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const url = await uploadToCloudinary(e.target.files[0]);
                    setEvent((prev) => ({ ...prev, mainImageUrl: url }));
                  }
                }}
              />
              <label htmlFor="main-image-upload" className="px-3 py-1 bg-indigo-500 text-white rounded cursor-pointer">
                Chọn ảnh
              </label>
            </div>
            {event.mainImageUrl && (
              <img src={event.mainImageUrl} alt="Preview" className="mt-2 rounded-lg max-h-32" />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-indigo-300 mb-2">
              Ảnh chi tiết
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={event.eventDetails[0].detailImageUrl}
                onChange={(e) => handleEventDetailChange('detailImageUrl', e.target.value)}
                className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="detail-image-upload"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const url = await uploadToCloudinary(e.target.files[0]);
                    handleEventDetailChange('detailImageUrl', url);
                  }
                }}
              />
              <label htmlFor="detail-image-upload" className="px-3 py-1 bg-indigo-500 text-white rounded cursor-pointer">
                Chọn ảnh
              </label>
            </div>
            {event.eventDetails[0].detailImageUrl && (
              <img src={event.eventDetails[0].detailImageUrl} alt="Detail Preview" className="mt-2 rounded-lg max-h-32" />
            )}
          </div>
        </div>

        {/* Lịch diễn */}
        <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-indigo-300">Lịch diễn</h2>
            <button
              type="button"
              onClick={handleAddShowTime}
              className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Thêm lịch diễn
            </button>
          </div>

          {event.eventDetails.map((detail, index) => (
            <div key={index} className="p-6 border border-indigo-500/30 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-indigo-300">Lịch diễn #{index + 1}</h3>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveShowTime(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Xóa
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-indigo-300 mb-2">
                    Thời gian bắt đầu
                  </label>
                  <input
                    type="datetime-local"
                    value={detail.startTime ? toLocalISOString(detail.startTime) : ''}
                    onChange={(e) => handleShowTimeChange(index, 'startTime', e.target.value)}
                    className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-indigo-300 mb-2">
                    Thời gian kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    value={detail.endTime ? toLocalISOString(detail.endTime) : ''}
                    onChange={(e) => handleShowTimeChange(index, 'endTime', e.target.value)}
                    className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tickets Section */}
        <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-indigo-300">Loại vé</h2>
            <button
              type="button"
              onClick={addTicket}
              className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Thêm loại vé
            </button>
          </div>

          {event.tickets.map((ticket, index) => (
            <div key={index} className="p-6 border border-indigo-500/30 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-indigo-300">Loại vé #{index + 1}</h3>
                {event.tickets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicket(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Xóa
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-indigo-300 mb-2">
                    Loại vé
                  </label>
                  <select
                    value={ticket.type}
                    onChange={(e) => handleTicketChange(index, 'type', e.target.value)}
                    className="block w-full px-4 py-2 bg-[#232347] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    style={{ backgroundColor: '#232347', color: 'white' }}
                    required
                  >
                    <option value="" style={{ backgroundColor: '#232347', color: 'white' }}>Chọn loại vé</option>
                    <option value="VIP" style={{ backgroundColor: '#232347', color: 'white' }}>VIP</option>
                    <option value="Premium" style={{ backgroundColor: '#232347', color: 'white' }}>Premium</option>
                    <option value="Standard" style={{ backgroundColor: '#232347', color: 'white' }}>Standard</option>
                    <option value="Economy" style={{ backgroundColor: '#232347', color: 'white' }}>Economy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-indigo-300 mb-2">
                    Giá vé
                  </label>
                  <input
                    type="number"
                    value={ticket.price}
                    onChange={(e) => handleTicketChange(index, 'price', parseFloat(e.target.value))}
                    className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-indigo-300 mb-2">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    value={ticket.quantity}
                    onChange={(e) => handleTicketChange(index, 'quantity', parseInt(e.target.value))}
                    className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gifts Section */}
        <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-semibold text-indigo-300">Quà tặng</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableGifts.map((gift) => (
              <div
                key={gift.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedGiftIds.includes(gift.id)
                    ? 'border-indigo-500 bg-indigo-500/20'
                    : 'border-gray-600 hover:border-indigo-500/50'
                }`}
                onClick={() => handleGiftSelection(gift.id)}
              >
                <img
                  src={gift.imageUrl}
                  alt={gift.name}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <h3 className="font-medium text-white">{gift.name}</h3>
                <p className="text-sm text-gray-300">{gift.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Phần thông tin ban tổ chức */}
        <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-semibold text-indigo-300">Thông tin ban tổ chức</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-indigo-300 mb-2">Tên ban tổ chức</label>
              <input
                type="text"
                value={event.organizer?.name || ''}
                onChange={(e) => handleOrganizerChange('name', e.target.value)}
                className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-300 mb-2">Logo</label>
              <div className="mt-1 flex items-center">
                {event.organizer?.logo_url && (
                  <img src={event.organizer.logo_url} alt="Logo" className="h-12 w-12 object-cover mr-2 rounded" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-300 mb-2">Người đại diện pháp lý</label>
              <input
                type="text"
                value={event.organizer?.legal_representative || ''}
                onChange={(e) => handleOrganizerChange('legal_representative', e.target.value)}
                className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-300 mb-2">Địa chỉ</label>
              <input
                type="text"
                value={event.organizer?.address || ''}
                onChange={(e) => handleOrganizerChange('address', e.target.value)}
                className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-300 mb-2">Hotline</label>
              <input
                type="text"
                value={event.organizer?.hotline || ''}
                onChange={(e) => handleOrganizerChange('hotline', e.target.value)}
                className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-300 mb-2">Email</label>
              <input
                type="email"
                value={event.organizer?.email || ''}
                onChange={(e) => handleOrganizerChange('email', e.target.value)}
                className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-300 mb-2">Giấy phép kinh doanh</label>
              <input
                type="text"
                value={event.organizer?.business_license || ''}
                onChange={(e) => handleOrganizerChange('business_license', e.target.value)}
                className="block w-full px-4 py-2 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Nút trả về tự động */}
        <button
          type="button"
          className="inline-flex items-center px-6 py-3 shadow-lg text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          onClick={async () => {
            setSaving(true);
            try {
              await EventService.resetEventStatusToAuto(event.id);
              window.location.reload();
            } catch (err) {
              setError("Không thể trả về trạng thái tự động.");
            } finally {
              setSaving(false);
            }
          }}
        >
          Trả về tự động
        </button>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 shadow-lg text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          
          <Link
            href="/dashboard/my-events"
            className="inline-flex items-center px-6 py-3 shadow-lg text-base font-semibold rounded-2xl text-white bg-gray-600 hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
} 