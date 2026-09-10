'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '../components/AppLayout';

export interface Computer {
  id: string;
  name: string;
  room: string;
  specs: string;
  status: 'available' | 'in_use' | 'maintenance';
  os?: string;
  screen?: string;
  peripherals?: string;
  software?: string;
}

export interface BorrowRequest {
  id: string;
  computerId: string;
  computerName: string;
  room: string;
  borrowerName: string;
  borrowerUsername: string;
  reason: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
}

const DEFAULT_COMPUTERS: Computer[] = [
  {
    id: 'pc-01',
    name: 'PC-LAB1-01',
    room: 'Phòng Lab 01',
    specs: 'Intel Core i7-12700 | 16GB RAM DDR4 | RTX 3060 12GB | SSD 512GB NVMe',
    status: 'available',
    os: 'Windows 11 Pro 64-bit',
    screen: 'Dell 24" IPS FHD 144Hz',
    peripherals: 'Bàn phím cơ DareU, Chuột Logitech G102, Tai nghe gaming',
    software: 'VSCode, Git, Node.js v20, Python 3.11, Docker Desktop, SQL Server',
  },
  {
    id: 'pc-02',
    name: 'PC-LAB1-02',
    room: 'Phòng Lab 01',
    specs: 'Intel Core i7-12700 | 16GB RAM DDR4 | RTX 3060 12GB | SSD 512GB NVMe',
    status: 'available',
    os: 'Windows 11 Pro 64-bit',
    screen: 'Dell 24" IPS FHD 144Hz',
    peripherals: 'Bàn phím cơ DareU, Chuột Logitech G102, Tai nghe gaming',
    software: 'VSCode, Git, Android Studio, IntelliJ IDEA, JDK 21',
  },
  {
    id: 'pc-03',
    name: 'PC-LAB1-03',
    room: 'Phòng Lab 01',
    specs: 'Intel Core i5-12400 | 16GB RAM | GTX 1660 Super | SSD 500GB',
    status: 'in_use',
    os: 'Windows 10 Pro 64-bit',
    screen: 'LG 24" IPS 75Hz',
    peripherals: 'Bàn phím Fuhlen, Chuột Fulhen',
    software: 'Visual Studio 2022, C/C++ Dev, CodeBlocks, MySQL Workbench',
  },
  {
    id: 'pc-04',
    name: 'PC-LAB1-04',
    room: 'Phòng Lab 01',
    specs: 'Intel Core i5-12400 | 8GB RAM | Intel UHD 730 | SSD 256GB',
    status: 'maintenance',
    os: 'Windows 10 Pro',
    screen: 'Samsung 22" LED',
    peripherals: 'Bàn phím văn phòng, Chuột quang',
    software: 'Cần cài lại hệ điều hành và thay nguồn',
  },
  {
    id: 'pc-05',
    name: 'PC-LAB2-01',
    room: 'Phòng Lab 02',
    specs: 'AMD Ryzen 7 5700X | 32GB RAM | RTX 4060 8GB | SSD 1TB NVMe',
    status: 'available',
    os: 'Windows 11 Pro 64-bit & Ubuntu 22.04 Dual Boot',
    screen: 'ViewSonic 27" 2K 165Hz SuperClear IPS',
    peripherals: 'Bàn phím cơ Akko 3087, Chuột Razer DeathAdder',
    software: 'Blender 4.0, Unity 2023, Unreal Engine 5, Adobe Premiere, Photoshop',
  },
  {
    id: 'pc-06',
    name: 'PC-LAB2-02',
    room: 'Phòng Lab 02',
    specs: 'AMD Ryzen 7 5700X | 32GB RAM | RTX 4060 8GB | SSD 1TB NVMe',
    status: 'in_use',
    os: 'Windows 11 Pro 64-bit',
    screen: 'ViewSonic 27" 2K 165Hz SuperClear IPS',
    peripherals: 'Bàn phím cơ Akko 3087, Chuột Razer DeathAdder',
    software: 'AI / Machine Learning Stack: PyTorch, TensorFlow, CUDA Toolkit, Jupyter',
  },
  {
    id: 'pc-07',
    name: 'PC-LAB3-01',
    room: 'Phòng Lab 03',
    specs: 'Intel Core i5-13400 | 16GB RAM | RTX 3050 | SSD 512GB',
    status: 'available',
    os: 'Windows 11 Pro 64-bit',
    screen: 'Asus 24" 100Hz',
    peripherals: 'Bàn phím Rapoo, Chuột Rapoo không dây',
    software: 'Wireshark, Cisco Packet Tracer, VMware Workstation, Kali Linux VM',
  },
  {
    id: 'pc-08',
    name: 'PC-LAB3-02',
    room: 'Phòng Lab 03',
    specs: 'Intel Core i5-13400 | 16GB RAM | RTX 3050 | SSD 512GB',
    status: 'available',
    os: 'Windows 11 Pro 64-bit',
    screen: 'Asus 24" 100Hz',
    peripherals: 'Bàn phím Rapoo, Chuột Rapoo không dây',
    software: 'Mạng máy tính & An toàn thông tin Suite',
  },
];

