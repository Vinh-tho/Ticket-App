"use client";

import { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import EventService, { Event } from "@/services/event.service";

const extractCityName = (address: string) => {
  // Tìm "Thành Phố" hoặc "Tỉnh" trong địa chỉ
  const cityMatch = address.match(/(Thành Phố|Tỉnh)\s+([^,]+)/i);
  if (cityMatch) {
    // Chỉ lấy tên thành phố (không lấy "Thành Phố" hoặc "Tỉnh")
    return cityMatch[2].trim();
  }
  
  // Nếu không tìm thấy, tách theo dấu phẩy và lấy phần cuối
  const parts = address.split(',');
  const lastPart = parts[parts.length - 1].trim();
  // Loại bỏ "Thành Phố" hoặc "Tỉnh" nếu có
  return lastPart.replace(/(Thành Phố|Tỉnh)\s+/i, '').trim();
};

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    setError(null);
    try {
      const fetchedEvents = await EventService.getMyEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Không thể tải dữ liệu sự kiện.");
    } finally {
      setLoadingEvents(false);
    }
  };

  const filteredEvents = events.filter(e =>
    (e.eventName?.toLowerCase() ?? '').includes(search.toLowerCase()) ||
    (e.eventDetails?.[0]?.location?.toLowerCase() ?? '').includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      try {
        await EventService.deleteEvent(id);
        // Refresh the event list after successful deletion
        fetchEvents();
      } catch (err) {
        console.error(`Error deleting event with id ${id}:`, err);
        setError(`Không thể xóa sự kiện với ID ${id}.`);
      }
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Sự kiện của tôi</h1>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/my-events/create"
            className="inline-flex items-center px-6 py-3 shadow-lg text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Thêm sự kiện
          </Link>
        </div>
      </div>
      <div className="flex items-center mb-6">
        <div className="relative rounded-2xl shadow-lg max-w-xs w-full bg-white/10 backdrop-blur-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-indigo-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/20 transition-all duration-300"
            placeholder="Tìm kiếm sự kiện..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {loadingEvents ? (
        <p className="text-white text-center">Đang tải sự kiện...</p>
      ) : error ? (
        <p className="text-red-400 text-center">{error}</p>
      ) : (
        <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider">Mã</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider">Tên sự kiện</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider">Địa điểm</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider">Ngày tổ chức</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-indigo-300 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white/5 divide-y divide-white/10">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-white/10 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-base text-white font-semibold">{event.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{event.eventName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {event.eventDetails?.[0]?.location 
                        ? extractCityName(event.eventDetails[0].location)
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {event.eventDetails && event.eventDetails[0]?.startTime 
                        ? new Date(event.eventDetails[0].startTime).toLocaleDateString() 
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-md
                        ${event.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : event.status === "upcoming"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-500/20 text-gray-400"}
                      `}>
                        {event.status === "active" 
                          ? "Đang diễn ra"
                          : event.status === "upcoming"
                          ? "Sắp diễn ra"
                          : "Đã kết thúc"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2 justify-end">
                      <Link
                        href={`/dashboard/my-events/edit/${event.id}`}
                        className="p-2 rounded-full bg-indigo-500/10 hover:bg-indigo-500/30 text-indigo-400 hover:text-white transition-all"
                        title="Sửa"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-white transition-all"
                        title="Xoá"
                        onClick={() => handleDelete(event.id)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Không tìm thấy sự kiện nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}