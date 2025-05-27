"use client";

import { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from "@heroicons/react/24/outline";
import ticketService from "@/services/ticket.service";
import { Ticket } from '@/services/ticket.service';

console.log('===> tickets page loaded');

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Ticket>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('===> useEffect in tickets page called');
    setIsLoading(true);
    ticketService.getTicketsOfMyEvents()
      .then((data) => {
        console.log('===> getTicketsOfMyEvents returned:', data);
        setTickets(data);
      })
      .catch((err) => {
        console.error('===> getTicketsOfMyEvents error:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSort = (field: keyof Ticket) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.id.toString().includes(searchTerm.toLowerCase()) ||
      ticket.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.event?.eventName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === "event") {
      aValue = a.event?.eventName || "";
      bValue = b.event?.eventName || "";
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const handleDeleteTicket = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vé này?")) {
      try {
        await ticketService.deleteTicket(id);
        setTickets(tickets.filter((ticket) => ticket.id !== id));
      } catch (error) {
        console.error("Error deleting ticket:", error);
        alert("Có lỗi xảy ra khi xóa vé!");
      }
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800";
      case "limited":
        return "bg-yellow-100 text-yellow-800";
      case "sold_out":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "Còn vé";
      case "limited":
        return "Sắp hết";
      case "sold_out":
        return "Hết vé";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Quản lý vé</h1>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-6 py-3 shadow-lg text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Thêm vé mới
          </button>
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
            placeholder="Tìm kiếm vé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
          </div>
        ) : sortedTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40">
            <span className="text-lg text-indigo-300 font-semibold">Không có vé nào thuộc các sự kiện bạn đã tạo.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Mã vé</span>
                      {sortField === "id" && (
                        sortDirection === "asc"
                          ? <ArrowUpIcon className="h-4 w-4 text-indigo-400" />
                          : <ArrowDownIcon className="h-4 w-4 text-indigo-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider">Sự kiện</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider">Loại vé</th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Giá</span>
                      {sortField === "price" && (
                        sortDirection === "asc"
                          ? <ArrowUpIcon className="h-4 w-4 text-indigo-400" />
                          : <ArrowDownIcon className="h-4 w-4 text-indigo-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider">Số lượng</th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Trạng thái</span>
                      {sortField === "status" && (
                        sortDirection === "asc"
                          ? <ArrowUpIcon className="h-4 w-4 text-indigo-400" />
                          : <ArrowDownIcon className="h-4 w-4 text-indigo-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-indigo-300 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white/5 divide-y divide-white/10">
                {sortedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-white/10 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-base text-white font-semibold">
                      {ticket.code || ticket.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {ticket.event?.eventName || "Không rõ"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {ticket.event?.startDate ? (
                        <>
                          {new Date(ticket.event.startDate).toLocaleDateString('vi-VN')}
                          {ticket.event.endDate && ` - ${new Date(ticket.event.endDate).toLocaleDateString('vi-VN')}`}
                        </>
                      ) : "Chưa xác định"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{ticket.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{ticket.price.toLocaleString()}đ</td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{ticket.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2 justify-end">
                      <button
                        className="p-2 rounded-full bg-indigo-500/10 hover:bg-indigo-500/30 text-indigo-400 hover:text-white transition-all"
                        title="Sửa"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-white transition-all"
                        title="Xoá"
                        onClick={() => handleDeleteTicket(ticket.id)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedTickets.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      Không tìm thấy vé nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 