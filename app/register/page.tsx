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

    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);

    // Lưu tài khoản đăng ký vào localStorage để đăng nhập & đổi mật khẩu thực tế
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_password', password);

    // Giả lập gửi API đăng ký tài khoản
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      alert('Đăng ký tài khoản thành công! Nhấn OK để chuyển về trang đăng nhập.');
      router.push('/login');
    }, 1500);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-gray-800">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">
        {/* Tiêu đề */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Đăng Ký Tài Khoản</h2>
          <p className="text-sm text-gray-500">Tạo tài khoản học tập của bạn</p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Thông báo thành công */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
            Đăng ký tài khoản thành công! Đang chuyển hướng về trang đăng nhập...
          </div>
        )}

        {/* Form đăng ký */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nhập Họ và Tên */}
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
              Họ và tên:
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading || success}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
            />
          </div>

          {/* Nhập Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email:
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="nhap-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || success}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
            />
          </div>

          {/* Nhập Mật khẩu */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Mật khẩu:
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || success}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
            />
          </div>

          {/* Xác nhận Mật khẩu */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
              Xác nhận mật khẩu:
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || success}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
            />
          </div>

          {/* Nút đăng ký */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition duration-150 disabled:opacity-50"
          >
            {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        {/* Link chuyển sang đăng nhập */}
        <div className="text-center text-sm text-gray-600 pt-2">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </main>
  );
}
