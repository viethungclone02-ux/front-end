'use client';

import { useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface AppLayoutProps {
  children: ReactNode;
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
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
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

        {/* Right: User dropdown (Hệ thống trực tuyến đã bỏ theo yêu cầu) */}
        <div className="flex items-center gap-3">
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
      <div className="mt-3 flex flex-1 gap-3 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`glass-panel shrink-0 overflow-hidden rounded-[28px] transition-all duration-200 ${
            sidebarOpen ? 'w-64 sm:w-72' : 'w-0 border-none p-0 opacity-0 pointer-events-none'
          }`}
        >
          <nav className="w-64 sm:w-72 flex flex-col justify-between h-full p-4">
            <div className="space-y-1.5">
              <div className="px-3 pb-2 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Navigation</p>
              </div>

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
