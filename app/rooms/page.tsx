'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  facilities: string[];
  status: 'available' | 'booked' | 'maintenance';
  floor?: string;
  note?: string;
}

export interface BookingRequest {
  id: string;
  roomId: string;
  roomName: string;
  building: string;
  userName: string;
  userEmail: string;
  bookingDate: string;
  timeSlot: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
}

const DEFAULT_ROOMS: Room[] = [
  {
    id: 'room-a-101',
    name: 'Phòng A-101',
    building: 'Khu A',
    capacity: 40,
    facilities: ['Máy chiếu Sony HD', 'Micro không dây', 'Điều hòa 2 chiều', 'Wifi 6'],
    status: 'available',
    floor: 'Tầng 1 - Nhà A',
    note: 'Phòng học lý thuyết tiêu chuẩn',
  },
  {
    id: 'room-a-202',
    name: 'Phòng A-202',
    building: 'Khu A',
    capacity: 50,
    facilities: ['Máy chiếu Panasonic', 'Micro để bàn', 'Điều hòa 2 chiều', 'Wifi 6', 'Bảng thông minh'],
    status: 'booked',
    floor: 'Tầng 2 - Nhà A',
    note: 'Đang diễn ra ca học đồ án',
  },
  {
    id: 'room-a-301',
    name: 'Phòng A-301',
    building: 'Khu A',
    capacity: 45,
    facilities: ['Máy chiếu Epson', 'Micro cài áo', 'Điều hòa 2 chiều', 'Wifi 6', 'Âm thanh vòm'],
    status: 'available',
    floor: 'Tầng 3 - Nhà A',
    note: 'Thích hợp bảo vệ đồ án tốt nghiệp',
  },
  {
    id: 'room-a-501',
    name: 'Phòng Báo Cáo A-501',
    building: 'Khu A',
    capacity: 85,
    facilities: ['Máy chiếu Laser 4K', 'Hệ thống Micro hội thảo', 'Điều hòa trung tâm', 'Wifi chuyên dụng', 'Bục phát biểu'],
    status: 'available',
    floor: 'Tầng 5 - Nhà A',
    note: 'Phòng hội thảo chuyên đề khoa CNTT',
  },
  {
    id: 'room-b-104',
    name: 'Phòng B-104',
    building: 'Khu B',
    capacity: 45,
    facilities: ['Máy chiếu Sony HD', 'Micro không dây', 'Điều hòa 2 chiều', 'Wifi 6'],
    status: 'available',
    floor: 'Tầng 1 - Nhà B',
    note: 'Phòng học thực hành kết hợp',
  },
  {
    id: 'room-b-205',
    name: 'Phòng B-205',
    building: 'Khu B',
    capacity: 60,
    facilities: ['Máy chiếu HD', 'Micro để bàn', 'Điều hòa', 'Wifi 6'],
    status: 'maintenance',
    floor: 'Tầng 2 - Nhà B',
    note: 'Đang sửa chữa hệ thống điều hòa và bóng đèn máy chiếu',
  },
  {
    id: 'room-b-302',
    name: 'Phòng B-302',
    building: 'Khu B',
    capacity: 55,
    facilities: ['Máy chiếu Epson', 'Micro không dây', 'Điều hòa 2 chiều', 'Wifi 6', 'Bảng tương tác'],
    status: 'available',
    floor: 'Tầng 3 - Nhà B',
    note: 'Phòng học thảo luận nhóm',
  },
  {
    id: 'hall-c1',
    name: 'Hội Trường Lớn C1',
    building: 'Hội trường',
    capacity: 300,
    facilities: ['Màn hình LED P3 lớn', 'Dàn âm thanh sân khấu JBL', 'Bộ 4 Micro cao cấp', 'Điều hòa công suất lớn', 'Wifi tốc độ cao'],
    status: 'booked',
    floor: 'Tòa nhà Trung tâm C',
    note: 'Phục vụ đại hội, hội thảo toàn trường',
  },
  {
    id: 'hall-h2',
    name: 'Hội Trường Đa Năng H2',
    building: 'Hội trường',
    capacity: 150,
    facilities: ['Máy chiếu 4K siêu nét', 'Micro không dây', 'Điều hòa', 'Wifi 6', 'Hệ thống ánh sáng biểu diễn'],
    status: 'available',
    floor: 'Tầng 2 - Nhà H',
    note: 'Tổ chức sinh hoạt câu lạc bộ, lễ khai giảng môn học',
  },
];

