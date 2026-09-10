'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/AppLayout';
import { supabase } from '@/lib/supabaseClient';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'Nguyễn Viết Hùng',
    email: 'hung@gmail.com',
    phone: '0901234567',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  useEffect(() => {
    // Kiểm tra quyền đăng nhập
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) {
      router.replace('/login');
      return;
    }
    setIsAuthorized(true);

    const savedProfile = localStorage.getItem('user_profile') || localStorage.getItem('student_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile({
          fullName: parsed.fullName || 'Nguyễn Viết Hùng',
          email: parsed.email || 'hung@gmail.com',
          phone: parsed.phone || '0901234567',
        });
      } catch (e) {
        console.error('Lỗi khi đọc thông tin từ localStorage', e);
      }
    }

    // Lấy danh sách máy người dùng này đã yêu cầu mượn
    const currentUser = localStorage.getItem('currentUser') || 'Nguyễn Viết Hùng';
    const savedRequests = localStorage.getItem('computer_borrow_requests');
    if (savedRequests) {
      try {
        const parsed = JSON.parse(savedRequests);
        const filtered = parsed.filter(
          (r: any) =>
            r.borrowerUsername?.toLowerCase() === currentUser.toLowerCase() ||
            r.borrowerName?.toLowerCase() === currentUser.toLowerCase() ||
            currentUser.toLowerCase() === 'admin'
        );
        setMyRequests(filtered);
      } catch {
        // ignore
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    // Lưu vào localStorage để đồng bộ dữ liệu
    localStorage.setItem('user_profile', JSON.stringify(profile));
    localStorage.setItem('student_profile', JSON.stringify(profile));
    localStorage.setItem('currentUser', profile.fullName);

    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 400);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  if (!isAuthorized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const initial = profile.fullName ? profile.fullName.trim().charAt(0).toUpperCase() : 'U';

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Title */}
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Account</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Hồ sơ cá nhân</h1>
          <p className="mt-1 text-sm text-slate-600">Quản lý và cập nhật thông tin cá nhân của bạn</p>
        </div>

        {/* Thông báo cập nhật */}
        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-800 shadow-xs animate-in fade-in">
            ✓ Cập nhật thông tin cá nhân thành công!
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Cột Trái: Thẻ Tóm tắt Thông tin cá nhân */}
          <div className="glass-panel rounded-[28px] p-6 text-center space-y-4 md:col-span-1 h-fit">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto font-bold text-3xl shadow-lg shadow-indigo-500/25 ring-4 ring-white/80">
              {initial}
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">{profile.fullName}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Người dùng cá nhân</p>
            </div>

            <div className="pt-3 border-t border-slate-200/60 space-y-2.5 text-left text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  📧
                </span>
                <div className="overflow-hidden">
                  <p className="text-[10px] text-slate-400 font-medium">Email</p>
                  <p className="truncate font-semibold text-slate-800">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  📱
                </span>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Số điện thoại</p>
                  <p className="font-semibold text-slate-800">{profile.phone}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex flex-col gap-2">
              <Link
                href="/about"
                className="ios-button-secondary py-2 px-3 text-xs font-semibold text-center text-slate-700 block"
              >
                Giới thiệu bản thân
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-rose-200 bg-rose-50/80 py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>

          {/* Cột Phải: Form Cập nhật & Lịch sử mượn */}
          <div className="space-y-6 md:col-span-2">
            {/* Form chỉnh sửa */}
            <div className="glass-panel rounded-[28px] p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Chỉnh sửa thông tin cá nhân
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Họ và tên */}
                <div>
                  <label htmlFor="fullName" className="block font-semibold text-slate-700 mb-1">
                    Họ và tên:
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white/90 text-slate-800 shadow-inner outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Email & Số điện thoại */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="email" className="block font-semibold text-slate-700 mb-1">
                      Email:
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={isLoading}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white/90 text-slate-800 shadow-inner outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block font-semibold text-slate-700 mb-1">
                      Số điện thoại:
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="0912345678"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={isLoading}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white/90 text-slate-800 shadow-inner outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Nút lưu thay đổi */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ios-button-primary w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider disabled:opacity-50 mt-2"
                >
                  {isLoading ? 'Đang lưu thay đổi...' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>

            {/* Danh sách yêu cầu mượn máy của sinh viên */}
            <div className="glass-panel rounded-[28px] p-6 space-y-3">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Lịch sử đăng ký mượn máy
              </h3>

              {myRequests.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  Bạn chưa gửi yêu cầu mượn máy tính nào.{' '}
                  <Link href="/computers" className="text-blue-600 hover:underline">
                    Đến trang Quản lý máy tính
                  </Link>
                </p>
              ) : (
                <div className="space-y-2">
                  {myRequests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{req.computerName} ({req.room})</div>
                        <div className="text-[11px] text-slate-500">{req.reason}</div>
                        <div className="text-[10px] text-slate-400">{req.requestDate}</div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold shrink-0 ${
                          req.status === 'pending'
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}