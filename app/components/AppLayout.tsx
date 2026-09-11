'use client';

import { useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface AppLayoutProps {
  children: ReactNode;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'approved' | 'rejected' | 'info';
}

function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(() => {
    const raw = localStorage.getItem('system_notifications');
    if (raw) {
      try {
        setNotifications(JSON.parse(raw));
      } catch {
        setNotifications([]);
      }
    } else {
      // Mẫu thông báo khởi tạo
      const defaultNotifs: AppNotification[] = [
        {
          id: 'notif-1',
          title: 'Yêu cầu được chấp nhận',
          message: 'Đơn đặt phòng A-101 ngày 15/10/2026 đã được duyệt.',
          createdAt: '10 phút trước',
          read: false,
          type: 'approved',
        },
      ];
      setNotifications(defaultNotifs);
      localStorage.setItem('system_notifications', JSON.stringify(defaultNotifs));
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener('notificationsUpdated', handleUpdate);
    return () => window.removeEventListener('notificationsUpdated', handleUpdate);
  }, [loadNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('system_notifications', JSON.stringify(updated));
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-slate-700 shadow-xs transition hover:bg-white hover:scale-105 cursor-pointer"
        aria-label="Thông báo"
      >
        <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900">Thông báo</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">Không có thông báo nào</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-2.5 rounded-xl border transition ${
                    n.read ? 'bg-slate-50/60 border-slate-100 text-slate-600' : 'bg-blue-50/70 border-blue-100 text-slate-800 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.createdAt}</span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed text-slate-600">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('Người dùng');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRoleText, setUserRoleText] = useState<string>('Sinh viên');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadUserData = useCallback(() => {
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (localStorage.getItem('isLoggedIn') === null) {
      // Thiết lập mặc định đã đăng nhập cho Vercel demo
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', 'Người dùng Vercel');
      isLoggedIn = true;
    }

    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }

    const savedUser = localStorage.getItem('currentUser') || 'Người dùng';
    const savedRole = localStorage.getItem('user_role');
    const savedEmail = localStorage.getItem('user_email') || '';
    const savedProfile = localStorage.getItem('student_profile');

    let displayName = savedUser;
    let email = savedEmail;
    let roleText = 'Sinh viên';

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.fullName) displayName = parsed.fullName;
        if (parsed.email) email = parsed.email;
        if (parsed.role) roleText = parsed.role;
      } catch {
        // use fallback
      }
    } else {
      if (savedRole === 'admin' || savedUser.toLowerCase().includes('admin')) {
        roleText = 'Quản trị viên';
      }
    }

    setCurrentUser(displayName);
    setUserEmail(email);
    setUserRoleText(roleText);
    setIsAdmin(
      roleText === 'Quản trị viên' ||
        savedRole === 'admin' ||
        savedUser.toLowerCase().includes('admin')
    );
  }, [router]);

  useEffect(() => {
    loadUserData();

    const handleProfileUpdate = () => {
      loadUserData();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, [loadUserData]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // 4 Mục Navigation chính
  const navItems = [
    {
      label: 'Danh sách phòng',
      href: '/rooms',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M3 21h18" />
          <path d="M5 21V7l8-4v18" />
          <path d="M19 21V11l-6-3" />
          <path d="M9 9h1" />
          <path d="M9 13h1" />
          <path d="M9 17h1" />
        </svg>
      ),
      badge: 'Chính',
    },
    {
      label: 'Lịch đặt phòng của tôi',
      href: '/my-bookings',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: 'Hồ sơ cá nhân',
      href: '/profile',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: 'Hướng dẫn & Quy định',
      href: '/regulations',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
    {
      label: 'Báo cáo & Thống kê',
      href: '/analytics',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      badge: 'Admin',
    },
  ];

  const initial = currentUser.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex h-screen flex-col overflow-hidden p-3 md:p-4 text-slate-800">
      {/* Top Header */}
      <header className="glass-panel flex h-18 w-full shrink-0 items-center justify-between rounded-[28px] px-4 py-2 sm:px-6">
        {/* Left: Sidebar toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Đóng/mở menu"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-700 shadow-sm transition hover:bg-white hover:scale-105 cursor-pointer"
          >
            <div className="relative w-5 h-4 flex flex-col justify-between items-center">
              <span
                className={`w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 transform origin-left ${
                  sidebarOpen ? 'rotate-45 translate-x-0.5 -translate-y-0.5' : ''
                }`}
              />
              <span
                className={`w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${
                  sidebarOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
                }`}
              />
              <span
                className={`w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 transform origin-left ${
                  sidebarOpen ? '-rotate-45 translate-x-0.5 translate-y-0.5' : ''
                }`}
              />
            </div>
          </button>

          <Link href="/rooms" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-base font-bold text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
              🏫
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Hệ Thống Quản Lý</p>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">SMART ROOM</span>
            </div>
          </Link>
        </div>

        {/* Right: Notification Bell + User dropdown */}
        <div className="flex items-center gap-3">
          {/* Quả chuông thông báo */}
          <NotificationBell />

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-white/80 bg-white/70 py-1 pl-1 pr-3.5 shadow-sm transition hover:bg-white hover:shadow cursor-pointer"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
                {initial}
              </span>
              <span className="text-sm font-semibold text-slate-700 max-w-[140px] truncate">{currentUser}</span>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-[0_20px_45px_rgba(15,23,42,0.15)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">Đang đăng nhập:</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{currentUser}</p>
                  {userEmail && <p className="text-xs text-slate-500 truncate">{userEmail}</p>}
                </div>

                <Link
                  href="/rooms"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100/90"
                >
                  <span className="text-base">🏫</span>
                  <span>Danh sách phòng học</span>
                </Link>

                <Link
                  href="/my-bookings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100/90"
                >
                  <span className="text-base">📅</span>
                  <span>Lịch đặt của tôi</span>
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100/90"
                >
                  <span className="text-base">👤</span>
                  <span>Hồ sơ cá nhân</span>
                </Link>

                <Link
                  href="/regulations"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100/90"
                >
                  <span className="text-base">ℹ️</span>
                  <span>Hướng dẫn & Quy định</span>
                </Link>

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Area: Sidebar + Page Content */}
      <div className="mt-3 flex flex-1 gap-3 overflow-hidden relative">
        {/* Sidebar Navigation */}
        <aside
          className={`glass-panel shrink-0 overflow-hidden rounded-[28px] transition-all duration-300 ease-in-out ${
            sidebarOpen
              ? 'w-64 sm:w-72 opacity-100'
              : 'w-0 opacity-0 -mr-3 border-none p-0 pointer-events-none'
          }`}
        >
          <nav className="w-64 sm:w-72 flex flex-col justify-between h-full p-4">
            <div className="space-y-1.5 pt-1">

              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href === '/rooms' && pathname === '/computers');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-medium transition duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/12 to-indigo-600/12 text-blue-700 shadow-inner ring-1 ring-blue-200/80 font-bold'
                        : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                          isActive ? 'bg-white text-blue-600 shadow-xs' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Role Info Card: Thay đổi linh hoạt theo vai trò người dùng đã chọn trong Hồ sơ cá nhân */}
            <div className="pt-4 border-t border-slate-200/60">
              {userRoleText === 'Quản trị viên' ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-900 shadow-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Vai trò: Quản trị viên</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Có toàn quyền thêm/sửa/xóa phòng học và quản lý duyệt đơn mượn phòng.
                  </p>
                </div>
              ) : userRoleText === 'Giảng viên' ? (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/90 p-3.5 text-xs text-indigo-900 shadow-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <span>Vai trò: Giảng viên</span>
                  </div>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    Ưu tiên mượn phòng hội thảo, hội trường giảng dạy và chấm đồ án.
                  </p>
                </div>
              ) : userRoleText === 'Cán bộ phòng ban' ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-900 shadow-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Vai trò: Cán bộ phòng ban</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Quản lý tài sản, trang thiết bị kỹ thuật và điều phối hoạt động phòng học.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/90 p-3.5 text-xs text-blue-900 shadow-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>Vai trò: {userRoleText}</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Tra cứu phòng học trống và gửi yêu cầu đặt phòng báo cáo, sinh hoạt học thuật.
                  </p>
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* Dynamic Page Content */}
        <main className="glass-panel flex-1 overflow-y-auto rounded-[28px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
