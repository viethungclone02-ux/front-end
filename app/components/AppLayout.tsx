'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
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
  const [currentUser, setCurrentUser] = useState<string>('Nguyễn Viết Hùng');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Kiểm tra đăng nhập
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }

    const savedUser = localStorage.getItem('currentUser') || 'Nguyễn Viết Hùng';
    const savedProfile = localStorage.getItem('student_profile');
    let displayName = savedUser;

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.fullName) displayName = parsed.fullName;
      } catch {
        // use fallback
      }
    }

    setCurrentUser(displayName);
    setIsAdmin(savedUser.toLowerCase() === 'admin');
  }, [router]);

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
    router.push('/login');
  };

  const navItems = [
    {
      label: 'Quản lý máy tính',
      href: '/computers',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
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
      label: 'Giới thiệu bản thân',
      href: '/about',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
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

          <Link href="/computers" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
              ◎
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace</p>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">QLPL DEMO</span>
            </div>
          </Link>
        </div>

        {/* Right: Status pill + User dropdown */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>System online</span>
          </div>

          {/* User profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-white/80 bg-white/70 py-1 pl-1 pr-3.5 shadow-sm transition hover:bg-white hover:shadow cursor-pointer"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
                {initial}
              </span>
              <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">{currentUser}</span>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-[0_20px_45px_rgba(15,23,42,0.15)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs text-slate-500">Đang đăng nhập với tư cách</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{currentUser}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100/90"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Hồ sơ cá nhân
                </Link>
                <Link
                  href="/computers"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100/90"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  Quản lý máy tính
                </Link>
                <Link
                  href="/about"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100/90"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Giới thiệu bản thân
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
        {/* Sidebar */}
        <aside
          className={`glass-panel shrink-0 overflow-hidden rounded-[28px] transition-all duration-200 ${
            sidebarOpen ? 'w-64 sm:w-68' : 'w-0 border-none p-0 opacity-0 pointer-events-none'
          }`}
        >
          <nav className="w-64 sm:w-68 flex flex-col justify-between h-full p-4">
            <div className="space-y-2">
              <div className="px-3 pb-2 pt-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Navigation</p>
              </div>

              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/12 to-indigo-600/12 text-blue-700 shadow-inner ring-1 ring-blue-200/80 font-semibold'
                        : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                        isActive ? 'bg-white text-blue-600 shadow-xs' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Bottom Role Info Card */}
            <div className="pt-4 border-t border-slate-200/60">
              {isAdmin ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900 shadow-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Vai trò: Quản trị viên</span>
                  </div>
                  <p className="text-[11px] text-amber-700">Đầy đủ quyền thêm, sửa, xoá máy tính và duyệt đơn mượn.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/90 p-3 text-xs text-blue-900 shadow-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Vai trò: Người dùng cá nhân</span>
                  </div>
                  <p className="text-[11px] text-blue-700">Xem danh sách máy tính và gửi yêu cầu đăng ký mượn máy.</p>
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
