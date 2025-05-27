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
import userService, { User, CreateUserData, UpdateUserData } from "@/services/user.service";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof User>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user"
  });
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getBuyersOfMyEvents();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleDeleteUser = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await userService.deleteUser(id);
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error(`Error deleting user with id ${id}:`, error);
        alert("Không thể xóa người dùng. Vui lòng thử lại sau.");
      }
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "banned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Không hoạt động";
      case "banned":
        return "Bị khóa";
      default:
        return status || "Không xác định";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const newUser = await userService.createUser(formData);
      setUsers([...users, newUser]);
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "user"
      });
    } catch (error: any) {
      console.error("Error adding user:", error);
      setError(error.response?.data?.message || "Không thể thêm người dùng. Vui lòng thử lại sau.");
    }
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone || "",
      role: user.role || "user"
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!currentUser) return;
    
    try {
      const updateData: UpdateUserData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      };
      
      // Chỉ cập nhật mật khẩu nếu người dùng đã nhập
      if (formData.password) {
        // Trong thực tế, việc thay đổi mật khẩu thường được xử lý riêng
        // nhưng chúng ta giữ đơn giản cho ví dụ này
        console.log("Password would be updated in a real application");
      }
      
      const updatedUser = await userService.updateUser(currentUser.id, updateData);
      setUsers(users.map(user => user.id === currentUser.id ? { ...user, ...updatedUser } : user));
      setShowEditModal(false);
    } catch (error: any) {
      console.error("Error updating user:", error);
      setError(error.response?.data?.message || "Không thể cập nhật người dùng. Vui lòng thử lại sau.");
    }
  };

  // Modal thêm người dùng
  const AddUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Thêm người dùng mới</h2>
          <button onClick={() => setShowAddModal(false)} className="text-gray-500">
            &times;
          </button>
        </div>
        
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        
        <form onSubmit={handleAddUser}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select
              name="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="user">Người dùng</option>
              <option value="vendor">Đối tác bán vé</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Thêm người dùng
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Modal chỉnh sửa người dùng
  const EditUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Chỉnh sửa người dùng</h2>
          <button onClick={() => setShowEditModal(false)} className="text-gray-500">
            &times;
          </button>
        </div>
        
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        
        <form onSubmit={handleUpdateUser}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới (để trống nếu không thay đổi)
            </label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select
              name="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="user">Người dùng</option>
              <option value="vendor">Đối tác bán vé</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Quản lý người dùng</h1>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-6 py-3 shadow-lg text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
            onClick={() => setShowAddModal(true)}
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Thêm người dùng
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
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
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
                    <span>ID</span>
                    {sortField === "id" && (
                      sortDirection === "asc" ? 
                        <ArrowUpIcon className="h-4 w-4 text-indigo-400" /> : 
                        <ArrowDownIcon className="h-4 w-4 text-indigo-400" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Tên</span>
                    {sortField === "name" && (
                      sortDirection === "asc" ? 
                        <ArrowUpIcon className="h-4 w-4 text-indigo-400" /> : 
                        <ArrowDownIcon className="h-4 w-4 text-indigo-400" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Email</span>
                    {sortField === "email" && (
                      sortDirection === "asc" ? 
                        <ArrowUpIcon className="h-4 w-4 text-indigo-400" /> : 
                        <ArrowDownIcon className="h-4 w-4 text-indigo-400" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("phone")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Điện thoại</span>
                    {sortField === "phone" && (
                      sortDirection === "asc" ? 
                        <ArrowUpIcon className="h-4 w-4 text-indigo-400" /> : 
                        <ArrowDownIcon className="h-4 w-4 text-indigo-400" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Vai trò</span>
                    {sortField === "role" && (
                      sortDirection === "asc" ? 
                        <ArrowUpIcon className="h-4 w-4 text-indigo-400" /> : 
                        <ArrowDownIcon className="h-4 w-4 text-indigo-400" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Trạng thái</span>
                    {sortField === "status" && (
                      sortDirection === "asc" ? 
                        <ArrowUpIcon className="h-4 w-4 text-indigo-400" /> : 
                        <ArrowDownIcon className="h-4 w-4 text-indigo-400" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-bold text-indigo-300 uppercase tracking-wider"
                >
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/5 divide-y divide-white/10">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/10 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-base text-white font-semibold">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{user.phone || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{user.role || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-md
                        ${user.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : user.status === "banned"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"}
                      `}
                    >
                      {getStatusText(user.status || "active")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2 justify-end">
                    <button
                      className="p-2 rounded-full bg-indigo-500/10 hover:bg-indigo-500/30 text-indigo-400 hover:text-white transition-all"
                      title="Sửa"
                      onClick={() => handleEditUser(user)}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-white transition-all"
                      title="Xoá"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {sortedUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <AddUserModal />}
      {showEditModal && <EditUserModal />}
    </div>
  );
} 