import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, ShieldCheck, Clock, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AppState, CoDoItem, DiemTruongType } from '../../types';
import { CLASS_DEFINITIONS } from '../../data/initialData';

interface ModalEditCoDoProps {
  isOpen: boolean;
  onClose: () => void;
  coDoItem: CoDoItem | null;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onNotify?: (message: string, type: 'success' | 'error') => void;
}

export const ModalEditCoDo: React.FC<ModalEditCoDoProps> = ({
  isOpen,
  onClose,
  coDoItem,
  appState,
  setAppState,
  onNotify,
}) => {
  const [hoTen, setHoTen] = useState<string>('');
  const [lop, setLop] = useState<string>('9A');
  const [diemTruong, setDiemTruong] = useState<DiemTruongType>('Trường chính');
  const [caTruc, setCaTruc] = useState<string>('Đầu giờ sáng');
  const [gioTruc, setGioTruc] = useState<string>('7h00 - 7h30');
  const [viTri, setViTri] = useState<string>('Cổng trường chính & Cầu thang tầng 1');
  const [nhiemVu, setNhiemVu] = useState<string>('Kiểm tra khăn quàng, tác phong đi học đúng giờ');
  const [ghiChu, setGhiChu] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen && coDoItem) {
      setHoTen(coDoItem.hoTen || '');
      setLop(coDoItem.lop || '9A');
      setDiemTruong(coDoItem.diemTruong || 'Trường chính');
      setCaTruc(coDoItem.caTruc || 'Đầu giờ sáng');
      setGioTruc(coDoItem.gioTruc || '7h00 - 7h30');
      setViTri(coDoItem.viTri || '');
      setNhiemVu(coDoItem.nhiemVu || 'Theo dõi nền nếp, kiểm tra khăn quàng đỏ');
      setGhiChu(coDoItem.ghiChu || '');
      setErrorMessage('');
    }
  }, [isOpen, coDoItem]);

  if (!isOpen || !coDoItem) return null;

  const handleCampusChange = (dt: DiemTruongType) => {
    setDiemTruong(dt);
    const available = CLASS_DEFINITIONS.filter((c) => c.diemTruong === dt);
    if (available.length > 0 && !available.some((c) => c.key === lop)) {
      setLop(available[0].key);
    }
  };

  const handleClassChange = (selectedClassKey: string) => {
    setLop(selectedClassKey);
    const classDef = CLASS_DEFINITIONS.find((c) => c.key === selectedClassKey);
    if (classDef) {
      setDiemTruong(classDef.diemTruong);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!hoTen.trim()) {
      setErrorMessage('Vui lòng nhập họ tên đội viên cờ đỏ.');
      return;
    }

    if (!viTri.trim()) {
      setErrorMessage('Vui lòng nhập vị trí phân công trực.');
      return;
    }

    try {
      // Find and update exact record using its ID
      setAppState((prev) => {
        const targetId = coDoItem.id;
        const index = prev.listCoDo.findIndex((c) => c.id === targetId);

        if (index === -1) {
          throw new Error('Không tìm thấy bản ghi phân công có mã ID: ' + targetId);
        }

        const updatedList = prev.listCoDo.map((item) => {
          if (item.id === targetId) {
            return {
              ...item,
              hoTen: hoTen.trim(),
              lop,
              diemTruong,
              caTruc: caTruc.trim(),
              gioTruc: gioTruc.trim(),
              viTri: viTri.trim(),
              nhiemVu: nhiemVu.trim(),
              ghiChu: ghiChu.trim(),
            };
          }
          return item;
        });

        return {
          ...prev,
          listCoDo: updatedList,
        };
      });

      if (onNotify) {
        onNotify(`Đã lưu thay đổi phân công trực của đội viên "${hoTen.trim()}" thành công!`, 'success');
      }

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi lưu thay đổi!');
      if (onNotify) {
        onNotify(err.message || 'Lỗi khi lưu thay đổi phân công!', 'error');
      }
    }
  };

  const availableClasses = CLASS_DEFINITIONS.filter((c) => c.diemTruong === diemTruong);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-scale-up">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-3.5 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide flex items-center space-x-2">
                <span>Chỉnh Sửa Phân Công Đội Cờ Đỏ</span>
                <span className="text-[10px] bg-yellow-400 text-slate-900 font-mono font-bold px-1.5 py-0.2 rounded">
                  ID: #{coDoItem.id}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Cập nhật ca trực, thời gian, vị trí và nhiệm vụ được giao
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg text-slate-300 hover:text-white transition"
            title="Đóng (Hủy)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 px-5 py-2.5 flex items-center space-x-2 text-xs text-red-700 font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs overflow-y-auto custom-scrollbar flex-1">
          {/* 1. Họ tên đội viên */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Họ Tên Đội Viên Cờ Đỏ *
            </label>
            <input
              type="text"
              required
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              placeholder="Nhập họ và tên học sinh trực cờ đỏ..."
              className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* 2 & 3. Điểm trường & Chi đội */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Điểm Trường *
              </label>
              <select
                value={diemTruong}
                onChange={(e) => handleCampusChange(e.target.value as DiemTruongType)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="Trường chính">Trường chính (8 Chi đội)</option>
                <option value="Phân hiệu">Phân hiệu (9 Chi đội)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Chi Đội (Lớp) *
              </label>
              <select
                value={lop}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <optgroup label={diemTruong}>
                  {availableClasses.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name} ({c.diemTruong})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Điểm trường khác">
                  {CLASS_DEFINITIONS.filter((c) => c.diemTruong !== diemTruong).map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name} ({c.diemTruong})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* 4 & 5. Ca trực & Giờ trực */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Ca Trực *
              </label>
              <input
                type="text"
                required
                value={caTruc}
                onChange={(e) => setCaTruc(e.target.value)}
                placeholder="Ví dụ: Đầu giờ sáng..."
                list="caTrucSuggestions"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 font-medium"
              />
              <datalist id="caTrucSuggestions">
                <option value="Đầu giờ sáng" />
                <option value="Giờ ra chơi sáng & Truy bài" />
                <option value="Đầu giờ chiều" />
                <option value="Giờ tan học / Khu bán trú" />
                <option value="Cả ngày" />
              </datalist>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Giờ Trực Cụ Thể *
              </label>
              <input
                type="text"
                required
                value={gioTruc}
                onChange={(e) => setGioTruc(e.target.value)}
                placeholder="Ví dụ: 7h00 - 7h30"
                list="gioTrucSuggestions"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 font-mono"
              />
              <datalist id="gioTrucSuggestions">
                <option value="7h00 - 7h30" />
                <option value="8h45 - 9h15" />
                <option value="13h30 - 14h00" />
                <option value="16h30 - 17h15" />
                <option value="Trong giờ truy bài 15 phút" />
              </datalist>
            </div>
          </div>

          {/* 6. Vị trí phân công */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Vị Trí Phân Công *
            </label>
            <input
              type="text"
              required
              value={viTri}
              onChange={(e) => setViTri(e.target.value)}
              placeholder="Ví dụ: Cổng trường chính & Cầu thang tầng 1..."
              list="viTriSuggestions"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 font-medium"
            />
            <datalist id="viTriSuggestions">
              <option value="Cổng trường & Sân cờ" />
              <option value="Cổng trường chính & Cầu thang tầng 1" />
              <option value="Sân cờ & Dãy lớp học Trường chính" />
              <option value="Cổng Phân hiệu & Sân trường" />
              <option value="Khu nội trú & Nhà ăn Phân hiệu" />
              <option value="Hành lang dãy lớp học tầng 2" />
              <option value="Khu vực vệ sinh & Vườn trường" />
            </datalist>
          </div>

          {/* 7. Nhiệm vụ */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nhiệm Vụ Được Giao
            </label>
            <input
              type="text"
              value={nhiemVu}
              onChange={(e) => setNhiemVu(e.target.value)}
              placeholder="Ví dụ: Kiểm tra khăn quàng, nề nếp truy bài, vệ sinh..."
              list="nhiemVuSuggestions"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600"
            />
            <datalist id="nhiemVuSuggestions">
              <option value="Theo dõi khăn quàng, tác phong đi học đúng giờ" />
              <option value="Giám sát trật tự truy bài 15 phút đầu giờ" />
              <option value="Kiểm tra sĩ số đầu giờ cùng GVCN" />
              <option value="Kiểm tra vệ sinh phòng ở và giờ cơm bán trú" />
              <option value="Theo dõi trật tự xếp hàng tập thể dục đầu tuần" />
            </datalist>
          </div>

          {/* 8. Ghi chú */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Ghi Chú Thêm
            </label>
            <textarea
              rows={2}
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Ghi chú phân công chéo chi đội, số điện thoại liên hệ hoặc yêu cầu đặc thù..."
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              HỦY
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>LƯU THAY ĐỔI</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
