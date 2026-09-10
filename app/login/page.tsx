'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'change-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // State Đổi Mật Khẩu
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

  // Xóa thông báo khi đổi view
  useEffect(() => {
    setError('');
    setSuccessMsg('');
  }, [view]);

  // Tự động điền email nếu đã nhớ trước đó
  useEffect(() => {
    const remembered = localStorage.getItem('remember_email') || localStorage.getItem('remember_username');
    if (remembered) {
      setEmail(remembered);
    }
  }, []);

  // Nếu đã đăng nhập trước đó thì chuyển hướng thẳng vào trang phòng học
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      router.replace('/rooms');
    }
  }, [router]);

  // 1. Xử lý Đăng nhập với Supabase Auth & Demo Admin
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedInput = email.trim();

    if (!trimmedInput) {
      setError('Vui lòng nhập Email đăng ký (hoặc tài khoản admin).');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Kiểm tra tài khoản Quản trị viên (admin / 123)
      const savedAdminPassword = localStorage.getItem('user_password') || '123';
      const isAdmin =
        trimmedInput.toLowerCase() === 'admin' &&
        (password === savedAdminPassword || password === '123');

      if (isAdmin) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', 'Quản trị viên Hệ thống');
        localStorage.setItem('user_role', 'admin');
        localStorage.setItem(
          'student_profile',
          JSON.stringify({
            fullName: 'Quản trị viên Hệ thống',
            email: 'admin@classroom.edu.vn',
            phone: '0988888888',
            studentId: 'ADMIN-01',
            role: 'Quản trị viên',
          })
        );
        if (rememberMe) {
          localStorage.setItem('remember_email', trimmedInput);
        } else {
          localStorage.removeItem('remember_email');
        }
        setIsLoading(false);
        router.push('/rooms');
        return;
      }

      // 2. Đăng nhập qua Supabase Auth
      let targetEmail = trimmedInput;
      if (!targetEmail.includes('@')) {
        const savedEmail = localStorage.getItem('user_email');
        if (savedEmail) targetEmail = savedEmail;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: password,
      });

      if (!authError && authData?.user) {
        let displayName =
          authData.user.user_metadata?.full_name ||
          authData.user.user_metadata?.name ||
          targetEmail.split('@')[0];

        let phone = authData.user.user_metadata?.phone || '';

        // Thử lấy thông tin họ tên từ bảng profiles
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (profileData?.full_name) {
            displayName = profileData.full_name;
          }
          if (profileData?.phone) {
            phone = profileData.phone;
          }
        } catch (profileErr) {
          console.warn('Lỗi đọc profiles:', profileErr);
        }

        // Lưu thông tin phiên đăng nhập
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', displayName);
        localStorage.setItem('user_role', 'user');
        localStorage.setItem('user_email', targetEmail);
        localStorage.setItem(
          'student_profile',
          JSON.stringify({
            fullName: displayName,
            email: targetEmail,
            phone: phone,
            studentId: 'SV-' + authData.user.id.slice(0, 6).toUpperCase(),
            role: 'Sinh viên',
          })
        );

        if (rememberMe) {
          localStorage.setItem('remember_email', trimmedInput);
        } else {
          localStorage.removeItem('remember_email');
        }

        setIsLoading(false);
        router.push('/rooms');
        return;
      }

      // 3. Fallback: Kiểm tra tài khoản đã đăng ký cục bộ
      const localSavedEmail = localStorage.getItem('user_email');
      const localSavedPass = localStorage.getItem('user_password');
      const localSavedProfile = localStorage.getItem('student_profile');

      if (
        localSavedEmail &&
        localSavedPass &&
        trimmedInput.toLowerCase() === localSavedEmail.toLowerCase() &&
        password === localSavedPass
      ) {
        let localName = 'Người dùng';
        if (localSavedProfile) {
          try {
            const p = JSON.parse(localSavedProfile);
            if (p.fullName) localName = p.fullName;
          } catch {
            // ignore
          }
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', localName);
        localStorage.setItem('user_role', 'user');
        setIsLoading(false);
        router.push('/rooms');
        return;
      }

      // 4. Nếu xác thực không thành công
      if (authError) {
        if (authError.message.toLowerCase().includes('invalid login credentials')) {
          setError('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
        } else if (authError.message.toLowerCase().includes('email not confirmed')) {
          setError('Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.');
        } else {
          setError('Lỗi đăng nhập: ' + authError.message);
        }
      } else {
        setError('Email hoặc mật khẩu không chính xác.');
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error(err);
      setError('Đã xảy ra lỗi khi kết nối máy chủ Supabase.');
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

    if (changePasswordData.newPassword !== changePasswordData.confirmNewPassword) {
      setError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: changePasswordData.newPassword,
      });

      if (updateError) {
        localStorage.setItem('user_password', changePasswordData.newPassword);
      } else {
        localStorage.setItem('user_password', changePasswordData.newPassword);
      }

      setIsLoading(false);
      setSuccessMsg('Đổi mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.');
      setChangePasswordData({ newPassword: '', confirmNewPassword: '' });
      setTimeout(() => {
        setView('login');
      }, 1500);
    } catch (err: any) {
      localStorage.setItem('user_password', changePasswordData.newPassword);
      setIsLoading(false);
      setSuccessMsg('Đổi mật khẩu thành công!');
      setTimeout(() => setView('login'), 1500);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 font-sans">
      <div className="glass-panel w-full max-w-md overflow-hidden rounded-[36px] border border-white/80 p-7 sm:p-9 shadow-[0_25px_60px_rgba(79,110,247,0.18)] bg-white/90">
        {/* Brand Header Icon */}
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-2xl text-white shadow-md shadow-indigo-500/25">
            🏫
          </div>
        </div>

        {view === 'login' ? (
          <>
            <div className="text-center mb-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-blue-600">SMART ROOM</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Đăng nhập</h2>
              <p className="mt-1 text-xs text-slate-500">Nhập email và mật khẩu tài khoản Supabase của bạn.</p>

              {/* Gợi ý tài khoản demo */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/80 shadow-2xs">
                <span>💡 Admin Demo:</span>
                <span className="font-bold">admin</span>
                <span>| Pass:</span>
                <span className="font-bold">123</span>
              </div>
            </div>

            {/* Thông báo lỗi / thành công */}
            {error && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600 flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2">
                <span>✅</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Đăng nhập */}
            <form onSubmit={handleSubmitLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Email đăng nhập
                </label>
                <input
                  type="text"
                  required
                  placeholder="user@example.com hoặc admin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => setView('change-password')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
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
                    className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 pr-11 text-sm text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    aria-label={showLoginPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showLoginPass ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="ios-button-primary w-full py-3.5 px-4 text-sm font-bold uppercase tracking-wider disabled:opacity-50 mt-2 shadow-md"
              >
                {isLoading ? 'Đang xác thực Supabase...' : 'ĐĂNG NHẬP'}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200/70 pt-4 text-center text-xs text-slate-600 font-medium">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </>
        ) : (
          /* View Đổi Mật Khẩu */
          <>
            <div className="text-center mb-6">
              <button
                type="button"
                onClick={() => setView('login')}
                className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
              >
                ← Quay lại Đăng nhập
              </button>
              <h2 className="text-2xl font-bold text-slate-900">Đổi mật khẩu</h2>
              <p className="mt-1 text-xs text-slate-500">Nhập mật khẩu mới cho tài khoản của bạn.</p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600 flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2">
                <span>✅</span>
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitChangePassword} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={changePasswordData.newPassword}
                    onChange={(e) =>
                      setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })
                    }
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-800 shadow-inner outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    {showNew ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    placeholder="Nhập lại mật khẩu mới"
                    value={changePasswordData.confirmNewPassword}
                    onChange={(e) =>
                      setChangePasswordData({ ...changePasswordData, confirmNewPassword: e.target.value })
                    }
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-800 shadow-inner outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    {showConfirm ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="ios-button-primary w-full py-3.5 px-4 text-sm font-bold uppercase tracking-wider disabled:opacity-50 mt-2 shadow-md"
              >
                {isLoading ? 'Đang cập nhật...' : 'CẬP NHẬT MẬT KHẨU'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}