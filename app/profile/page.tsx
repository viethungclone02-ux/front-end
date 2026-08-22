'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: 'Nguyễn Viết Hùng',
    mssv: '425000134',
    classId: '25CT401',
    email: 'hung@gmail.com',
    phone: '0901234567',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('student_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Lỗi khi đọc thông tin từ localStorage', e);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    // Lưu vào localStorage để đồng bộ với trang chủ
    localStorage.setItem('student_profile', JSON.stringify(profile));

    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      alert('Cập nhật thông tin thành công!');
    }, 1000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-gray-800">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">
        {/* Tiêu đề */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Thông Tin Cá Nhân</h2>
          <p className="text-sm text-gray-500">Cập nhật thông tin tài khoản sinh viên của bạn</p>
        </div>

        {/* Thông báo thành công */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
            Cập nhật thông tin thành công!
          </div>
        )}

        {/* Form cập nhật thông tin */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ và tên */}
          <div className="space-y-1">
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
              Họ và tên:
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
            />
          </div>

          {/* Mã số sinh viên */}
          <div className="space-y-1">
            <label htmlFor="mssv" className="block text-sm font-semibold text-gray-700">
              Mã số sinh viên (MSSV):
            </label>
            <input
              id="mssv"
              type="text"
              required
              value={profile.mssv}
              onChange={(e) => setProfile({ ...profile, mssv: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
            />
          </div>

          {/* Lớp */}
          <div className="space-y-1">
            <label htmlFor="classId" className="block text-sm font-semibold text-gray-700">
              Lớp học:
            </label>
            <input
              id="classId"
              type="text"
              required
              value={profile.classId}
              onChange={(e) => setProfile({ ...profile, classId: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email:
            </label>
            <input
              id="email"
              type="email"
              required
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
            />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
              Số điện thoại:
            </label>
            <input
              id="phone"
              type="text"
              required
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition duration-150"
            />
          </div>

          {/* Nút lưu thay đổi */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition duration-150 disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu thay đổi...' : 'Lưu thay đổi'}
          </button>
        </form>

        {/* Link chuyển hướng quay về trang chủ */}
        <div className="text-center text-sm text-gray-600 pt-2 flex justify-between items-center border-t border-gray-150 pt-4">
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            Trang chủ
          </Link>
          <Link href="/login" className="text-red-500 hover:underline font-medium">
            Đăng xuất
          </Link>
        </div>
      </div>
    </main>
  );
}