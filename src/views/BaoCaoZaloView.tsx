import React, { useState, useEffect } from 'react';
import { Share2, Copy, CheckCircle2, RotateCcw, MessageSquare, AlertCircle } from 'lucide-react';
import { AppState } from '../types';

interface BaoCaoZaloViewProps {
  appState: AppState;
  hocKy: 'HK1' | 'HK2' | 'CA_NAM';
  selectedWeek: number;
}

export const BaoCaoZaloView: React.FC<BaoCaoZaloViewProps> = ({
  appState,
  hocKy,
  selectedWeek,
}) => {
  const [reportText, setReportText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generateReport = () => {
    const suViecTuan = appState.listSuViec.filter(
      (s) => s.tuan === selectedWeek && (s.hocKy === hocKy || hocKy === 'CA_NAM')
    );

    const viPhamList = suViecTuan.filter((s) => s.diem < 0);
    const khenThuongList = suViecTuan.filter((s) => s.diem > 0);

    const hkLabel = hocKy === 'CA_NAM' ? 'Cả năm' : hocKy === 'HK1' ? 'Học kỳ 1' : 'Học kỳ 2';

    let txt = `📢 [BÁO CÁO NỀ NẾP & CÔNG TÁC ĐỘI - TUẦN ${selectedWeek}]\n`;
    txt += `🏫 Liên đội: ${appState.schoolConfig.schoolName.toUpperCase()}\n`;
    txt += `📍 Địa bàn: ${appState.schoolConfig.location}\n`;
    txt += `👤 Giáo viên TPT Đội: ${appState.schoolConfig.tptName}\n`;
    txt += `📅 Năm học: ${appState.schoolConfig.schoolYear} (${hkLabel})\n`;
    txt += `👥 Quy mô quản lý: 17 Chi đội THCS (Trường chính 8 lớp, Phân hiệu 9 lớp)\n`;
    txt += `--------------------------------------------------\n\n`;

    if (suViecTuan.length === 0) {
      txt += `✅ TỔNG QUAN NỀ NẾP TUẦN ${selectedWeek}:\n`;
      txt += `Trong tuần qua, toàn thể 17 Chi đội duy trì nề nếp chuyên cần, đồng phục khăn quàng và vệ sinh nội trú rất tốt, không phát sinh vi phạm nghiêm trọng nào.\n\n`;
    } else {
      if (viPhamList.length > 0) {
        txt += `⚠️ CÁC TRƯỜNG HỢP CẦN CHỈNH ĐỐN NỀ NẾP (${viPhamList.length} lượt):\n`;
        viPhamList.forEach((v, idx) => {
          txt += `${idx + 1}. Chi đội ${v.lop}: HS ${v.hocSinh} - ${v.tieuChi} (${v.diem}đ). Ghi chú: ${v.moTa || 'Theo quy chế nề nếp'}\n`;
        });
        txt += `\n`;
      }

      if (khenThuongList.length > 0) {
        txt += `🌟 BIỂU DƯƠNG NGƯỜI TỐT VIỆC TỐT / HOA ĐIỂM TỐT (${khenThuongList.length} lượt):\n`;
        khenThuongList.forEach((k, idx) => {
          txt += `${idx + 1}. Chi đội ${k.lop}: HS ${k.hocSinh} - ${k.tieuChi} (+${k.diem}đ). Chi tiết: ${k.moTa || 'Hành động đẹp'}\n`;
        });
        txt += `\n`;
      }
    }

    txt += `📌 NHẮC NHỞ TRỌNG TÂM ĐẦU TUẦN TỚI:\n`;
    txt += `1. Kính đề nghị các Thầy/Cô GVCN kiểm tra học sinh đeo khăn quàng đỏ đầy đủ trước khi vào lớp.\n`;
    txt += `2. Khu Bán trú (cả 2 điểm trường): Thực hiện nghiêm túc giờ tắt đèn ngủ, xếp chăn màn gọn gàng và vệ sinh phòng ở trước 7h00 sáng.\n`;
    txt += `3. Đội Cờ đỏ tiếp tục duy trì lịch trực tại cổng trường và sân cờ theo đúng phân công.\n\n`;
    txt += `Trân trọng cảm ơn sự phối hợp nhiệt tình của quý Thầy/Cô GVCN 17 Chi đội! 🙏`;

    return txt;
  };

  useEffect(() => {
    setReportText(generateReport());
  }, [selectedWeek, hocKy, appState]);

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(reportText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      // Fallback
      const textarea = document.getElementById('zaloReportArea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-700 font-extrabold uppercase tracking-wide">
            <Share2 className="w-5 h-5 text-emerald-600" />
            <span>Xuất Văn Bản Báo Cáo Zalo GVCN & Chi Đội — Tuần {selectedWeek}</span>
          </div>
          <h2 className="font-black text-xl text-slate-800 mt-1">
            Báo Cáo Nhanh Điểm Danh, Nề Nếp & Vi Phạm Bán Trú
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mẫu báo cáo văn bản chuẩn chỉnh, tự động tổng hợp từ dữ liệu tuần hiện tại để gửi vào nhóm Zalo nhà trường.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setReportText(generateReport())}
            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center space-x-1"
            title="Khôi phục lại nội dung tự động"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Tạo lại</span>
          </button>

          <button
            onClick={handleCopy}
            className={`font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã sao chép vào Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Sao chép vào Clipboard Zalo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-slate-700 flex items-center space-x-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Nội dung tin nhắn báo cáo (Thầy/Cô có thể chỉnh sửa trực tiếp trước khi gửi):</span>
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {reportText.length} ký tự
          </span>
        </div>

        <textarea
          id="zaloReportArea"
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          rows={16}
          className="w-full bg-slate-50/70 border border-slate-300 rounded-xl p-4 text-xs font-mono leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
        />

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <b>Mẹo nhanh:</b> Sau khi bấm <b>"Sao chép vào Clipboard Zalo"</b>, Thầy/Cô chỉ cần mở ứng dụng Zalo trên máy tính hoặc điện thoại, vào nhóm Zalo GVCN nhà trường và nhấn <b>Ctrl + V</b> (hoặc Dán) để gửi đi ngay tức thì!
          </div>
        </div>
      </div>
    </div>
  );
};
