'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '../components/AppLayout';

export interface BookingRequest {
  id: string;
  roomId: string;
  roomName: string;
  building: string;
  userName: string;
  userEmail: string;
  bookingDate: string;
  timeSlot: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    const savedBookings = localStorage.getItem('room_bookings');
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch {
        setBookings([]);
      }
    }
  }, []);

  // Thống kê phòng theo số lượt đặt
  const roomFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => {
      counts[b.roomName] = (counts[b.roomName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([roomName, count]) => ({ roomName, count }))
      .sort((a, b) => b.count - a.count);
  }, [bookings]);

  // Thống kê ca/khung giờ cao điểm
  const timeSlotStats = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => {
      counts[b.timeSlot] = (counts[b.timeSlot] || 0) + 1;
    });
    return Object.entries(counts).map(([slot, count]) => ({ slot, count }));
  }, [bookings]);

  // Thống kê mục đích sử dụng
  const purposeStats = useMemo(() => {
    let hocNhom = 0;
    let baoCao = 0;
    let clb = 0;
    let khac = 0;

    bookings.forEach((b) => {
      const p = b.purpose.toLowerCase();
      if (p.includes('báo cáo') || p.includes('đồ án') || p.includes('thi')) baoCao++;
      else if (p.includes('nhóm') || p.includes('học')) hocNhom++;
      else if (p.includes('clb') || p.includes('sinh hoạt') || p.includes('hội thảo')) clb++;
      else khac++;
    });

    const total = bookings.length || 1;
    return [
      { name: 'Báo cáo đồ án / Thi', count: baoCao, percent: Math.round((baoCao / total) * 100) },
      { name: 'Học nhóm / Ôn luyện', count: hocNhom, percent: Math.round((hocNhom / total) * 100) },
      { name: 'Sinh hoạt CLB / Hội thảo', count: clb, percent: Math.round((clb / total) * 100) },
      { name: 'Mục đích khác', count: khac, percent: Math.round((khac / total) * 100) },
    ];
  }, [bookings]);

  // Xuất file CSV / Excel
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert('Chưa có dữ liệu đặt phòng để xuất file!');
      return;
    }

    const headers = ['Mã Đơn', 'Tên Phòng', 'Khu Vực', 'Người Đặt', 'Email', 'Ngày Sử Dụng', 'Khung Giờ', 'Mục Đích', 'Trạng Thái', 'Thời Gian Gửi'];
    const rows = bookings.map((b) => [
      b.id,
      `"${b.roomName}"`,
      `"${b.building}"`,
      `"${b.userName}"`,
      `"${b.userEmail || ''}"`,
      b.bookingDate,
      `"${b.timeSlot}"`,
      `"${b.purpose.replace(/"/g, '""')}"`,
      b.status === 'approved' ? 'Đã duyệt' : b.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt',
      b.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_Cao_Dat_Phong_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Hero */}
        <section className="glass-panel rounded-[28px] p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-800 uppercase tracking-wider">
                  Admin Analytics
                </span>
                <span className="text-xs text-slate-500">Báo cáo & Thống kê tần suất</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Dashboard Thống Kê Đặt Phòng
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Theo dõi hiệu suất sử dụng phòng học, tần suất các ca cao điểm và xuất file dữ liệu phục vụ quản lý.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="ios-button-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md shrink-0 cursor-pointer"
            >
              <span>📥 Xuất File Excel / CSV</span>
            </button>
          </div>
        </section>

        {/* Biểu đồ Thống kê 2 cột */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 1. Biểu đồ Tần suất sử dụng phòng */}
          <section className="glass-panel rounded-[28px] p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>📊</span> Tần suất sử dụng theo Phòng học
            </h2>
            <div className="space-y-3 pt-2">
              {roomFrequency.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Chưa có dữ liệu đặt phòng</p>
              ) : (
                roomFrequency.map((rf, idx) => {
                  const maxCount = roomFrequency[0].count || 1;
                  const percent = Math.round((rf.count / maxCount) * 100);
                  return (
                    <div key={rf.roomName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>{idx + 1}. {rf.roomName}</span>
                        <span className="text-blue-600">{rf.count} lượt</span>
                      </div>
                      <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 2. Tỷ lệ Mục đích sử dụng */}
          <section className="glass-panel rounded-[28px] p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🎯</span> Tỷ lệ Mục đích Đặt phòng
            </h2>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {purposeStats.map((ps) => (
                <div key={ps.name} className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-xs space-y-2">
                  <p className="text-xs font-bold text-slate-600 truncate">{ps.name}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-indigo-950">{ps.percent}%</span>
                    <span className="text-xs font-semibold text-slate-400">({ps.count} đơn)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${ps.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Khung giờ cao điểm & Tổng hợp */}
        <section className="glass-panel rounded-[28px] p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>⏰</span> Khung giờ cao điểm trong ngày
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {timeSlotStats.map((ts) => (
              <div key={ts.slot} className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-600">{ts.slot}</span>
                  <p className="text-2xl font-extrabold text-blue-900 mt-1">{ts.count} lượt đặt</p>
                </div>
                <span className="text-3xl">⏱️</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
