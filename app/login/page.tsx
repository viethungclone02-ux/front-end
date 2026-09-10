'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'change-password'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // State cho Đổi Mật Khẩu
  const [changePasswordData, setChangePasswordData] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });
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

  // Tự động điền email nếu đã chọn nhớ đăng nhập trước đó
  useEffect(() => {
    const remembered = localStorage.getItem('remember_username');
    if (remembered) {
      setUsername(remembered);
    }
  }, []);

  // Nếu đã đăng nhập thì tự động chuyển vào trang chủ quản lý máy tính
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      router.replace('/computers');
    }
  }, [router]);

  // 1. Xử lý Đăng nhập với Supabase / Tài khoản Admin / Tài khoản hệ thống
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUser = username.trim();

    if (!trimmedUser) {
      setError('Vui lòng nhập Email hoặc tên đăng nhập.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Kiểm tra tài khoản Quản trị viên (admin / 123 hoặc mật khẩu lưu trong localStorage)
      const savedAdminPassword = localStorage.getItem('user_password') || '123';
      const isAdminLogin =
        trimmedUser.toLowerCase() === 'admin' &&
        (password === savedAdminPassword || password === '123');

      if (isAdminLogin) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', 'admin');
        if (rememberMe) {
          localStorage.setItem('remember_username', trimmedUser);
        } else {
          localStorage.removeItem('remember_username');
        }
        setIsLoading(false);
        router.push('/computers');
        return;
      }

      // 2. Thử xác thực với Supabase (nếu người dùng nhập email)
      let supabaseSuccess = false;
      let displayName = trimmedUser.includes('@') ? trimmedUser.split('@')[0] : trimmedUser;

      if (trimmedUser.includes('@')) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: trimmedUser,
          password: password,
        });

        if (!authError && data?.user) {
          supabaseSuccess = true;
          // Lấy thông tin profile từ bảng profiles nếu có
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, phone')
              .eq('id', data.user.id)
              .maybeSingle();

            if (profileData?.full_name) {
              displayName = profileData.full_name;
              const currentProfile = localStorage.getItem('student_profile');
              const parsed = currentProfile ? JSON.parse(currentProfile) : {};
              localStorage.setItem(
                'student_profile',
                JSON.stringify({
                  ...parsed,
                  fullName: profileData.full_name,
                  email: trimmedUser,
                  phone: profileData.phone || parsed.phone || '',
                })
              );
            }
          } catch (profileErr) {
            console.error('Lỗi lấy profile:', profileErr);
          }
        }
      }

      // Nếu Supabase đăng nhập thành công
      if (supabaseSuccess) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', displayName);
        if (rememberMe) {
          localStorage.setItem('remember_username', trimmedUser);
        } else {
          localStorage.removeItem('remember_username');
        }
        setIsLoading(false);
        router.push('/computers');
        return;
      }

      // 3. Kiểm tra tài khoản dự phòng đã đăng ký cục bộ
      const savedEmail = localStorage.getItem('user_email');
      const savedUsername = localStorage.getItem('user_username');
      const savedPassword = localStorage.getItem('user_password');

      const isSavedUser =
        ((savedUsername && trimmedUser.toLowerCase() === savedUsername.toLowerCase()) ||
          (savedEmail && trimmedUser.toLowerCase() === savedEmail.toLowerCase())) &&
        savedPassword &&
        password === savedPassword;

      if (isSavedUser) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', savedUsername || displayName);
        if (rememberMe) {
          localStorage.setItem('remember_username', trimmedUser);
        } else {
          localStorage.removeItem('remember_username');
        }
        setIsLoading(false);
        router.push('/computers');
        return;
      }

      // 4. Nếu không khớp tài khoản nào
      setError('Tên đăng nhập / Email hoặc mật khẩu không chính xác. (Tài khoản admin: admin / 123)');
      setIsLoading(false);
    } catch (err: any) {
      console.error(err);
      setError('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  // 2. Xử lý Cập nhật mật khẩu mới
  const handleSubmitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (changePasswordData.newPassword.length < 6) {
      setError('Mật khẩu mới phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (!/[A-Z]/.test(changePasswordData.newPassword)) {
      setError('Mật khẩu mới phải chứa ít nhất 1 chữ cái viết hoa (A-Z).');
      return;
    }

    if (!/[0-9]/.test(changePasswordData.newPassword)) {
      setError('Mật khẩu mới phải chứa ít nhất 1 chữ số (0-9).');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(changePasswordData.newPassword)) {
      setError('Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt (ví dụ: !@#$%^&*).');
      return;
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmNewPassword) {
      setError('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Nếu là admin, cập nhật mật khẩu admin trong localStorage
      if (username.trim().toLowerCase() === 'admin') {
        localStorage.setItem('user_password', changePasswordData.newPassword);
        setIsLoading(false);
        setSuccessMsg('Đổi mật khẩu admin thành công! Bạn có thể sử dụng mật khẩu mới ngay.');
        setView('login');
        setPassword('');
        setChangePasswordData({
          newPassword: '',
          confirmNewPassword: '',
        });
        return;
      }

      // 2. Cập nhật mật khẩu với Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: changePasswordData.newPassword,
      });

      if (updateError) {
        // Cập nhật fallback vào localStorage
        localStorage.setItem('user_password', changePasswordData.newPassword);
        setIsLoading(false);
        setSuccessMsg('Đã cập nhật mật khẩu! Bạn có thể đăng nhập bằng mật khẩu mới.');
        setView('login');
        setPassword('');
        setChangePasswordData({
          newPassword: '',
          confirmNewPassword: '',
        });
        return;
      }

      setIsLoading(false);
      setSuccessMsg('Đổi mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới ngay.');
      setView('login');
      setPassword('');
      setChangePasswordData({
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err: any) {
      setError('Đã xảy ra lỗi trong quá trình đổi mật khẩu.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="glass-panel flex w-full max-w-5xl overflow-hidden rounded-[38px] border border-white/80 shadow-[0_30px_80px_rgba(79,110,247,0.16)] bg-white/85">
        {/* Cột Trái: Banner phong cách qlpl-demo */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-700 md:flex p-10 text-white">
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
                  <p className="mt-1 text-sm text-slate-500">Nhập email hoặc tài khoản để vào hệ thống.</p>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200/80 shadow-xs">
                    <span>💡 Admin:</span>
                    <span className="font-bold">admin</span>
                    <span>| Mật khẩu:</span>
                    <span className="font-bold">123</span>
                  </div>
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
                      Email hoặc Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="admin hoặc email của bạn"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                        className="w-full rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-3 pr-11 text-sm text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                    className="ios-button-primary w-full py-3 px-4 text-sm font-semibold uppercase tracking-wider disabled:opacity-50 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition shadow-md"
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
                  <p className="mt-1 text-sm text-slate-500">Cập nhật mật khẩu mới cho tài khoản hiện tại.</p>
                </div>

                {error && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmitChangePassword} className="space-y-3.5">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Email hoặc Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="admin hoặc email của bạn"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-2.5 text-sm text-slate-700 shadow-inner outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
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
                      className="ios-button-primary w-full py-2.5 px-4 text-sm font-semibold uppercase tracking-wider disabled:opacity-50 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition shadow-md"
                    >
                      {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="ios-button-secondary w-full py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition"
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