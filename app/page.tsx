'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [profile, setProfile] = useState({
    fullName: 'Nguyễn Viết Hùng',
    mssv: '425000134',
    classId: '25CT401',
    email: 'hung@gmail.com',
    phone: '0901234567',
  });

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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans text-gray-800">
      {/* Container */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">

        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider gap-2">
          <span className="text-blue-600">Trang chủ</span>
          <Link href="/profile" className="hover:text-blue-600 transition">Hồ sơ</Link>
          <Link href="/login" className="hover:text-blue-600 transition">Đăng nhập</Link>
          <Link href="/register" className="hover:text-blue-600 transition">Đăng ký</Link>
        </div>

        {/* Tiêu đề */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Thông Tin Sinh Viên</h1>
        </div>

        {/* Nội dung thông tin */}
        <div className="bg-gray-50 border border-gray-150 rounded-lg p-5 space-y-4 shadow-inner">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-sm font-semibold text-gray-600">Họ và tên:</span>
            <span className="text-sm font-bold text-gray-900">{profile.fullName}</span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-sm font-semibold text-gray-600">MSSV:</span>
            <span className="text-sm font-bold text-gray-900">{profile.mssv}</span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-sm font-semibold text-gray-600">Lớp:</span>
            <span className="text-sm font-bold text-gray-900">{profile.classId}</span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-sm font-semibold text-gray-600">Email:</span>
            <span className="text-sm text-gray-800">{profile.email}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-semibold text-gray-600">Số điện thoại:</span>
            <span className="text-sm text-gray-800">{profile.phone}</span>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="pt-2 space-y-2">
          <Link
            href="/profile"
            className="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition duration-150"
          >
            Cập nhật thông tin
          </Link>
        </div>
      </div>
    </main>
  );
}