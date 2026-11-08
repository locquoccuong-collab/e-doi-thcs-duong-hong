import React, { useState, useEffect } from 'react';
import { X, PlusCircle, AlertTriangle, Calendar, User, MapPin } from 'lucide-react';
import { AppState, SuViec } from '../../types';
import { CLASS_DEFINITIONS } from '../../data/initialData';

interface ModalViPhamProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  hocKy: 'HK1' | 'HK2' | 'CA_NAM';
  selectedWeek: number;
}

export const ModalViPham: React.FC<ModalViPhamProps> = ({
  isOpen,
  onClose,
  appState,
  setAppState,
  hocKy,
  selectedWeek,
}) => {
  const [lop, setLop] = useState<string>('6A');
  const [thoiGian, setThoiGian] = useState<string>('');
  const [hocSinh, setHocSinh] = useState<string>('');
  const [tieuChiId, setTieuChiId] = useState<number>(1);
  const [diem, setDiem] = useState<number>(-2);
  const [nguoiGhi, setNguoiGhi] = useState<string>('Đội Cờ đỏ / TPT');
  const [diaDiem, setDiaDiem] = useState<string>('Cổng trường');
  const [moTa, setMoTa] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setThoiGian(formatted);
      if (appState.listTieuChi.length > 0) {
        setTieuChiId(appState.listTieuChi[0].id);
        setDiem(appState.listTieuChi[0].diem);
      }
    }
  }, [isOpen, appState.listTieuChi]);

  if (!isOpen) return null;

  const handleTieuChiChange = (id: number) => {
    setTieuChiId(id);
    const tc = appState.listTieuChi.find((t) => t.id === id);
    if (tc) {
      setDiem(tc.diem);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hocSinh.trim()) return;

    const tc = appState.listTieuChi.find((t) => t.id === tieuChiId);
    const tieuChiText = tc ? `[${tc.nhom}] ${tc.ten}` : 'Tiêu chí đánh giá';

    // Format human-friendly time
    const d = new Date(thoiGian);
    const timeStr = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} ngày ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

    const newSuViec: SuViec = {
      id: Date.now(),
      tuan: selectedWeek,
      hocKy,
      lop,
      thoiGian: timeStr,
      hocSinh: hocSinh.trim(),
      tieuChi: tieuChiText,
      diem: Number(diem),
      moTa: moTa.trim(),
      nguoiGhi: nguoiGhi.trim(),
      diaDiem: diaDiem.trim(),
    };

    setAppState((prev) => ({
      ...prev,
      listSuViec: [newSuViec, ...prev.listSuViec],
    }));

    setHocSinh('');
    setMoTa('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-red-700 px-5 py-3.5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-yellow-300" />
            <h3 className="font-black text-sm uppercase tracking-wide">
              Ghi Nhận Sự Việc / Vi Phạm / Tuyên Dương
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
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto custom-scrollbar space-y-4 text-xs">
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
            Đang ghi nhận cho <b>{hocKy === 'CA_NAM' ? 'Cả năm' : hocKy} — Tuần {selectedWeek}</b>.
            Điểm số và sự việc sẽ tự động cập nhật vào bảng thi đua tuần của Chi đội được chọn.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                1. Chọn Chi Đội (17 Lớp THCS) *
              </label>
              <select
                value={lop}
                onChange={(e) => setLop(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-red-600 focus:bg-white"
              >
                <optgroup label="Trường chính (8 lớp)">
                  {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Trường chính').map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name} (Trường chính)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Phân hiệu (9 lớp - có 8C)">
                  {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Phân hiệu').map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name} (Phân hiệu)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Thời gian ghi nhận *
              </label>
              <input
                type="datetime-local"
                required
                value={thoiGian}
                onChange={(e) => setThoiGian(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              2. Họ tên Học sinh hoặc Tập thể Chi đội *
            </label>
            <input
              type="text"
              required
              value={hocSinh}
              onChange={(e) => setHocSinh(e.target.value)}
              placeholder="Ví dụ: Hoàng Văn An (hoặc ghi 'Tập thể lớp 7A')"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-600 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              3. Chọn Tiêu chí đánh giá *
            </label>
            <select
              value={tieuChiId}
              onChange={(e) => handleTieuChiChange(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-600"
            >
              {appState.listTieuChi.map((tc) => (
                <option key={tc.id} value={tc.id}>
                  [{tc.nhom}] {tc.ten} ({tc.diem > 0 ? `+${tc.diem}đ` : `${tc.diem}đ`})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Điểm cộng / trừ *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={diem}
                onChange={(e) => setDiem(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-black text-red-700 focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Địa điểm xảy ra</label>
              <input
                type="text"
                value={diaDiem}
                onChange={(e) => setDiaDiem(e.target.value)}
                placeholder="Cổng trường, khu nội trú..."
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Người ghi nhận</label>
              <input
                type="text"
                value={nguoiGhi}
                onChange={(e) => setNguoiGhi(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              4. Mô tả chi tiết hành vi / Ghi chú
            </label>
            <textarea
              rows={2}
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Ví dụ: Đi muộn 10 phút giờ truy bài đầu giờ sáng, không đeo khăn quàng tại cổng trường..."
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-600"
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
              className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-black rounded-xl shadow-md transition"
            >
              Lưu Ghi Nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
