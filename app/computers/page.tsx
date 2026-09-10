'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ComputersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/rooms');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center font-sans">
      <div className="glass-panel max-w-md rounded-[28px] p-8 space-y-4">
        <div className="text-3xl">🏫</div>
        <h2 className="text-lg font-bold text-slate-800">
          Đang chuyển hướng sang Hệ thống Quản lý & Đặt Phòng Học...
        </h2>
        <p className="text-xs text-slate-500">
          Hệ thống đã được nâng cấp thành Hệ thống Đặt Phòng Học & Hội Trường thông minh.
        </p>
        <Link
          href="/rooms"
          className="ios-button-primary inline-block px-5 py-2 text-xs font-semibold uppercase"
        >
          Nhấn vào đây nếu không tự chuyển hướng
        </Link>
      </div>
    </div>
  );
}
