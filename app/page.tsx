'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from './login/page';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Nếu đã đăng nhập trước đó thì chuyển hướng thẳng vào trang cá nhân
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      router.replace('/profile');
    }
  }, [router]);

  // Mặc định khi vào trang local thì hiển thị form đăng nhập
  return <Login />;
}