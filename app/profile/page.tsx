'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/AppLayout';
import { supabase } from '@/lib/supabaseClient';

interface UserProfile {
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  role: string;
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'Người dùng',
    studentId: 'SV-123456',
    email: 'user@example.com',
    phone: '0912345678',
    role: 'Sinh viên',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [myBookings, setMyBookings] = useState<any[]>([]);

  useEffect(() => {
    // Kiểm tra đăng nhập
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) {
      router.replace('/login');
      return;
    }
    setIsAuthorized(true);

    const savedProfile = localStorage.getItem('student_profile') || localStorage.getItem('user_profile');
    const savedUser = localStorage.getItem('currentUser') || 'Người dùng';
    const savedEmail = localStorage.getItem('user_email') || '';

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile({
          fullName: parsed.fullName || savedUser,
          studentId: parsed.studentId || 'SV-2026' + Math.floor(100 + Math.random() * 900),
          email: parsed.email || savedEmail || 'student@university.edu.vn',
          phone: parsed.phone || '0901234567',
          role: parsed.role || 'Sinh viên / Giảng viên',
        });
      } catch (e) {
        console.error('Lỗi khi đọc profile:', e);
      }
    } else {
      setProfile((prev) => ({
        ...prev,
        fullName: savedUser,
        email: savedEmail || prev.email,
      }));
    }

    // Lấy danh sách phòng người dùng đã đặt
    const savedBookings = localStorage.getItem('room_bookings');
    if (savedBookings) {
      try {
        const parsed = JSON.parse(savedBookings);
        const filtered = parsed.filter(
          (b: any) =>
            b.userName?.toLowerCase() === savedUser.toLowerCase() ||
            (savedEmail && b.userEmail?.toLowerCase() === savedEmail.toLowerCase())
        );
        setMyBookings(filtered);
      } catch {
        // ignore
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      // Lưu vào Supabase profiles nếu có user session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: profile.fullName.trim(),
          phone: profile.phone.trim(),
        });
      }
    } catch (err) {
      console.warn('Lỗi cập nhật profile Supabase:', err);
    }

    // Lưu vào localStorage
    localStorage.setItem('student_profile', JSON.stringify(profile));
    localStorage.setItem('user_profile', JSON.stringify(profile));
    localStorage.setItem('currentUser', profile.fullName);
    if (profile.role === 'Quản trị viên') {
      localStorage.setItem('user_role', 'admin');
    } else {
      localStorage.setItem('user_role', 'user');
    }

    // Bắn event để AppLayout góc dưới bên trái cập nhật vai trò tức thì
    window.dispatchEvent(new Event('profileUpdated'));
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 300);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  if (!isAuthorized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100 font-sans">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const initial = profile.fullName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.24em] text-blue-600">User Profile</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Hồ Sơ Cá Nhân</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Quản lý thông tin định danh sinh viên, giảng viên và theo dõi lịch sử đặt phòng học.
            </p>
          </div>

          <Link
            href="/my-bookings"
            className="ios-button-secondary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
          >
            <span>📅 Lịch đặt của tôi ({myBookings.length})</span>
          </Link>
        </div>

        {/* Hero Card thông tin tài khoản */}
        <div className="glass-panel rounded-[28px] p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 ring-4 ring-white/90">
            {initial}
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{profile.fullName}</h2>
              <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-800">
                {profile.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">Mã số: {profile.studentId}</p>
            <p className="text-xs text-slate-600 truncate">{profile.email}</p>
          </div>

          {/* Quick Stats in Hero */}
          <div className="flex gap-3 text-center">
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Đã đặt</span>
              <span className="text-xl font-extrabold text-blue-700">{myBookings.length}</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Chờ duyệt</span>
              <span className="text-xl font-extrabold text-amber-600">
                {myBookings.filter((b) => b.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>

        {/* Thông báo cập nhật thành công */}
        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-xs">
            <span>✅</span>
            <span>Cập nhật thông tin hồ sơ cá nhân thành công!</span>
          </div>
        )}

        {/* Form Chỉnh Sửa Hồ Sơ */}
        <div className="glass-panel rounded-[28px] p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-200/60 pb-3">
            <h3 className="text-lg font-bold text-slate-900">Chi tiết thông tin cá nhân</h3>
            <p className="text-xs text-slate-500">Thông tin này được sử dụng khi gửi yêu cầu mượn phòng học</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Họ và tên */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Mã sinh viên / Nhân viên */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Mã sinh viên / Mã nhân viên
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: B21DCCN123 hoặc GV-089"
                  value={profile.studentId}
                  onChange={(e) => setProfile({ ...profile, studentId: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Vai trò */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Vai trò trong hệ thống
              </label>
              <select
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Sinh viên">Sinh viên</option>
                <option value="Giảng viên">Giảng viên</option>
                <option value="Cán bộ phòng ban">Cán bộ phòng ban</option>
                <option value="Quản trị viên">Quản trị viên</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full sm:w-auto rounded-2xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 cursor-pointer"
              >
                Đăng xuất tài khoản
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="ios-button-primary w-full sm:w-auto px-6 py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
              >
                {isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi Hồ Sơ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}