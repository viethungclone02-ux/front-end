'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // 1. Kiểm tra Validate dữ liệu đầu vào
    if (name.trim().length < 2) {
      setError('Họ và tên phải có ít nhất 2 ký tự.');
      return;
    }

    if (phone.trim().length < 9) {
      setError('Số điện thoại không hợp lệ (tối thiểu 9 số).');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Địa chỉ email không hợp lệ. Vui lòng nhập đúng định dạng.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();

      // 2. Đăng ký tài khoản Auth trên Supabase kèm user metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: {
            full_name: trimmedName,
            phone: trimmedPhone,
          },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('already registered')) {
          setError('Email này đã được đăng ký tài khoản. Vui lòng sử dụng email khác hoặc Đăng nhập.');
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      // 3. Lưu thông tin Họ tên và Số điện thoại vào bảng profiles trên Supabase
      if (authData.user) {
        try {
          const { error: profileError } = await supabase.from('profiles').upsert([
            {
              id: authData.user.id,
              full_name: trimmedName,
              phone: trimmedPhone,
            },
          ]);

          if (profileError) {
            console.warn('Lỗi ghi bảng profiles:', profileError.message);
          }
        } catch (profileErr) {
          console.warn('Exception ghi profiles:', profileErr);
        }
      }

      // 4. Lưu dự phòng vào localStorage
      localStorage.setItem(
        'student_profile',
        JSON.stringify({
          fullName: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          studentId: 'SV-' + Math.floor(100000 + Math.random() * 900000),
          role: 'Sinh viên',
        })
      );
      localStorage.setItem('user_email', trimmedEmail);
      localStorage.setItem('currentUser', trimmedName);

      setIsLoading(false);
      setSuccess(true);

      // Chuyển hướng sang trang đăng nhập sau 1.2 giây
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setError('Đã xảy ra lỗi không xác định. Vui lòng kiểm tra lại kết nối mạng.');
      setIsLoading(false);
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

        <div className="text-center mb-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-blue-600">SMART ROOM</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Đăng ký tài khoản</h2>
          <p className="mt-1 text-xs text-slate-500">Điền thông tin bên dưới để khởi tạo tài khoản mới.</p>
        </div>

        {/* Thông báo */}
        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600 flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2">
            <span>✅</span>
            <span>Đăng ký thành công! Đang chuyển hướng về Đăng nhập...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nguyễn Văn An"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading || success}
              className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Số điện thoại <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="Ví dụ: 0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading || success}
              className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Email đăng ký <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || success}
              className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || success}
              className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Xác nhận mật khẩu <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || success}
              className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            className="ios-button-primary w-full py-3.5 px-4 text-sm font-bold uppercase tracking-wider disabled:opacity-50 mt-3 shadow-md"
          >
            {isLoading ? 'Đang tạo tài khoản Supabase...' : 'ĐĂNG KÝ TÀI KHOẢN'}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200/70 pt-4 text-center text-xs font-medium text-slate-600">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </main>
  );
}