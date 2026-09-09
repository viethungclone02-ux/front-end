'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'change-password'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Khởi tạo state cho Đổi Mật Khẩu
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Xóa thông báo lỗi/thành công khi đổi view
  useEffect(() => {
    setError('');
    setSuccessMsg('');
  }, [view]);

  // Tự động điền tài khoản nếu đã nhớ trước đó
  useEffect(() => {
    const remembered = localStorage.getItem('remember_username');
    if (remembered) {
      setUsername(remembered);
    }
  }, []);

  // Xử lý đăng nhập
  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUser = username.trim();

    if (!trimmedUser) {
      setError('Vui lòng nhập tên đăng nhập.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const savedEmail = localStorage.getItem('user_email');
      const savedUsername = localStorage.getItem('user_username');
      const savedPassword = localStorage.getItem('user_password');

      // Kiểm tra thông tin đăng nhập: admin / 123 (mặc định theo yêu cầu)
      const isAdmin = trimmedUser.toLowerCase() === 'admin' && (savedPassword ? password === savedPassword : password === '123');

      // Hoặc tài khoản đã đăng ký trong hệ thống
      const isSavedUser =
        ((savedUsername && trimmedUser.toLowerCase() === savedUsername.toLowerCase()) ||
          (savedEmail && trimmedUser.toLowerCase() === savedEmail.toLowerCase())) &&
        savedPassword &&
        password === savedPassword;

      if (!isAdmin && !isSavedUser) {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác. (Gợi ý: admin / 123)');
        return;
      }

      // Lưu trạng thái đăng nhập
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', trimmedUser);
      if (rememberMe) {
        localStorage.setItem('remember_username', trimmedUser);
      } else {
        localStorage.removeItem('remember_username');
      }

      router.push('/computers');
    }, 500);
  };

  // Xử lý đổi mật khẩu
  const handleSubmitChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUser = username.trim();
    const savedEmail = localStorage.getItem('user_email') || 'hung@gmail.com';
    const savedUsername = localStorage.getItem('user_username') || 'admin';
    const savedPassword = localStorage.getItem('user_password') || '123';

    // 1. Kiểm tra tài khoản hợp lệ
    const isUserValid =
      trimmedUser.toLowerCase() === 'admin' ||
      trimmedUser.toLowerCase() === savedUsername.toLowerCase() ||
      trimmedUser.toLowerCase() === savedEmail.toLowerCase();

    if (!isUserValid) {
      setError('Tên đăng nhập hoặc Email này không tồn tại trong hệ thống.');
      return;
    }

    // 2. Kiểm tra mật khẩu hiện tại
    const currentValidPass =
      trimmedUser.toLowerCase() === 'admin' && !localStorage.getItem('user_password')
        ? '123'
        : savedPassword;
    if (changePasswordData.currentPassword !== currentValidPass) {
      setError('Mật khẩu hiện tại không chính xác.');
      return;
    }

    // 3. Kiểm tra độ dài mật khẩu mới
    if (changePasswordData.newPassword.length < 3) {
      setError('Mật khẩu mới phải chứa ít nhất 3 ký tự.');
      return;
    }

    // 4. Kiểm tra mật khẩu mới khác mật khẩu cũ
    if (changePasswordData.newPassword === changePasswordData.currentPassword) {
      setError('Mật khẩu mới không được trùng mật khẩu cũ.');
      return;
    }

    // 5. Kiểm tra xác nhận mật khẩu mới
    if (changePasswordData.newPassword !== changePasswordData.confirmNewPassword) {
      setError('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('user_password', changePasswordData.newPassword);
      setSuccessMsg('Đổi mật khẩu thành công! Hãy đăng nhập lại bằng mật khẩu mới.');
      setView('login');
      setPassword('');
      setChangePasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }, 600);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="glass-panel flex w-full max-w-5xl overflow-hidden rounded-[38px] border border-white/80 shadow-[0_30px_80px_rgba(79,110,247,0.16)] bg-white/85">
        {/* Cột Trái: Banner phong cách qlpl-demo */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-700 md:flex p-10 text-white">
          {/* Decorative background elements */}
          <div className="pointer-events-none absolute -right-10 top-8 h-40 w-40 rounded-full border border-white/20"></div>
          <div className="pointer-events-none absolute right-24 top-28 h-3 w-3 rounded-full bg-white/40"></div>
          <div className="pointer-events-none absolute left-14 top-1/2 h-2 w-2 rounded-full bg-white/40"></div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12),transparent_40%)]"></div>

          {/* Logo & Brand Header */}
          <div className="relative z-10 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/10 text-sm font-bold text-white shadow-sm">
              ◎
            </span>
            <span className="text-sm font-semibold tracking-[0.22em] text-white/90">QLPL DEMO</span>
          </div>

          {/* Slogan & Info */}
          <div className="relative z-10 pb-16">
            <p className="mb-2 text-sm text-white/80 font-medium">Nice to see you again</p>
            <h1 className="mb-4 text-4xl font-extrabold uppercase leading-tight tracking-tight text-white">
              WELCOME BACK
            </h1>
            <div className="mb-4 h-1.5 w-14 rounded-full bg-white/80"></div>
            <p className="max-w-sm text-sm leading-6 text-white/80 font-normal">
              Hệ thống quản lý máy tính & phòng thực hành hiện đại, trực quan, hỗ trợ theo dõi trạng thái thiết bị và đăng ký mượn máy nhanh chóng.
            </p>
          </div>

          {/* Decorative curved SVG wave */}
          <svg className="absolute bottom-0 left-0 w-full text-white/10" viewBox="0 0 500 120" preserveAspectRatio="none">
            <path d="M0,40 C150,120 350,0 500,60 L500,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>

        {/* Cột Phải: Form Đăng nhập / Đổi Mật Khẩu */}
        <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 md:w-1/2">
          <div className="mx-auto w-full max-w-sm">
            {view === 'login' ? (
              <>
                {/* Header Tiêu đề Form */}
                <div className="mb-6">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">ACCOUNT</p>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">Đăng nhập</h2>
                  <p className="mt-1 text-sm text-slate-500">Nhập thông tin bên dưới để tiếp tục.</p>
                </div>

                {/* Gợi ý tài khoản nhanh */}
                <div className="mb-5 flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/80 px-3.5 py-2.5 text-xs text-blue-700 shadow-xs">
                  <span>
                    Tài khoản mẫu: <b>admin</b>
                  </span>
                  <span>
                    Mật khẩu: <b>123</b>
                  </span>
                </div>

                {/* Thông báo lỗi / thành công */}
                {error && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-xs text-green-600">
                    {successMsg}
                  </div>
                )}

                {/* Form Đăng nhập */}
                <form onSubmit={handleSubmitLogin} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="admin hoặc email của bạn"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner shadow-slate-100 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Mật khẩu
                      </label>
                      <button
                        type="button"
                        onClick={() => setView('change-password')}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                      >
                        Đổi mật khẩu?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPass ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-3 pr-11 text-sm text-slate-700 shadow-inner shadow-slate-100 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showLoginPass ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Ghi nhớ đăng nhập */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Ghi nhớ đăng nhập</span>
                    </label>
                  </div>

                  {/* Nút Đăng nhập */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ios-button-primary w-full py-3 px-4 text-sm font-semibold uppercase tracking-wider disabled:opacity-50 mt-2"
                  >
                    {isLoading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* View Đổi Mật Khẩu */}
                <div className="mb-6">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">SECURITY</p>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Đổi Mật Khẩu</h2>
                  <p className="mt-1 text-sm text-slate-500">Cập nhật mật khẩu mới cho tài khoản của bạn.</p>
                </div>

                {error && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmitChangePassword} className="space-y-3.5">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Tên đăng nhập / Email
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-2.5 text-sm text-slate-700 shadow-inner outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={changePasswordData.currentPassword}
                        onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                        disabled={isLoading}
                        className="w-full rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-2.5 pr-11 text-sm text-slate-700 shadow-inner outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showCurrent ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={changePasswordData.newPassword}
                        onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                        disabled={isLoading}
                        className="w-full rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-2.5 pr-11 text-sm text-slate-700 shadow-inner outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showNew ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={changePasswordData.confirmNewPassword}
                        onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmNewPassword: e.target.value })}
                        disabled={isLoading}
                        className="w-full rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-2.5 pr-11 text-sm text-slate-700 shadow-inner outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showConfirm ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="ios-button-primary w-full py-2.5 px-4 text-sm font-semibold uppercase tracking-wider disabled:opacity-50"
                    >
                      {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="ios-button-secondary w-full py-2.5 px-4 text-sm font-semibold text-slate-700"
                    >
                      Quay lại đăng nhập
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Chuyển hướng sang đăng ký */}
            <div className="mt-8 border-t border-slate-200/70 pt-4 text-center text-xs text-slate-600">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}