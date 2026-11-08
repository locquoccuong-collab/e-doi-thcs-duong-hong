import React, { useState } from 'react';
import { X, ShieldCheck, Plus } from 'lucide-react';
import { AppState, CoDoItem, DiemTruongType } from '../../types';
import { CLASS_DEFINITIONS } from '../../data/initialData';

interface ModalCoDoProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const ModalCoDo: React.FC<ModalCoDoProps> = ({
  isOpen,
  onClose,
  appState,
  setAppState,
}) => {
  const [diemTruong, setDiemTruong] = useState<DiemTruongType>('Trường chính');
  const [lop, setLop] = useState<string>('9A');
  const [hoTen, setHoTen] = useState<string>('');
  const [caTruc, setCaTruc] = useState<string>('Đầu giờ sáng');
  const [gioTruc, setGioTruc] = useState<string>('7h00 - 7h30');
  const [viTri, setViTri] = useState<string>('Cổng trường chính & Sân cờ');
  const [nhiemVu, setNhiemVu] = useState<string>('Kiểm tra khăn quàng, nề nếp truy bài');
  const [ghiChu, setGhiChu] = useState<string>('');

  if (!isOpen) return null;

  const handleCampusChange = (dt: DiemTruongType) => {
    setDiemTruong(dt);
    const available = CLASS_DEFINITIONS.filter((c) => c.diemTruong === dt);
    if (available.length > 0) {
      setLop(available[0].key);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoTen.trim()) return;

    const newItem: CoDoItem = {
      id: Date.now(),
      diemTruong,
      lop,
      hoTen: hoTen.trim(),
      caTruc: caTruc.trim(),
      gioTruc: gioTruc.trim(),
      viTri: viTri.trim(),
      nhiemVu: nhiemVu.trim(),
      ghiChu: ghiChu.trim(),
    };

    setAppState((prev) => ({
      ...prev,
      listCoDo: [newItem, ...prev.listCoDo],
    }));

    setHoTen('');
    setGhiChu('');
    onClose();
  };

  const availableClasses = CLASS_DEFINITIONS.filter((c) => c.diemTruong === diemTruong);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="bg-red-800 px-5 py-3.5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-yellow-300" />
            <h3 className="font-black text-sm uppercase tracking-wide">
              Phân Công Đội Viên Cờ Đỏ
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
              <label className="block font-bold text-slate-700 mb-1">Điểm Trường Trực *</label>
              <select
                value={diemTruong}
                onChange={(e) => handleCampusChange(e.target.value as DiemTruongType)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-red-600"
              >
                <option value="Trường chính">Trường chính</option>
                <option value="Phân hiệu">Phân hiệu</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Chi Đội Trực *</label>
              <select
                value={lop}
                onChange={(e) => setLop(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-red-600"
              >
                {availableClasses.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Họ Tên Đội Viên Cờ Đỏ *
            </label>
            <input
              type="text"
              required
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              placeholder="Ví dụ: Hoàng Văn Thắng"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ca Trực *</label>
              <select
                value={caTruc}
                onChange={(e) => setCaTruc(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-red-600 bg-white"
              >
                <option value="Đầu giờ sáng">Đầu giờ sáng</option>
                <option value="Giờ ra chơi sáng & Truy bài">Giờ ra chơi & Truy bài</option>
                <option value="Đầu giờ chiều">Đầu giờ chiều</option>
                <option value="Giờ tan học / Khu bán trú">Giờ tan học & Bán trú</option>
                <option value="Cả ngày">Cả ngày</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Giờ Trực *</label>
              <input
                type="text"
                required
                value={gioTruc}
                onChange={(e) => setGioTruc(e.target.value)}
                placeholder="7h00 - 7h30..."
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Vị Trí Phân Công Trực *</label>
            <input
              type="text"
              required
              value={viTri}
              onChange={(e) => setViTri(e.target.value)}
              placeholder="Cổng trường, Sân cờ, Khu bán trú..."
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nhiệm Vụ Được Giao
            </label>
            <input
              type="text"
              value={nhiemVu}
              onChange={(e) => setNhiemVu(e.target.value)}
              placeholder="Kiểm tra khăn quàng, nề nếp truy bài, vệ sinh..."
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Ghi Chú Thêm
            </label>
            <input
              type="text"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Ghi chú phân công chéo chi đội hoặc yêu cầu đặc thù..."
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
              Lưu Phân Công
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
