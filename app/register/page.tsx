'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (name.trim().length < 2) {
      setError('Họ và tên phải có ít nhất 2 ký tự.');
      return;
    }

    if (!email.includes('@')) {
      setError('Email không hợp lệ. Vui lòng nhập lại.');
      return;
    }

    if (password.length < 3) {
      setError('Mật khẩu phải chứa ít nhất 3 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);

    // Lưu tài khoản đăng ký vào localStorage để đăng nhập & đổi mật khẩu thực tế
    localStorage.setItem('user_username', name.trim());
    localStorage.setItem('user_email', email.trim());
    localStorage.setItem('user_password', password);

    // Giả lập gửi API đăng ký tài khoản
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    }, 800);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="glass-panel flex w-full max-w-5xl overflow-hidden rounded-[38px] border border-white/80 shadow-[0_30px_80px_rgba(79,110,247,0.16)] bg-white/85">
        {/* Cột Trái: Hero Banner theo giao diện qlpl-demo */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-700 md:flex p-10 text-white">
          <div className="pointer-events-none absolute -right-10 top-8 h-40 w-40 rounded-full border border-white/20"></div>
          <div className="pointer-events-none absolute right-28 top-28 h-3 w-3 rounded-full bg-white/40"></div>
          <div className="pointer-events-none absolute left-16 top-1/2 h-2 w-2 rounded-full bg-white/40"></div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12),transparent_40%)]"></div>

          {/* Logo Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/10 text-sm font-bold text-white shadow-sm">
              ◎
            </span>
            <span className="text-sm font-semibold tracking-[0.22em] text-white/90">QLPL DEMO</span>
          </div>

          {/* Hero text */}
          <div className="relative z-10 pb-16">
            <p className="mb-2 text-sm text-white/80 font-medium">Join us today</p>
            <h1 className="mb-4 text-4xl font-extrabold uppercase leading-tight tracking-tight text-white">
              GET STARTED
            </h1>
            <div className="mb-4 h-1.5 w-14 rounded-full bg-white/80"></div>
            <p className="max-w-sm text-sm leading-6 text-white/80 font-normal">
              Đăng ký tài khoản để truy cập hệ thống phòng máy tính, gửi yêu cầu mượn thiết bị và quản lý lịch thực hành.
            </p>
          </div>

          {/* Sóng SVG */}
          <svg className="absolute bottom-0 left-0 w-full text-white/10" viewBox="0 0 500 120" preserveAspectRatio="none">
            <path d="M0,40 C150,120 350,0 500,60 L500,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>

        {/* Cột Phải: Form Đăng ký */}
        <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 md:w-1/2">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-6">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">ACCOUNT</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Đăng ký</h2>
              <p className="mt-1 text-sm text-slate-500">Nhập thông tin bên dưới để tiếp tục.</p>
            </div>

            {/* Thông báo */}
            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-xs text-green-700">
                Đăng ký tài khoản thành công! Đang chuyển hướng về đăng nhập...
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading || success}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-2.5 text-sm text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="nhap-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || success}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-2.5 text-sm text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || success}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-2.5 text-sm text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || success}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-2.5 text-sm text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || success}
                className="ios-button-primary w-full py-3 px-4 text-sm font-semibold uppercase tracking-wider disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Đang tạo tài khoản...' : 'ĐĂNG KÝ'}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200/70 pt-4 text-center text-xs text-slate-600">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
