'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from './login/page';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Nếu đã đăng nhập trước đó thì chuyển hướng thẳng vào hệ thống quản lý & đặt phòng học
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      router.replace('/rooms');
    }
  }, [router]);

  // Mặc định khi chưa đăng nhập thì hiển thị form đăng nhập
  return <Login />;
}