const DEFAULT_REQUESTS: BorrowRequest[] = [
  {
    id: 'req-1',
    computerId: 'pc-03',
    computerName: 'PC-LAB1-03',
    room: 'Phòng Lab 01',
    borrowerName: 'Trần Minh Tuấn',
    borrowerUsername: 'tuan_tm',
    reason: 'Thực hành môn Lập trình Web và kiểm thử đồ án môn học.',
    requestDate: '2026-09-07 08:30',
    status: 'approved',
  },
  {
    id: 'req-2',
    computerId: 'pc-06',
    computerName: 'PC-LAB2-02',
    room: 'Phòng Lab 02',
    borrowerName: 'Nguyễn Viết Hùng',
    borrowerUsername: 'admin',
    reason: 'Chạy huấn luyện mô hình Machine Learning đồ án tốt nghiệp.',
    requestDate: '2026-09-07 14:15',
    status: 'approved',
  },
  {
    id: 'req-3',
    computerId: 'pc-01',
    computerName: 'PC-LAB1-01',
    room: 'Phòng Lab 01',
    borrowerName: 'Lê Thị Mai',
    borrowerUsername: 'mai_lt',
    reason: 'Cần máy cấu hình cao để render video thuyết trình môn Đa phương tiện.',
    requestDate: '2026-09-07 16:45',
    status: 'pending',
  },
];