const DEFAULT_BOOKINGS: BookingRequest[] = [
  {
    id: 'req-1',
    roomId: 'room-a-202',
    roomName: 'Phòng A-202',
    building: 'Khu A',
    userName: 'Trần Minh Tuấn',
    userEmail: 'tuan.tm@student.edu.vn',
    bookingDate: '2026-09-12',
    timeSlot: 'Sáng (7h-11h)',
    purpose: 'Báo cáo giữa kỳ đồ án môn Lập trình Web và Ứng dụng di động.',
    status: 'approved',
    createdAt: '2026-09-09 08:30',
  },
  {
    id: 'req-2',
    roomId: 'hall-c1',
    roomName: 'Hội Trường Lớn C1',
    building: 'Hội trường',
    userName: 'CLB Tin Học',
    userEmail: 'clbtinhoc@university.edu.vn',
    bookingDate: '2026-09-15',
    timeSlot: 'Chiều (13h-17h)',
    purpose: 'Tổ chức cuộc thi Hackathon Lập trình viên tương lai 2026.',
    status: 'approved',
    createdAt: '2026-09-08 14:15',
  },
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('Người dùng');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Bộ lọc
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form Đặt phòng
  const [bookingForm, setBookingForm] = useState({
    roomId: '',
    bookingDate: '',
    timeSlot: 'Sáng (7h-11h)',
    purpose: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Chi tiết phòng
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState<Room | null>(null);

  // Popup Modal Xác nhận Xóa phòng (Có / Không)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  // Modal Thêm/Sửa phòng (cho Admin)
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomFormData, setRoomFormData] = useState<Omit<Room, 'id'>>({
    name: '',
    building: 'Khu A',
    capacity: 45,
    facilities: ['Máy chiếu', 'Micro', 'Điều hòa', 'Wifi'],
    status: 'available',
    floor: 'Tầng 1',
    note: '',
  });
  const [facilitiesInput, setFacilitiesInput] = useState('Máy chiếu, Micro, Điều hòa, Wifi');

  const formSectionRef = useRef<HTMLDivElement>(null);

  // Ngày đặt phòng tối thiểu là ngày hôm nay
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Hàm load dữ liệu thực tế từ LocalStorage
  const loadData = useCallback(() => {
    const savedUser = localStorage.getItem('currentUser') || 'Người dùng';
    const savedRole = localStorage.getItem('user_role');
    const savedEmail = localStorage.getItem('user_email') || '';
    const savedProfile = localStorage.getItem('student_profile');

    let displayName = savedUser;
    let email = savedEmail;

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.fullName) displayName = parsed.fullName;
        if (parsed.email) email = parsed.email;
      } catch {
        // fallback
      }
    }

    setCurrentUser(displayName);
    setCurrentUserEmail(email);
    setIsAdmin(savedRole === 'admin' || savedUser.toLowerCase().includes('admin'));

    // Tải danh sách yêu cầu đặt phòng trước
    let loadedBookings: BookingRequest[] = DEFAULT_BOOKINGS;
    const savedBookings = localStorage.getItem('room_bookings');
    if (savedBookings) {
      try {
        loadedBookings = JSON.parse(savedBookings);
      } catch {
        loadedBookings = DEFAULT_BOOKINGS;
      }
    }
    setBookings(loadedBookings);

    // Tải danh sách phòng học
    let loadedRooms: Room[] = DEFAULT_ROOMS;
    const savedRooms = localStorage.getItem('classroom_list');
    if (savedRooms) {
      try {
        loadedRooms = JSON.parse(savedRooms);
      } catch {
        loadedRooms = DEFAULT_ROOMS;
      }
    }

    // Tự động tính toán trạng thái phòng theo danh sách đặt phòng (Acc này hoặc Acc khác đã đặt)
    const activeBookedRoomIds = new Set(
      loadedBookings
        .filter((b) => b.status === 'pending' || b.status === 'approved')
        .map((b) => b.roomId)
    );

    const updatedRoomsWithBookingStatus = loadedRooms.map((r) => {
      // Nếu phòng đang bảo trì thì giữ nguyên 'maintenance'
      if (r.status === 'maintenance') return r;
      // Nếu phòng có trong danh sách đặt phòng đang active thì cập nhật là 'booked' (Đã đặt)
      if (activeBookedRoomIds.has(r.id)) {
        return { ...r, status: 'booked' as const };
      }
      return r;
    });

    setRooms(updatedRoomsWithBookingStatus);
  }, []);

  useEffect(() => {
    loadData();

    setBookingForm((prev) => ({
      ...prev,
      bookingDate: prev.bookingDate || todayStr,
    }));

    const handleSync = () => {
      loadData();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('bookingUpdated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('bookingUpdated', handleSync);
    };
  }, [loadData, todayStr]);

  // Lưu danh sách phòng
  const saveRooms = (newList: Room[]) => {
    setRooms(newList);
    localStorage.setItem('classroom_list', JSON.stringify(newList));
    window.dispatchEvent(new Event('bookingUpdated'));
  };

  // Lưu danh sách đặt phòng
  const saveBookings = (newBookings: BookingRequest[]) => {
    setBookings(newBookings);
    localStorage.setItem('room_bookings', JSON.stringify(newBookings));
    window.dispatchEvent(new Event('bookingUpdated'));
  };

  // Thống kê nhanh
  const stats = useMemo(() => {
    return {
      total: rooms.length,
      available: rooms.filter((r) => r.status === 'available').length,
      booked: rooms.filter((r) => r.status === 'booked').length,
      maintenance: rooms.filter((r) => r.status === 'maintenance').length,
      pending: bookings.filter((b) => b.status === 'pending').length,
    };
  }, [rooms, bookings]);

  // Bộ lọc phòng học
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchBuilding = selectedBuilding === 'all' || r.building === selectedBuilding;
      const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;
      const matchSearch =
        searchQuery.trim() === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.facilities.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(r.capacity).includes(searchQuery);
      return matchBuilding && matchStatus && matchSearch;
    });
  }, [rooms, selectedBuilding, selectedStatus, searchQuery]);

  // Xử lý khi bấm nút "Đặt phòng này" từ Card phòng
  const handleSelectRoomToBook = (room: Room) => {
    if (room.status !== 'available') return;
    setBookingForm((prev) => ({
      ...prev,
      roomId: room.id,
    }));
    setMessage(null);

    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Xử lý Gửi form đặt phòng
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!bookingForm.roomId) {
      setMessage({ type: 'error', text: 'Vui lòng chọn phòng học muốn đặt.' });
      return;
    }

    if (!bookingForm.bookingDate) {
      setMessage({ type: 'error', text: 'Vui lòng chọn ngày sử dụng.' });
      return;
    }

    if (!bookingForm.purpose.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mục đích sử dụng phòng.' });
      return;
    }

    const targetRoom = rooms.find((r) => r.id === bookingForm.roomId);
    if (!targetRoom) {
      setMessage({ type: 'error', text: 'Phòng học được chọn không tồn tại.' });
      return;
    }

    if (targetRoom.status === 'booked') {
      setMessage({ type: 'error', text: 'Phòng này đã được tài khoản khác hoặc bạn đặt trước đó!' });
      return;
    }

    if (targetRoom.status === 'maintenance') {
      setMessage({ type: 'error', text: 'Phòng này đang bảo trì, vui lòng chọn phòng khác.' });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newBooking: BookingRequest = {
        id: 'book-' + Date.now(),
        roomId: targetRoom.id,
        roomName: targetRoom.name,
        building: targetRoom.building,
        userName: currentUser,
        userEmail: currentUserEmail || 'student@university.edu.vn',
        bookingDate: bookingForm.bookingDate,
        timeSlot: bookingForm.timeSlot,
        purpose: bookingForm.purpose.trim(),
        status: 'pending',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      // 1. Cập nhật danh sách đặt phòng
      const updatedBookings = [newBooking, ...bookings];

      // 2. Đổi trạng thái phòng thành 'booked' (Đã đặt) ngay lập tức cho tất cả tài khoản
      const updatedRooms = rooms.map((r) =>
        r.id === targetRoom.id ? { ...r, status: 'booked' as const } : r
      );

      // 3. Ghi vào localStorage & Bắn event đồng bộ realtime cho mọi tab/tài khoản khác
      setBookings(updatedBookings);
      setRooms(updatedRooms);
      localStorage.setItem('room_bookings', JSON.stringify(updatedBookings));
      localStorage.setItem('classroom_list', JSON.stringify(updatedRooms));
      window.dispatchEvent(new Event('bookingUpdated'));
      window.dispatchEvent(new Event('storage'));

      setMessage({
        type: 'success',
        text: `Đã gửi yêu cầu đặt ${targetRoom.name} thành công! Phòng đã được cập nhật trạng thái [Đã đặt].`,
      });

      setBookingForm((prev) => ({
        ...prev,
        purpose: '',
      }));
      setIsSubmitting(false);
    }, 350);
  };

  // Mở modal chi tiết
  const handleViewDetail = (room: Room) => {
    setSelectedRoomDetail(room);
    setDetailModalOpen(true);
  };

  // Admin: Click nút Xóa -> Mở Popup modal xác nhận (Có / Không)
  const handleOpenDeletePopup = (room: Room) => {
    setRoomToDelete(room);
    setDeleteModalOpen(true);
  };

  // Admin: Xác nhận xóa phòng khi bấm nút "Có"
  const handleConfirmDelete = () => {
    if (!roomToDelete) return;
    const updated = rooms.filter((r) => r.id !== roomToDelete.id);
    saveRooms(updated);
    setDeleteModalOpen(false);
    setRoomToDelete(null);
  };

  // Admin: Mở form thêm phòng
  const handleOpenAddModal = () => {
    setEditingRoomId(null);
    setRoomFormData({
      name: '',
      building: 'Khu A',
      capacity: 45,
      facilities: ['Máy chiếu', 'Micro', 'Điều hòa', 'Wifi'],
      status: 'available',
      floor: 'Tầng 1',
      note: '',
    });
    setFacilitiesInput('Máy chiếu, Micro, Điều hòa, Wifi');
    setRoomModalOpen(true);
  };

  // Admin: Mở form sửa phòng
  const handleOpenEditModal = (room: Room) => {
    setEditingRoomId(room.id);
    setRoomFormData({
      name: room.name,
      building: room.building,
      capacity: room.capacity,
      facilities: room.facilities,
      status: room.status,
      floor: room.floor || 'Tầng 1',
      note: room.note || '',
    });
    setFacilitiesInput(room.facilities.join(', '));
    setRoomModalOpen(true);
  };

  // Admin: Lưu phòng
  const handleSaveRoomForm = (e: React.FormEvent) => {
    e.preventDefault();
    const facilityList = facilitiesInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingRoomId) {
      const updated = rooms.map((r) =>
        r.id === editingRoomId
          ? {
              ...r,
              ...roomFormData,
              facilities: facilityList.length ? facilityList : ['Máy chiếu', 'Điều hòa'],
            }
          : r
      );
      saveRooms(updated);
    } else {
      const newRoom: Room = {
        id: 'room-' + Date.now(),
        ...roomFormData,
        facilities: facilityList.length ? facilityList : ['Máy chiếu', 'Micro', 'Điều hòa', 'Wifi'],
      };
      saveRooms([newRoom, ...rooms]);
    }
    setRoomModalOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Hero Card & Quick Stats */}
        <section className="glass-panel rounded-[28px] p-5 sm:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                  Classroom Booking System
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                <span className="text-xs font-semibold text-slate-500">Kỳ học 2026 - 2027</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Quản Lý & Đặt Phòng Học / Phòng Báo Cáo
              </h1>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-600">
                Tra cứu danh sách phòng học, hội trường theo khu vực, kiểm tra trang thiết bị và gửi yêu cầu đặt phòng nhanh chóng.
              </p>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="ios-button-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold shadow-md shrink-0"
              >
                <span className="text-lg leading-none">+</span>
                <span>Thêm phòng mới</span>
              </button>
            )}
          </div>

          {/* 4 Stat Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 shadow-xs">
              <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
                Tổng số phòng
              </span>
              <p className="mt-2 text-3xl font-extrabold text-blue-950">{stats.total}</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-xs">
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                Phòng Trống
              </span>
              <p className="mt-2 text-3xl font-extrabold text-emerald-950">{stats.available}</p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 shadow-xs">
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                Đã đặt
              </span>
              <p className="mt-2 text-3xl font-extrabold text-amber-950">{stats.booked}</p>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 shadow-xs">
              <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800">
                Đang bảo trì
              </span>
              <p className="mt-2 text-3xl font-extrabold text-rose-950">{stats.maintenance}</p>
            </div>
          </div>
        </section>

        {/* Main 2-Column Content Area */}
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          {/* CỘT GIỮA: DANH SÁCH PHÒNG & BỘ LỌC */}
          <section className="glass-panel rounded-[28px] p-5 sm:p-6 space-y-4">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Danh sách phòng học & hội trường</h2>
                <p className="text-xs text-slate-500">Chọn phòng phù hợp với số lượng thành viên và nhu cầu thiết bị</p>
              </div>

              {/* Ô tìm kiếm */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Tìm phòng, sức chứa, thiết bị..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white/90 px-3.5 py-2 pl-9 text-xs text-slate-800 shadow-inner outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* BỘ LỌC KHU VỰC & TRẠNG THÁI */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              {/* Filter Khu vực / Tòa nhà */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Tất cả khu vực' },
                  { id: 'Khu A', label: '🏫 Khu A' },
                  { id: 'Khu B', label: '🏢 Khu B' },
                  { id: 'Hội trường', label: '🏛️ Hội trường' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBuilding(b.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedBuilding === b.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 border border-slate-200/70'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Filter Trạng thái */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="available">🟢 Trống (Có sẵn)</option>
                <option value="booked">🟡 Đã đặt</option>
                <option value="maintenance">🔴 Đang bảo trì</option>
              </select>
            </div>

            {/* DANH SÁCH CARD PHÒNG HỌC */}
            <div className="space-y-3.5 pt-2">
              {filteredRooms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm font-semibold text-slate-500">
                  Không tìm thấy phòng nào phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const isAvailable = room.status === 'available';
                  const isBooked = room.status === 'booked';
                  const isMaintenance = room.status === 'maintenance';
                  const isSelectedForBooking = bookingForm.roomId === room.id;

                  return (
                    <div
                      key={room.id}
                      className={`rounded-[24px] border p-4 sm:p-5 transition duration-200 ${
                        isSelectedForBooking
                          ? 'border-blue-400 bg-blue-50/50 shadow-md ring-2 ring-blue-200'
                          : 'border-slate-200/80 bg-white/90 hover:-translate-y-0.5 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between">
                        {/* Thông tin phòng */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-xl font-bold text-blue-700 shadow-xs">
                              {room.building.includes('Hội trường') ? '🏛️' : '🏫'}
                            </div>

                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{room.name}</h3>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold text-slate-700">
                                  {room.building}
                                </span>
                                {room.floor && (
                                  <span className="text-[11px] text-slate-400 font-medium">({room.floor})</span>
                                )}
                              </div>

                              {/* Sức chứa */}
                              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                                <span className="text-slate-400 font-semibold">Sức chứa:</span>
                                <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-extrabold text-indigo-700">
                                  👥 {room.capacity} người
                                </span>
                              </div>

                              {/* Cơ sở vật chất */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[11px] font-semibold text-slate-400 mr-0.5">Cơ sở vật chất:</span>
                                {room.facilities.map((fac, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-lg border border-slate-200/80 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-2xs"
                                  >
                                    {fac}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Trạng thái & Nút hành động */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 md:flex-col md:items-end md:justify-center shrink-0">
                          {/* Badge Trạng thái: Trống (Xanh), Đã đặt (Vàng), Bảo trì (Đỏ) */}
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-extrabold border ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : isBooked
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {isAvailable ? '🟢 Trống' : isBooked ? '🟡 Đã đặt' : '🔴 Đang bảo trì'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleViewDetail(room)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-100 cursor-pointer"
                            >
                              Chi tiết
                            </button>

                            {/* Nút hành động "Đặt phòng này" */}
                            <button
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => handleSelectRoomToBook(room)}
                              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer ${
                                isSelectedForBooking
                                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                                  : isAvailable
                                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border-none'
                              }`}
                            >
                              {isSelectedForBooking
                                ? '✓ Đang chọn'
                                : isAvailable
                                ? 'Đặt phòng này'
                                : isBooked
                                ? 'Đã đặt'
                                : 'Bảo trì'}
                            </button>

                            {/* Quyền Quản trị viên: Sửa và Xóa (Bấm xóa hiện Popup Modal CÓ / KHÔNG) */}
                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(room)}
                                  className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                  title="Chỉnh sửa thông tin phòng"
                                >
                                  ✏️ Sửa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeletePopup(room)}
                                  className="rounded-xl border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
                                  title="Xóa phòng"
                                >
                                  🗑️ Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* CỘT PHẢI: FORM ĐĂNG KÝ ĐẶT PHÒNG */}
          <section
            ref={formSectionRef}
            className="glass-panel rounded-[28px] p-5 sm:p-6 space-y-4 h-fit border border-white/80 shadow-md"
          >
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-blue-600">Booking Form</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Đăng ký Đặt phòng</h2>
              <p className="text-xs text-slate-500">
                Gửi yêu cầu mượn phòng học hoặc hội trường phục vụ báo cáo đồ án, hội thảo, sinh hoạt CLB.
              </p>
            </div>

            {/* Thông báo kết quả gửi */}
            {message && (
              <div
                className={`rounded-2xl p-3.5 text-xs font-semibold flex items-start gap-2 ${
                  message.type === 'success'
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                <span className="text-sm">{message.type === 'success' ? '🎉' : '⚠️'}</span>
                <div className="flex-1">
                  <p>{message.text}</p>
                  {message.type === 'success' && (
                    <Link
                      href="/my-bookings"
                      className="mt-1.5 inline-block font-extrabold text-blue-600 hover:underline"
                    >
                      👉 Xem lịch đặt phòng của tôi
                    </Link>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* 1. Người đăng ký (Tự động điền theo user đăng nhập) */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Người đăng ký:
                </label>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/90 px-3.5 py-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span className="font-bold text-slate-900">{currentUser}</span>
                  </div>
                  <span className="text-slate-400 font-medium truncate max-w-[150px]">
                    {currentUserEmail ? currentUserEmail : 'Đang đăng nhập'}
                  </span>
                </div>
              </div>

              {/* 2. Chọn phòng (Dropdown từ danh sách) */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Chọn phòng: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={bookingForm.roomId}
                  onChange={(e) => setBookingForm({ ...bookingForm, roomId: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-inner outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">-- Chọn phòng học từ danh sách --</option>
                  {rooms.map((room) => {
                    const isAvailable = room.status === 'available';
                    return (
                      <option
                        key={room.id}
                        value={room.id}
                        disabled={!isAvailable}
                        className={!isAvailable ? 'text-slate-400 bg-slate-100' : 'text-slate-900'}
                      >
                        {room.name} ({room.building} - {room.capacity} người){' '}
                        {room.status === 'booked' ? '[Đã đặt]' : room.status === 'maintenance' ? '[Bảo trì]' : ''}
                      </option>
                    );
                  })}
                </select>
                {bookingForm.roomId && (
                  <p className="mt-1 text-[11px] text-emerald-700 font-bold">
                    ✓ Đã chọn: {rooms.find((r) => r.id === bookingForm.roomId)?.name}
                  </p>
                )}
              </div>

              {/* 3. Ngày sử dụng (Input type="date") */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Ngày sử dụng: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={bookingForm.bookingDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-inner outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* 4. Khung giờ sử dụng */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Khung giờ sử dụng: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={bookingForm.timeSlot}
                  onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-inner outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="Sáng (7h-11h)">🌅 Sáng (7h - 11h)</option>
                  <option value="Chiều (13h-17h)">☀️ Chiều (13h - 17h)</option>
                  <option value="Tối (18h-21h)">🌙 Tối (18h - 21h)</option>
                  <option value="Cả ngày (7h-17h)">📅 Cả ngày (7h - 17h)</option>
                </select>
              </div>

              {/* 5. Mục đích sử dụng (Textarea) */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Mục đích sử dụng: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ví dụ: Báo cáo đồ án môn Lập trình Web, Sinh hoạt CLB Tin học, Hội thảo khoa học..."
                  value={bookingForm.purpose}
                  onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                ></textarea>
              </div>

              {/* Nút Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="ios-button-primary w-full py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider disabled:opacity-50 shadow-md"
              >
                {isSubmitting ? 'ĐANG GỬI YÊU CẦU...' : 'GỬI YÊU CẦU ĐẶT PHÒNG'}
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* POPUP MODAL XÁC NHẬN XÓA PHÒNG (CÓ / KHÔNG) */}
      {deleteModalOpen && roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="glass-panel w-full max-w-md rounded-[28px] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-white bg-white/95">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-xl text-rose-600">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Xác nhận xóa phòng học</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed space-y-2">
              <p>
                Bạn có chắc chắn muốn xóa <strong className="text-slate-900 font-extrabold">{roomToDelete.name}</strong> ({roomToDelete.building}) khỏi hệ thống không?
              </p>
            </div>

            {/* Hai nút CÓ / KHÔNG */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setRoomToDelete(null);
                }}
                className="ios-button-secondary rounded-2xl px-5 py-2.5 text-xs font-bold"
              >
                Không
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-2xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 cursor-pointer"
              >
                Có, Xóa phòng này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT PHÒNG HỌC */}
      {detailModalOpen && selectedRoomDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="glass-panel w-full max-w-lg rounded-[28px] p-6 shadow-2xl space-y-4 bg-white/95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏫</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedRoomDetail.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Tòa nhà / Khu vực:</span>
                <span className="font-semibold">{selectedRoomDetail.building} ({selectedRoomDetail.floor})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Sức chứa:</span>
                <span className="font-bold text-indigo-600">👥 {selectedRoomDetail.capacity} người</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Trạng thái hiện tại:</span>
                <span
                  className={`font-bold ${
                    selectedRoomDetail.status === 'available'
                      ? 'text-emerald-700'
                      : selectedRoomDetail.status === 'booked'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {selectedRoomDetail.status === 'available'
                    ? '🟢 Trống (Có sẵn để mượn)'
                    : selectedRoomDetail.status === 'booked'
                    ? '🟡 Đã được mượn / Đã đặt'
                    : '🔴 Đang bảo trì'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1.5">Danh mục cơ sở vật chất:</span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRoomDetail.facilities.map((fac, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 border border-slate-100">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="ios-button-secondary px-4 py-2 text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA PHÒNG HỌC (ADMIN) */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="glass-panel w-full max-w-lg rounded-[28px] p-6 shadow-2xl space-y-4 bg-white/95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRoomId ? 'Chỉnh sửa phòng học' : 'Thêm phòng học mới'}
              </h3>
              <button
                type="button"
                onClick={() => setRoomModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRoomForm} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-bold text-slate-700">Tên phòng (VD: Phòng A-301):</label>
                <input
                  type="text"
                  required
                  value={roomFormData.name}
                  onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Khu vực / Tòa nhà:</label>
                  <select
                    value={roomFormData.building}
                    onChange={(e) => setRoomFormData({ ...roomFormData, building: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="Khu A">Khu A</option>
                    <option value="Khu B">Khu B</option>
                    <option value="Hội trường">Hội trường</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700">Sức chứa (người):</label>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    required
                    value={roomFormData.capacity}
                    onChange={(e) => setRoomFormData({ ...roomFormData, capacity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Vị trí tầng:</label>
                  <input
                    type="text"
                    value={roomFormData.floor}
                    onChange={(e) => setRoomFormData({ ...roomFormData, floor: e.target.value })}
                    placeholder="VD: Tầng 3 - Nhà A"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700">Trạng thái phòng:</label>
                  <select
                    value={roomFormData.status}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, status: e.target.value as 'available' | 'booked' | 'maintenance' })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="available">🟢 Trống (Có sẵn)</option>
                    <option value="booked">🟡 Đã đặt</option>
                    <option value="maintenance">🔴 Đang bảo trì</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  Cơ sở vật chất (phân tách bởi dấu phẩy):
                </label>
                <input
                  type="text"
                  value={facilitiesInput}
                  onChange={(e) => setFacilitiesInput(e.target.value)}
                  placeholder="Máy chiếu, Micro, Điều hòa, Wifi..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="ios-button-secondary px-4 py-2 text-xs font-bold"
                >
                  Hủy
                </button>
                <button type="submit" className="ios-button-primary px-4 py-2 text-xs font-bold">
                  Lưu phòng học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
