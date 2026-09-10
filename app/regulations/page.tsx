'use client';

import Link from 'next/link';
import AppLayout from '../components/AppLayout';

interface RegulationCardProps {
  icon: string;
  title: string;
  badge: string;
  rules: string[];
  color: string;
}

function RegulationCard({ icon, title, badge, rules, color }: RegulationCardProps) {
  return (
    <div
      className="glass-panel rounded-[28px] p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md duration-200"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          {badge}
        </span>
      </div>

      <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
        {rules.map((rule, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="font-bold shrink-0 text-slate-400">•</span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RegulationsPage() {
  const roomRules = [
    'Sinh viên, giảng viên gửi yêu cầu đặt phòng trước tối thiểu 24 giờ để Ban Quản lý sắp xếp lịch và kỹ thuật viên.',
    'Chỉ sử dụng phòng đúng mục đích đã đăng ký (Báo cáo đồ án, hội thảo, sinh hoạt học thuật, không kinh doanh trái phép).',
    'Sử dụng đúng khung giờ được phê duyệt; nếu có nhu cầu gia hạn thêm thời gian cần liên hệ Ban Quản lý trước 30 phút.',
    'Nếu không còn nhu cầu sử dụng, vui lòng chủ động nhấn nút "Hủy yêu cầu" trong hệ thống để nhường phòng cho người khác.',
  ];

  const deviceRules = [
    'Kiểm tra tình trạng thiết bị (Máy chiếu, Micro, Điều hòa, Dàn âm thanh) khi nhận phòng và ký sổ bàn giao.',
    'Không tự ý can thiệp, ngắt dây nối cáp HDMI/VGA hoặc thay đổi cấu hình kỹ thuật của hệ thống âm thanh.',
    'Sử dụng Micro cẩn thận, tránh va đập mạnh và bảo quản Pin Micro; trả lại bục kỹ thuật sau khi hoàn tất.',
    'Nếu thiết bị phát sinh lỗi chập chờn, báo ngay cho kỹ thuật trực qua Hotline để được hỗ trợ kịp thời.',
  ];

  const safetyRules = [
    'Giữ gìn vệ sinh chung, nghiêm cấm mang thức ăn có mùi, kẹo cao su hoặc nước ngọt không nắp đậy vào phòng.',
    'Kê lại bàn ghế ngay ngắn, thu gom rác thải vào thùng rác trước khi rời khỏi phòng học.',
    'Tắt toàn bộ hệ thống đèn chiếu sáng, điều hòa không khí, máy chiếu và khóa cửa cẩn thận trước khi trả chìa khóa.',
    'Tuân thủ tuyệt đối các quy định về an toàn điện và phòng cháy chữa cháy (PCCC) trong khuôn viên trường.',
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <section className="glass-panel rounded-[28px] p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                  Regulations & Guidelines
                </span>
                <span className="text-xs text-slate-500">Quy chuẩn sử dụng phòng học & hội trường</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Hướng Dẫn & Quy Định Sử Dụng
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Tất cả cán bộ, giảng viên và sinh viên vui lòng nắm rõ các quy định mượn phòng học, bảo quản thiết bị và an toàn cơ sở vật chất.
              </p>
            </div>

            <Link
              href="/rooms"
              className="ios-button-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-md shrink-0"
            >
              <span>Đặt phòng ngay →</span>
            </Link>
          </div>
        </section>

        {/* 3 Thẻ Quy Định Chính */}
        <div className="grid gap-6 md:grid-cols-3">
          <RegulationCard
            icon="🏫"
            title="Quy định mượn phòng"
            badge="Bắt buộc"
            color="#3b82f6"
            rules={roomRules}
          />
          <RegulationCard
            icon="📽️"
            title="Bảo quản trang thiết bị"
            badge="Thiết bị"
            color="#10b981"
            rules={deviceRules}
          />
          <RegulationCard
            icon="🧹"
            title="Vệ sinh & An toàn"
            badge="Trật tự"
            color="#f59e0b"
            rules={safetyRules}
          />
        </div>

        {/* Thông tin hỗ trợ kỹ thuật */}
        <section className="glass-panel rounded-[28px] p-6 sm:p-8 space-y-5 border border-indigo-100 bg-gradient-to-br from-white/90 via-blue-50/30 to-indigo-50/20">
          <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-lg text-white shadow-md shadow-indigo-500/30">
              🛠️
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Thông Tin Hỗ Trợ Kỹ Thuật & Khẩn Cấp</h2>
              <p className="text-xs text-slate-500">Đội ngũ kỹ thuật viên trực phòng học luôn sẵn sàng hỗ trợ bạn</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Box 1 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ban Quản lý Giảng đường</span>
              <p className="text-sm font-bold text-slate-900">P.102 - Tòa Nhà A</p>
              <p className="text-xs text-blue-600 font-semibold">Hotline: 024.3838.8899</p>
              <p className="text-[11px] text-slate-500 pt-1">Tiếp nhận đăng ký, chìa khóa và duyệt đơn ngoài giờ.</p>
            </div>

            {/* Box 2 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Kỹ thuật Máy chiếu & Âm thanh</span>
              <p className="text-sm font-bold text-slate-900">Tổ Kỹ thuật P.201 Tòa A</p>
              <p className="text-xs text-emerald-600 font-semibold">Di động: 0987.654.321 (Ext: 104)</p>
              <p className="text-[11px] text-slate-500 pt-1">Hỗ trợ cáp HDMI, pin micro, kết nối máy chiếu, wifi.</p>
            </div>

            {/* Box 3 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Phản hồi & Đề xuất</span>
              <p className="text-sm font-bold text-slate-900">Phòng Đào tạo & CSVC</p>
              <p className="text-xs text-indigo-600 font-semibold">bql.phonghoc@university.edu.vn</p>
              <p className="text-[11px] text-slate-500 pt-1">Tiếp nhận đóng góp nâng cấp trang thiết bị phòng học.</p>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50/80 p-4 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-950">
            <div className="flex items-center gap-2">
              <span className="text-lg">⏰</span>
              <span>
                <strong>Khung giờ trực kỹ thuật:</strong> 06:45 - 21:15 (Từ Thứ 2 đến Thứ 7 hàng tuần)
              </span>
            </div>
            <Link
              href="/rooms"
              className="ios-button-primary px-4 py-2 text-xs font-semibold whitespace-nowrap"
            >
              Vào danh sách phòng học
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