export default function ComputersPage() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('Nguyễn Viết Hùng');
  const [currentUsername, setCurrentUsername] = useState<string>('sinh_vien');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Bộ lọc
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form mượn máy
  const [borrowForm, setBorrowForm] = useState({
    computerId: '',
    reason: '',
  });
  const [borrowSubmitting, setBorrowSubmitting] = useState(false);
  const [borrowMessage, setBorrowMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Thêm / Sửa máy
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingComputerId, setEditingComputerId] = useState<string | null>(null);
  const [computerForm, setComputerForm] = useState<Omit<Computer, 'id'>>({
    name: '',
    room: 'Phòng Lab 01',
    specs: '',
    status: 'available',
    os: 'Windows 11 Pro',
    screen: 'Dell 24" IPS',
    peripherals: 'Bàn phím & Chuột văn phòng',
    software: 'VSCode, Git, Node.js',
  });

  // Modal xem chi tiết
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedComputerDetail, setSelectedComputerDetail] = useState<Computer | null>(null);

  // Khởi tạo dữ liệu từ LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser') || 'Nguyễn Viết Hùng';
    const savedProfile = localStorage.getItem('student_profile');
    let displayName = savedUser;
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.fullName) displayName = parsed.fullName;
      } catch {
        // ignore
      }
    }
    setCurrentUser(displayName);
    setCurrentUsername(savedUser);
    setIsAdmin(savedUser.toLowerCase() === 'admin');

    // Tải danh sách máy tính
    const savedComputers = localStorage.getItem('computer_list');
    if (savedComputers) {
      try {
        setComputers(JSON.parse(savedComputers));
      } catch {
        setComputers(DEFAULT_COMPUTERS);
        localStorage.setItem('computer_list', JSON.stringify(DEFAULT_COMPUTERS));
      }
    } else {
      setComputers(DEFAULT_COMPUTERS);
      localStorage.setItem('computer_list', JSON.stringify(DEFAULT_COMPUTERS));
    }

    // Tải danh sách yêu cầu mượn
    const savedRequests = localStorage.getItem('computer_borrow_requests');
    if (savedRequests) {
      try {
        setRequests(JSON.parse(savedRequests));
      } catch {
        setRequests(DEFAULT_REQUESTS);
        localStorage.setItem('computer_borrow_requests', JSON.stringify(DEFAULT_REQUESTS));
      }
    } else {
      setRequests(DEFAULT_REQUESTS);
      localStorage.setItem('computer_borrow_requests', JSON.stringify(DEFAULT_REQUESTS));
    }
  }, []);

  // Lưu lại máy tính vào LocalStorage
  const saveComputers = (newList: Computer[]) => {
    setComputers(newList);
    localStorage.setItem('computer_list', JSON.stringify(newList));
  };

  // Lưu lại yêu cầu mượn vào LocalStorage
  const saveRequests = (newReqs: BorrowRequest[]) => {
    setRequests(newReqs);
    localStorage.setItem('computer_borrow_requests', JSON.stringify(newReqs));
  };

  // Thống kê nhanh
  const stats = useMemo(() => {
    return {
      available: computers.filter((c) => c.status === 'available').length,
      inUse: computers.filter((c) => c.status === 'in_use').length,
      maintenance: computers.filter((c) => c.status === 'maintenance').length,
      pendingRequests: requests.filter((r) => r.status === 'pending').length,
    };
  }, [computers, requests]);

  // Lọc máy tính
  const filteredComputers = useMemo(() => {
    return computers.filter((c) => {
      const matchRoom = selectedRoom === 'all' || c.room === selectedRoom;
      const matchStatus = selectedStatus === 'all' || c.status === selectedStatus;
      const matchQuery =
        searchQuery.trim() === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.specs.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.room.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRoom && matchStatus && matchQuery;
    });
  }, [computers, selectedRoom, selectedStatus, searchQuery]);

  // Xử lý gửi yêu cầu mượn máy
  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBorrowMessage(null);

    if (!borrowForm.computerId) {
      setBorrowMessage({ type: 'error', text: 'Vui lòng chọn máy tính muốn mượn.' });
      return;
    }

    if (!borrowForm.reason.trim()) {
      setBorrowMessage({ type: 'error', text: 'Vui lòng nhập lý do mượn máy.' });
      return;
    }

    const targetPc = computers.find((c) => c.id === borrowForm.computerId);
    if (!targetPc) {
      setBorrowMessage({ type: 'error', text: 'Máy tính không tồn tại.' });
      return;
    }

    if (targetPc.status !== 'available') {
      setBorrowMessage({ type: 'error', text: 'Máy này hiện không ở trạng thái sẵn sàng để mượn.' });
      return;
    }

    setBorrowSubmitting(true);

    setTimeout(() => {
      setBorrowSubmitting(false);

      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newRequest: BorrowRequest = {
        id: 'req-' + Date.now(),
        computerId: targetPc.id,
        computerName: targetPc.name,
        room: targetPc.room,
        borrowerName: currentUser,
        borrowerUsername: currentUsername,
        reason: borrowForm.reason.trim(),
        requestDate: dateStr,
        status: 'pending',
      };

      const updatedRequests = [newRequest, ...requests];
      saveRequests(updatedRequests);

      setBorrowForm({ computerId: '', reason: '' });
      setBorrowMessage({
        type: 'success',
        text: 'Đã gửi yêu cầu mượn máy thành công! Vui lòng chờ quản trị viên duyệt.',
      });
    }, 400);
  };

  // Xử lý duyệt / từ chối / trả máy (Dành cho Admin)
  const handleActionRequest = (requestId: string, action: 'approve' | 'reject' | 'return') => {
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    let nextStatus: BorrowRequest['status'] = 'pending';
    if (action === 'approve') nextStatus = 'approved';
    if (action === 'reject') nextStatus = 'rejected';
    if (action === 'return') nextStatus = 'returned';

    const updatedRequests = requests.map((r) => (r.id === requestId ? { ...r, status: nextStatus } : r));
    saveRequests(updatedRequests);

    // Cập nhật trạng thái máy tính tương ứng
    if (action === 'approve') {
      const updatedPcs = computers.map((c) =>
        c.id === targetReq.computerId ? { ...c, status: 'in_use' as const } : c
      );
      saveComputers(updatedPcs);
    } else if (action === 'return') {
      const updatedPcs = computers.map((c) =>
        c.id === targetReq.computerId ? { ...c, status: 'available' as const } : c
      );
      saveComputers(updatedPcs);
    }
  };

  // Mở modal thêm máy mới
  const handleOpenAddModal = () => {
    setEditingComputerId(null);
    setComputerForm({
      name: `PC-LAB1-${String(computers.length + 1).padStart(2, '0')}`,
      room: 'Phòng Lab 01',
      specs: 'Intel Core i5-13400 | 16GB RAM | SSD 512GB',
      status: 'available',
      os: 'Windows 11 Pro 64-bit',
      screen: 'Dell 24" IPS FHD 144Hz',
      peripherals: 'Bàn phím cơ & Chuột quang',
      software: 'VSCode, Git, Node.js, Office',
    });
    setEditModalOpen(true);
  };

  // Mở modal sửa máy
  const handleOpenEditModal = (pc: Computer) => {
    setEditingComputerId(pc.id);
    setComputerForm({
      name: pc.name,
      room: pc.room,
      specs: pc.specs,
      status: pc.status,
      os: pc.os || 'Windows 11 Pro',
      screen: pc.screen || '24 inch',
      peripherals: pc.peripherals || 'Bàn phím & Chuột',
      software: pc.software || '',
    });
    setEditModalOpen(true);
  };

  // Lưu modal máy tính (thêm mới hoặc sửa)
  const handleSaveComputer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!computerForm.name.trim()) return;

    if (editingComputerId) {
      // Sửa máy tính
      const updatedPcs = computers.map((c) =>
        c.id === editingComputerId ? { ...c, ...computerForm } : c
      );
      saveComputers(updatedPcs);
    } else {
      // Thêm máy tính
      const newPc: Computer = {
        id: 'pc-' + Date.now(),
        ...computerForm,
      };
      saveComputers([...computers, newPc]);
    }

    setEditModalOpen(false);
  };

  // Xóa máy tính
  const handleDeleteComputer = (pcId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa máy tính này khỏi hệ thống không?')) {
      const updatedPcs = computers.filter((c) => c.id !== pcId);
      saveComputers(updatedPcs);
    }
  };

  // Xem chi tiết máy tính
  const handleViewDetail = (pc: Computer) => {
    setSelectedComputerDetail(pc);
    setDetailModalOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Operations Header Banner */}
        <section className="glass-panel rounded-[28px] p-5 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Operations</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Quản lý máy tính</h1>
              <p className="mt-1 text-sm text-slate-600">
                Theo dõi phòng máy, trạng thái hoạt động của thiết bị và xử lý đăng ký mượn máy theo thời gian thực.
              </p>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="ios-button-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold shadow-md shrink-0"
              >
                <span className="text-lg leading-none">+</span>
                <span>Thêm máy mới</span>
              </button>
            )}
          </div>

          {/* 4 Stat Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-xs">
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Máy có sẵn
              </span>
              <p className="mt-3 text-3xl font-extrabold text-emerald-950">{stats.available}</p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 shadow-xs">
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Đang sử dụng
              </span>
              <p className="mt-3 text-3xl font-extrabold text-amber-950">{stats.inUse}</p>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 shadow-xs">
              <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-800">
                Bảo trì
              </span>
              <p className="mt-3 text-3xl font-extrabold text-rose-950">{stats.maintenance}</p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 shadow-xs">
              <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                Yêu cầu chờ
              </span>
              <p className="mt-3 text-3xl font-extrabold text-blue-950">{stats.pendingRequests}</p>
            </div>
          </div>
        </section>

        {/* 2-Column Content Area */}
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          {/* Cột Trái: Danh sách máy & Bộ lọc */}
          <section className="glass-panel rounded-[28px] p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Danh sách máy trong phòng</h2>
                <p className="text-xs text-slate-500">Tổng quan trạng thái từng thiết bị trong hệ thống lab</p>
              </div>

              {/* Ô tìm kiếm */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Tìm kiếm máy, cấu hình..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white/90 px-3.5 py-2 pl-9 text-xs text-slate-700 shadow-inner outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
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

            {/* Filter Tabs theo Phòng và Trạng thái */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {/* Phòng Lab */}
              <div className="flex flex-wrap gap-1.5">
                {['all', 'Phòng Lab 01', 'Phòng Lab 02', 'Phòng Lab 03'].map((room) => (
                  <button
                    key={room}
                    type="button"
                    onClick={() => setSelectedRoom(room)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${selectedRoom === room
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                  >
                    {room === 'all' ? 'Tất cả phòng' : room}
                  </button>
                ))}
              </div>

              {/* Dropdown Trạng thái */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs text-slate-700 outline-none transition focus:border-blue-400"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="available">Có sẵn</option>
                <option value="in_use">Đang sử dụng</option>
                <option value="maintenance">Bảo trì</option>
              </select>
            </div>

            {/* Danh sách máy tính */}
            <div className="space-y-3 pt-2">
              {filteredComputers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">
                  Không tìm thấy máy tính nào phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                filteredComputers.map((pc) => {
                  const isAvailable = pc.status === 'available';
                  const isInUse = pc.status === 'in_use';
                  const isMaintenance = pc.status === 'maintenance';

                  return (
                    <div
                      key={pc.id}
                      className="rounded-[22px] border border-slate-200/80 bg-white/85 p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md duration-200"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        {/* Thông tin máy */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-bold text-blue-700 shadow-xs">
                              {pc.name.slice(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-900">{pc.name}</h3>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  {pc.room}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 truncate max-w-md">{pc.specs}</p>
                            </div>
                          </div>
                        </div>

                        {/* Nhãn trạng thái & Hành động */}
                        <div className="flex flex-wrap items-center justify-between gap-2 md:justify-end">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isAvailable
                              ? 'bg-emerald-100 text-emerald-700'
                              : isInUse
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-700'
                              }`}
                          >
                            {isAvailable ? '🟢 Có sẵn' : isInUse ? '🟡 Đang sử dụng' : '🔴 Bảo trì'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleViewDetail(pc)}
                              className="rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 cursor-pointer"
                            >
                              Chi tiết
                            </button>

                            {/* Nút mượn cho user */}
                            <button
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => {
                                setBorrowForm({ ...borrowForm, computerId: pc.id });
                                setBorrowMessage(null);
                              }}
                              className={`rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xs transition cursor-pointer ${borrowForm.computerId === pc.id
                                ? 'bg-emerald-600 text-white'
                                : isAvailable
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                              {borrowForm.computerId === pc.id ? '✓ Đang chọn' : isAvailable ? 'Đăng ký mượn' : 'Bận'}
                            </button>

                            {/* Nút sửa/xóa cho admin */}
                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(pc)}
                                  className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                >
                                  Sửa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComputer(pc.id)}
                                  className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                                >
                                  Xoá
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

          {/* Cột Phải: Form Đăng ký mượn máy */}
          <section className="glass-panel rounded-[28px] p-5 sm:p-6 space-y-4 h-fit">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Request</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Đăng ký mượn máy</h2>
              <p className="text-xs text-slate-500">
                Gửi yêu cầu đăng ký sử dụng máy tính phục vụ học tập, thi cử và nghiên cứu
              </p>
            </div>

            {/* Thông báo gửi đơn mượn */}
            {borrowMessage && (
              <div
                className={`rounded-2xl p-3 text-xs font-medium ${borrowMessage.type === 'success'
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border border-rose-200 bg-rose-50 text-rose-600'
                  }`}
              >
                {borrowMessage.text}
              </div>
            )}

            <form onSubmit={handleBorrowSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Người đăng ký mượn:
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="font-bold">{currentUser}</span>
                  <span className="text-slate-400">(@{currentUsername})</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Chọn máy tính cần mượn:
                </label>
                <select
                  value={borrowForm.computerId}
                  onChange={(e) => setBorrowForm({ ...borrowForm, computerId: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white/90 px-3.5 py-2.5 text-xs text-slate-700 shadow-inner outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">-- Chọn máy tính trong danh sách --</option>
                  {computers.map((pc) => (
                    <option key={pc.id} value={pc.id} disabled={pc.status !== 'available'}>
                      {pc.name} - {pc.room} {pc.status !== 'available' ? '(Không sẵn sàng)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Lý do mượn & Mục đích sử dụng:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ví dụ: Cần máy thực hành làm đồ án môn Lập trình Web, chạy code demo..."
                  value={borrowForm.reason}
                  onChange={(e) => setBorrowForm({ ...borrowForm, reason: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white/90 px-3.5 py-2.5 text-xs text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={borrowSubmitting}
                className="ios-button-primary w-full py-3 px-4 text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
              >
                {borrowSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu mượn máy'}
              </button>
            </form>
          </section>
        </div>

        {/* Admin Section: Quản lý & Phê duyệt yêu cầu mượn máy */}
        <section className="glass-panel rounded-[28px] p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Approval</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Danh sách yêu cầu mượn máy ({requests.length})
              </h2>
              <p className="text-xs text-slate-500">
                {isAdmin
                  ? 'Quản trị viên có quyền Duyệt, Từ chối và Đánh dấu Trả máy.'
                  : 'Danh sách các yêu cầu mượn máy trong hệ thống.'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Thiết bị</th>
                  <th className="py-3 px-4">Người yêu cầu</th>
                  <th className="py-3 px-4">Lý do mượn</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Thao tác duyệt</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      Chưa có yêu cầu mượn máy nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/50 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div>{req.computerName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{req.room}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{req.borrowerName}</div>
                        <div className="text-[10px] text-slate-400">@{req.borrowerUsername}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-600 truncate">{req.reason}</td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{req.requestDate}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${req.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : req.status === 'approved'
                              ? 'bg-blue-100 text-blue-700'
                              : req.status === 'rejected'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                        >
                          {req.status === 'pending'
                            ? 'Chờ duyệt'
                            : req.status === 'approved'
                              ? 'Đã duyệt'
                              : req.status === 'rejected'
                                ? 'Từ chối'
                                : 'Đã trả máy'}
                        </span>
                      </td>

                      {isAdmin && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {req.status === 'pending' && (
                            <div className="inline-flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleActionRequest(req.id, 'approve')}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                              >
                                Duyệt
                              </button>
                              <button
                                type="button"
                                onClick={() => handleActionRequest(req.id, 'reject')}
                                className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-rose-700 cursor-pointer"
                              >
                                Từ chối
                              </button>
                            </div>
                          )}

                          {req.status === 'approved' && (
                            <button
                              type="button"
                              onClick={() => handleActionRequest(req.id, 'return')}
                              className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
                            >
                              Đánh dấu trả máy
                            </button>
                          )}

                          {(req.status === 'rejected' || req.status === 'returned') && (
                            <span className="text-[11px] text-slate-400">Đã hoàn tất</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal Thêm / Sửa máy tính (Admin) */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-[32px] border border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingComputerId ? 'Cập nhật thông tin máy tính' : 'Thêm máy tính mới'}
              </h2>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveComputer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Tên máy</label>
                  <input
                    type="text"
                    required
                    value={computerForm.name}
                    onChange={(e) => setComputerForm({ ...computerForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Phòng máy</label>
                  <select
                    value={computerForm.room}
                    onChange={(e) => setComputerForm({ ...computerForm, room: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="Phòng Lab 01">Phòng Lab 01</option>
                    <option value="Phòng Lab 02">Phòng Lab 02</option>
                    <option value="Phòng Lab 03">Phòng Lab 03</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Cấu hình chi tiết (CPU, RAM, GPU, SSD)</label>
                <input
                  type="text"
                  required
                  value={computerForm.specs}
                  onChange={(e) => setComputerForm({ ...computerForm, specs: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Trạng thái máy</label>
                  <select
                    value={computerForm.status}
                    onChange={(e) =>
                      setComputerForm({
                        ...computerForm,
                        status: e.target.value as 'available' | 'in_use' | 'maintenance',
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="available">Có sẵn (Available)</option>
                    <option value="in_use">Đang sử dụng (In use)</option>
                    <option value="maintenance">Bảo trì (Maintenance)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Hệ điều hành</label>
                  <input
                    type="text"
                    value={computerForm.os || ''}
                    onChange={(e) => setComputerForm({ ...computerForm, os: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Phần mềm cài sẵn</label>
                <input
                  type="text"
                  value={computerForm.software || ''}
                  onChange={(e) => setComputerForm({ ...computerForm, software: e.target.value })}
                  placeholder="VSCode, Docker, PyTorch, Unity..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="ios-button-secondary px-4 py-2 text-xs font-semibold"
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="ios-button-primary px-5 py-2 text-xs font-semibold">
                  {editingComputerId ? 'Lưu thay đổi' : 'Thêm máy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem chi tiết máy tính */}
      {detailModalOpen && selectedComputerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-[32px] border border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold">
                  {selectedComputerDetail.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedComputerDetail.name}</h3>
                  <span className="text-xs text-slate-500">{selectedComputerDetail.room}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-semibold text-slate-500 block mb-1">CẤU HÌNH PHẦN CỨNG</span>
                <p className="text-slate-800 font-medium">{selectedComputerDetail.specs}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="font-semibold text-slate-500 block mb-1">HỆ ĐIỀU HÀNH</span>
                  <p className="text-slate-800">{selectedComputerDetail.os || 'Windows 11 Pro'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="font-semibold text-slate-500 block mb-1">MÀN HÌNH</span>
                  <p className="text-slate-800">{selectedComputerDetail.screen || 'Dell 24" IPS'}</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-semibold text-slate-500 block mb-1">THIẾT BỊ NGOẠI VI</span>
                <p className="text-slate-800">{selectedComputerDetail.peripherals || 'Bàn phím & Chuột'}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-semibold text-slate-500 block mb-1">PHẦN MỀM ĐÃ CÀI ĐẶT</span>
                <p className="text-slate-800">{selectedComputerDetail.software || 'Công cụ lập trình cơ bản'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="ios-button-primary px-5 py-2 text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
