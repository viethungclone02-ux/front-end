'use client';

import Link from 'next/link';
import AppLayout from '../components/AppLayout';

interface InfoCardProps {
  title: string;
  items: string[];
  color: string;
  icon: string;
}

function InfoCard({ title, items, color, icon }: InfoCardProps) {
  return (
    <div
      className="glass-panel rounded-[28px] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md duration-200"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <span className="text-xl">{icon}</span>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>
      <ul className="space-y-2 text-xs text-slate-600 leading-relaxed list-disc list-inside">
        {items.map((item, index) => (
          <li key={index} className="pl-1">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function About() {
  const soThich = [
    'Lập trình Web hiện đại (Next.js, React, Node.js, TailwindCSS)',
    'Nghiên cứu kiến trúc hệ thống và trải nghiệm người dùng (UX/UI)',
    'Chơi game Đấu Trường Chân Lý (TFT) và giải trí cùng bạn bè',
    'Tìm hiểu các công nghệ AI và trợ lý phát triển phần mềm',
  ];

  const mucTieu = [
    'Xây dựng hệ thống Quản lý phòng máy tính & thiết bị lab hoàn thiện',
    'Nâng cao kỹ năng Fullstack Web Developer với TypeScript & React',
    'Tạo ra các sản phẩm công nghệ có tính ứng dụng thực tiễn cao',
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">About Me</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Giới Thiệu Bản Thân</h1>
          <p className="mt-1 text-sm text-slate-600">
            Chào mừng bạn đến với trang giới thiệu cá nhân và định hướng phát triển
          </p>
        </div>

        {/* Hero Card */}
        <div className="glass-panel rounded-[28px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-black text-4xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 ring-4 ring-white/90">
            H
          </div>
          <div className="text-center md:text-left space-y-2">
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
              Sinh viên Công nghệ Thông tin
            </div>
            <h2 className="text-xl font-bold text-slate-900">Nguyễn Viết Hùng</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              Đam mê lập trình giao diện hiện đại, tối ưu hóa trải nghiệm người dùng và xây dựng các hệ sinh thái phần mềm quản lý trực quan, tiện lợi.
            </p>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <InfoCard
            title="Sở thích & Đam mê"
            items={soThich}
            color="#3b82f6"
            icon="🎯"
          />
          <InfoCard
            title="Mục tiêu phát triển"
            items={mucTieu}
            color="#10b981"
            icon="🚀"
          />
        </div>

        {/* Action Link */}
        <div className="text-center pt-4">
          <Link
            href="/computers"
            className="ios-button-primary inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider"
          >
            <span>← Quay lại Quản lý máy tính</span>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}