import React, { useState } from 'react';
import { X, Bell, Send } from 'lucide-react';
import { AppState, ThongBao } from '../../types';

interface ModalThongBaoProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const ModalThongBao: React.FC<ModalThongBaoProps> = ({
  isOpen,
  onClose,
  appState,
  setAppState,
}) => {
  const [mucDo, setMucDo] = useState<'Thông thường' | 'KHẨN' | 'TỐI KHẨN'>('Thông thường');
  const [doiTuong, setDoiTuong] = useState<string>('Toàn trường (17 Chi đội)');
  const [tieuDe, setTieuDe] = useState<string>('');
  const [noiDung, setNoiDung] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tieuDe.trim() || !noiDung.trim()) return;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())} ngày ${pad(
      now.getDate()
    )}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    const newTB: ThongBao = {
      id: Date.now(),
      mucDo,
      doiTuong,
      tieuDe: tieuDe.trim(),
      noiDung: noiDung.trim(),
      thoiGian: timeStr,
      nguoiDang: `TPT ${appState.schoolConfig.tptName}`,
    };

    setAppState((prev) => ({
      ...prev,
      listThongBao: [newTB, ...prev.listThongBao],
    }));

    setTieuDe('');
    setNoiDung('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-3.5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            <h3 className="font-black text-sm uppercase tracking-wide">
              Đăng Thông Báo / Chỉ Đạo Công Tác Đội
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg text-white transition text-lg font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mức Độ Ưu Tiên</label>
              <select
                value={mucDo}
                onChange={(e) => setMucDo(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-blue-600"
              >
                <option value="Thông thường">Thông thường</option>
                <option value="KHẨN">KHẨN</option>
                <option value="TỐI KHẨN">TỐI KHẨN</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Đối Tượng Nhận</label>
              <select
                value={doiTuong}
                onChange={(e) => setDoiTuong(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-blue-600"
              >
                <option value="Toàn trường (17 Chi đội)">Toàn trường (17 Chi đội)</option>
                <option value="Trường chính (8 Chi đội)">Trường chính (8 Chi đội)</option>
                <option value="Phân hiệu (9 Chi đội)">Phân hiệu (9 Chi đội)</option>
                <option value="Đội Cờ đỏ">Đội Cờ đỏ</option>
                <option value="Ban Chỉ huy Liên đội">Ban Chỉ huy Liên đội</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tiêu Đề Thông Báo *
            </label>
            <input
              type="text"
              required
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder="Ví dụ: Lịch kiểm tra vệ sinh khu bán trú và đồng phục thứ Hai..."
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nội Dung Chi Tiết *
            </label>
            <textarea
              required
              rows={4}
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              placeholder="Nội dung truyền đạt cụ thể đến GVCN và các Chi đội..."
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Đăng Thông Báo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
