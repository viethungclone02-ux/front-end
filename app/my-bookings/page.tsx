'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';

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

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('Người dùng');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewScope, setViewScope] = useState<'mine' | 'all'>('mine');
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Modal từ chối (Admin)
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
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
        // ignore
      }
    }

    setCurrentUser(displayName);
    setCurrentUserEmail(email);
    const adminRole = savedRole === 'admin' || savedUser.toLowerCase().includes('admin');
    setIsAdmin(adminRole);
    if (adminRole) {
      setViewScope('all');
    }

    const savedBookings = localStorage.getItem('room_bookings');
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch {
        setBookings([]);
      }
    }
  }, []);

  const saveBookings = (newBookings: BookingRequest[]) => {
    setBookings(newBookings);
    localStorage.setItem('room_bookings', JSON.stringify(newBookings));
  };

  // Lọc theo người dùng và trạng thái
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Phạm vi
      const matchScope =
        viewScope === 'all'
          ? true
          : b.userName?.toLowerCase() === currentUser?.toLowerCase() ||
            (currentUserEmail && b.userEmail?.toLowerCase() === currentUserEmail?.toLowerCase());

      // Trạng thái
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchScope && matchStatus;
    });
  }, [bookings, viewScope, currentUser, currentUserEmail, statusFilter]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const userBookings = bookings.filter(
      (b) =>
        b.userName?.toLowerCase() === currentUser?.toLowerCase() ||
        (currentUserEmail && b.userEmail?.toLowerCase() === currentUserEmail?.toLowerCase())
    );
    return {
      myTotal: userBookings.length,
      myPending: userBookings.filter((b) => b.status === 'pending').length,
      myApproved: userBookings.filter((b) => b.status === 'approved').length,
      myRejected: userBookings.filter((b) => b.status === 'rejected').length,
      allTotal: bookings.length,
      allPending: bookings.filter((b) => b.status === 'pending').length,
    };
  }, [bookings, currentUser, currentUserEmail]);

  // Xử lý HỦY YÊU CẦU ĐẶT PHÒNG
  const handleCancelBooking = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;

    if (confirm(`Bạn có chắc chắn muốn hủy yêu cầu đặt phòng ${target.roomName} không?`)) {
      const updated = bookings.filter((b) => b.id !== bookingId);
      saveBookings(updated);
      setNotification({
        type: 'info',
        text: `Đã hủy thành công yêu cầu đặt ${target.roomName}.`,
      });
      setTimeout(() => setNotification(null), 3500);
    }
  };

  // Admin: Duyệt yêu cầu
  const handleApprove = (bookingId: string) => {
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'approved' as const } : b
    );
    saveBookings(updated);
    setNotification({
      type: 'success',
      text: 'Đã phê duyệt yêu cầu đặt phòng thành công!',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Admin: Mở modal từ chối
  const handleOpenReject = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setRejectionReason('Phòng trùng lịch học cố định của trường');
    setRejectModalOpen(true);
  };

  // Admin: Xác nhận từ chối
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;

    const updated = bookings.map((b) =>
      b.id === selectedBookingId
        ? { ...b, status: 'rejected' as const, rejectionReason }
        : b
    );
    saveBookings(updated);
    setRejectModalOpen(false);
    setSelectedBookingId(null);
    setNotification({
      type: 'info',
      text: 'Đã từ chối yêu cầu đặt phòng.',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Hero */}
        <section className="glass-panel rounded-[28px] p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-100 px-2.5 py-1 text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                  My Bookings
                </span>
                <span className="text-xs text-slate-500">Quản lý các yêu cầu đã gửi</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Lịch Đặt Phòng Của Tôi
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Theo dõi tiến độ xét duyệt yêu cầu mượn phòng, kiểm tra thời gian sử dụng hoặc chủ động hủy yêu cầu khi có thay đổi.
              </p>
            </div>

            <Link
              href="/rooms"
              className="ios-button-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-md shrink-0"
            >
              <span>+ Đặt phòng mới</span>
            </Link>
          </div>

          {/* 4 Stat Badges */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 shadow-xs">
              <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                {isAdmin ? 'Đơn của tôi / Toàn trường' : 'Tổng số yêu cầu'}
              </span>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-blue-950">
                {isAdmin ? `${stats.myTotal} / ${stats.allTotal}` : stats.myTotal}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 shadow-xs">
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                ⏳ Chờ duyệt
              </span>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-950">
                {isAdmin ? `${stats.myPending} / ${stats.allPending}` : stats.myPending}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-xs">
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                ✅ Đã duyệt
              </span>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-950">{stats.myApproved}</p>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 shadow-xs">
              <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-800">
                ❌ Từ chối
              </span>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-rose-950">{stats.myRejected}</p>
            </div>
          </div>
        </section>

        {/* Thông báo thao tác */}
        {notification && (
          <div
            className={`rounded-2xl p-4 text-xs font-semibold flex items-center justify-between shadow-xs ${
              notification.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{notification.type === 'success' ? '✅' : 'ℹ️'}</span>
              <span>{notification.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Danh sách yêu cầu đặt phòng */}
        <section className="glass-panel rounded-[28px] p-5 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Danh sách yêu cầu ({filteredBookings.length})
              </h2>
              <p className="text-xs text-slate-500">
                Trạng thái: Chờ duyệt (Vàng), Đã duyệt (Xanh), Từ chối (Đỏ)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle phạm vi xem cho Admin */}
              {isAdmin && (
                <div className="flex rounded-xl border border-slate-200 bg-white/80 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewScope('all')}
                    className={`rounded-lg px-3 py-1 font-medium transition cursor-pointer ${
                      viewScope === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Toàn bộ hệ thống
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewScope('mine')}
                    className={`rounded-lg px-3 py-1 font-medium transition cursor-pointer ${
                      viewScope === 'mine'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Chỉ của tôi
                  </button>
                </div>
              )}

              {/* Lọc trạng thái */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-400"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">⏳ Chờ duyệt</option>
                <option value="approved">✅ Đã duyệt</option>
                <option value="rejected">❌ Từ chối</option>
              </select>
            </div>
          </div>

          {/* Thẻ danh sách Bookings */}
          {filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                📅
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-800">Chưa có yêu cầu đặt phòng nào</h3>
              <p className="mt-1 text-xs text-slate-500">
                Bạn chưa gửi yêu cầu đặt phòng nào phù hợp với bộ lọc hiện tại.
              </p>
              <Link
                href="/rooms"
                className="ios-button-primary mt-4 inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold"
              >
                Khám phá phòng học ngay →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredBookings.map((req) => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';

                return (
                  <div
                    key={req.id}
                    className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-xs transition hover:shadow-md hover:-translate-y-0.5 space-y-3.5"
                  >
                    {/* Header Card: Tên phòng + Badge trạng thái */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🏫</span>
                          <h3 className="text-base font-bold text-slate-900">{req.roomName}</h3>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">{req.building}</span>
                      </div>

                      {/* Badge trạng thái (Chờ duyệt, Đã duyệt, Từ chối) */}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold border shrink-0 ${
                          isPending
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : isApproved
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}
                      >
                        {isPending ? '⏳ Chờ duyệt' : isApproved ? '✅ Đã duyệt' : '❌ Từ chối'}
                      </span>
                    </div>

                    {/* Chi tiết thời gian & Người đặt */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Ngày sử dụng</span>
                        <span className="font-semibold text-slate-900">{req.bookingDate}</span>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Khung giờ</span>
                        <span className="font-semibold text-blue-700">{req.timeSlot}</span>
                      </div>
                    </div>

                    {/* Mục đích sử dụng */}
                    <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100 text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">
                        Mục đích sử dụng:
                      </span>
                      <p className="text-slate-800 leading-relaxed font-medium">{req.purpose}</p>
                    </div>

                    {/* Lý do từ chối nếu có */}
                    {isRejected && req.rejectionReason && (
                      <div className="rounded-xl bg-rose-50 p-2.5 border border-rose-200 text-xs text-rose-800">
                        <span className="font-bold block">Lý do từ chối:</span>
                        <p>{req.rejectionReason}</p>
                      </div>
                    )}

                    {/* Footer: Thời gian đặt + Nút Hủy yêu cầu / Nút duyệt */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      <div>
                        <span>Người đặt: </span>
                        <strong className="text-slate-700">{req.userName}</strong>
                        <div className="text-[10px] text-slate-400">Gửi lúc: {req.createdAt}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Nút HỦY YÊU CẦU (User) */}
                        {(isPending || isApproved) && (
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(req.id)}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 cursor-pointer"
                          >
                            Hủy yêu cầu
                          </button>
                        )}

                        {/* Admin Action: Duyệt / Từ chối */}
                        {isAdmin && isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(req.id)}
                              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                            >
                              Duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenReject(req.id)}
                              className="rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* MODAL TỪ CHỐI YÊU CẦU (ADMIN) */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="glass-panel w-full max-w-md rounded-[28px] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Từ chối yêu cầu đặt phòng</h3>
            <p className="text-xs text-slate-500">
              Vui lòng nhập lý do từ chối để người dùng nắm rõ thông tin:
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-800 outline-none focus:border-blue-400"
                placeholder="Ví dụ: Phòng trùng lịch kiểm tra học kỳ, đang bảo dưỡng điều hòa..."
              ></textarea>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="ios-button-secondary px-4 py-2 text-xs font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-sm cursor-pointer"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
