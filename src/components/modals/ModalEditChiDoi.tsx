import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, Users, UserCheck, Shield, AlertTriangle, Sparkles, Building, Info } from 'lucide-react';
import { AppState, ClassData } from '../../types';
import { CLASS_DEFINITIONS } from '../../data/initialData';

interface ModalEditChiDoiProps {
  isOpen: boolean;
  onClose: () => void;
  classKey: string | null;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const ModalEditChiDoi: React.FC<ModalEditChiDoiProps> = ({
  isOpen,
  onClose,
  classKey,
  appState,
  setAppState,
}) => {
  const [gvcn, setGvcn] = useState<string>('');
  const [siso, setSiso] = useState<string>('');
  const [soDoiVien, setSoDoiVien] = useState<string>('');
  const [soThanhNien, setSoThanhNien] = useState<string>('');
  const [chiDoiTruong, setChiDoiTruong] = useState<string>('');
  const [chiDoiPho, setChiDoiPho] = useState<string>('');
  const [phongHoc, setPhongHoc] = useState<string>('');
  const [ghiChu, setGhiChu] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const classDef = CLASS_DEFINITIONS.find((c) => c.key === classKey);

  useEffect(() => {
    if (isOpen && classKey) {
      const existing = appState.classesData[classKey];
      if (existing) {
        setGvcn(existing.gvcn || '');
        setSiso(existing.siso !== null && existing.siso !== undefined ? String(existing.siso) : '');
        setSoDoiVien(
          existing.soDoiVien !== null && existing.soDoiVien !== undefined
            ? String(existing.soDoiVien)
            : ''
        );
        setSoThanhNien(
          existing.soThanhNien !== null && existing.soThanhNien !== undefined
            ? String(existing.soThanhNien)
            : ''
        );
        setChiDoiTruong(existing.chiDoiTruong || '');
        setChiDoiPho(existing.chiDoiPho || '');
        setPhongHoc(existing.phongHoc || '');
        setGhiChu(existing.ghiChu || '');
      } else {
        setGvcn('');
        setSiso('');
        setSoDoiVien('');
        setSoThanhNien('');
        setChiDoiTruong('');
        setChiDoiPho('');
        setPhongHoc('');
        setGhiChu('');
      }
      setErrorMsg('');
    }
  }, [isOpen, classKey, appState.classesData]);

  if (!isOpen || !classKey || !classDef) return null;

  // Numerical values for live calculations & validation
  const numSiso = siso.trim() !== '' ? parseInt(siso, 10) : null;
  const numDoiVien = soDoiVien.trim() !== '' ? parseInt(soDoiVien, 10) : null;
  const numThanhNien = soThanhNien.trim() !== '' ? parseInt(soThanhNien, 10) : null;

  // Calculations
  const effectiveSiso = numSiso !== null && !isNaN(numSiso) ? numSiso : 0;
  const effectiveDoiVien = numDoiVien !== null && !isNaN(numDoiVien) ? numDoiVien : 0;
  const effectiveThanhNien = numThanhNien !== null && !isNaN(numThanhNien) ? numThanhNien : 0;

  const chuaKetNap = effectiveSiso > 0 ? Math.max(0, effectiveSiso - effectiveDoiVien) : 0;
  const tyLeDoiVien = effectiveSiso > 0 ? Math.round((effectiveDoiVien / effectiveSiso) * 100) : 0;
  const tyLeThanhNien = effectiveSiso > 0 ? Math.round((effectiveThanhNien / effectiveSiso) * 100) : 0;

  // Validation function
  const validateForm = (): boolean => {
    if (numSiso !== null && (isNaN(numSiso) || numSiso < 0)) {
      setErrorMsg('Sĩ số thực tế không được là số âm.');
      return false;
    }
    if (numDoiVien !== null && (isNaN(numDoiVien) || numDoiVien < 0)) {
      setErrorMsg('Số lượng Đội viên không được là số âm.');
      return false;
    }
    if (numThanhNien !== null && (isNaN(numThanhNien) || numThanhNien < 0)) {
      setErrorMsg('Số lượng Thanh niên không được là số âm.');
      return false;
    }

    if (numSiso !== null && numDoiVien !== null && numDoiVien > numSiso) {
      setErrorMsg(`Số lượng Đội viên (${numDoiVien}) không được vượt quá sĩ số thực tế (${numSiso}).`);
      return false;
    }
    if (numSiso !== null && numThanhNien !== null && numThanhNien > numSiso) {
      setErrorMsg(`Số lượng Thanh niên (${numThanhNien}) không được vượt quá sĩ số thực tế (${numSiso}).`);
      return false;
    }

    setErrorMsg('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const parsedSiso = siso.trim() !== '' ? parseInt(siso, 10) : null;
    const parsedDoiVien = soDoiVien.trim() !== '' ? parseInt(soDoiVien, 10) : null;
    const parsedThanhNien = soThanhNien.trim() !== '' ? parseInt(soThanhNien, 10) : null;

    setAppState((prev) => {
      const updatedClasses = { ...prev.classesData };
      const current = updatedClasses[classKey] || {
        key: classDef.key,
        name: classDef.name,
        grade: classDef.grade,
        diemTruong: classDef.diemTruong,
      };

      updatedClasses[classKey] = {
        ...current,
        gvcn: gvcn.trim(),
        siso: parsedSiso,
        soDoiVien: parsedDoiVien,
        soThanhNien: parsedThanhNien,
        chiDoiTruong: chiDoiTruong.trim(),
        chiDoiPho: chiDoiPho.trim(),
        phongHoc: phongHoc.trim(),
        ghiChu: ghiChu.trim(),
      };

      return {
        ...prev,
        classesData: updatedClasses,
      };
    });

    onClose();
  };

  // Helper to suggest numbers from current student list
  const handleSuggestFromStudentList = () => {
    const classStudents = (appState.listHocSinh || []).filter((s) => s.lop === classKey);
    const countAll = classStudents.length;
    const countDoiVien = classStudents.filter((s) => s.isDoiVien).length;

    if (countAll > 0) {
      setSiso(String(countAll));
      setSoDoiVien(String(countDoiVien));
      if (classDef.grade === 9) {
        // Khối 9 thường có một số học sinh đã kết nạp Đoàn / Thanh niên
        setSoThanhNien(String(Math.max(0, countAll - countDoiVien)));
      } else {
        setSoThanhNien('0');
      }
      setErrorMsg('');
    } else {
      alert(`Chưa có học sinh nào được gán cho ${classDef.name} trong Danh sách Học sinh.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-scale-up border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-rose-900 px-5 py-3.5 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/60 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">
                Cập Nhật Thông Tin {classDef.name}
              </h3>
              <p className="text-[11px] text-red-200">
                {classDef.diemTruong} • Khối {classDef.grade} THCS Đường Hồng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg text-white transition text-lg font-bold cursor-pointer"
            title="Đóng (Hủy)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-700 text-xs flex items-start space-x-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="font-bold">{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Teacher in charge */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Giáo Viên Chủ Nhiệm Phụ Trách
            </label>
            <input
              type="text"
              value={gvcn}
              onChange={(e) => setGvcn(e.target.value)}
              placeholder="Nhập họ tên Thầy/Cô GVCN..."
              className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-red-600 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Section 2: Numbers (Sĩ số, Đội viên, Thanh niên) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-black text-slate-800 uppercase tracking-wide text-[11px] flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-red-700" />
                <span>Quản Lý Sĩ Số Đội Viên & Thanh Niên</span>
              </span>
              <button
                type="button"
                onClick={handleSuggestFromStudentList}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center space-x-1 cursor-pointer"
                title="Lấy số liệu gợi ý theo danh sách học sinh hiện có trong ứng dụng"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Gợi ý theo DS học sinh</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sĩ Số Thực Tế *
                </label>
                <input
                  type="number"
                  min="0"
                  value={siso}
                  onChange={(e) => {
                    setSiso(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="VD: 38"
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-black text-slate-900 bg-white focus:ring-2 focus:ring-red-600 text-sm"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Học sinh lớp</span>
              </div>

              <div>
                <label className="block font-bold text-red-800 mb-1">
                  Số Đội Viên *
                </label>
                <input
                  type="number"
                  min="0"
                  value={soDoiVien}
                  onChange={(e) => {
                    setSoDoiVien(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="VD: 35"
                  className="w-full border border-red-300 rounded-lg p-2.5 font-black text-red-700 bg-white focus:ring-2 focus:ring-red-600 text-sm"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Đội viên chính thức</span>
              </div>

              <div>
                <label className="block font-bold text-blue-800 mb-1">
                  Số Thanh Niên
                </label>
                <input
                  type="number"
                  min="0"
                  value={soThanhNien}
                  onChange={(e) => {
                    setSoThanhNien(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="VD: 3"
                  className="w-full border border-blue-300 rounded-lg p-2.5 font-black text-blue-700 bg-white focus:ring-2 focus:ring-blue-600 text-sm"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Thanh niên / Đoàn</span>
              </div>
            </div>

            {/* Live Calculation Preview Card */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Sĩ số</span>
                <span className="font-black text-slate-800 text-sm">{effectiveSiso}</span>
              </div>

              <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                <span className="text-[10px] text-red-700 block font-bold uppercase">Đội viên</span>
                <span className="font-black text-red-700 text-sm">{effectiveDoiVien}</span>
                <span className="text-[10px] text-red-600 font-bold block">({tyLeDoiVien}%)</span>
              </div>

              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-[10px] text-blue-700 block font-bold uppercase">Thanh niên</span>
                <span className="font-black text-blue-700 text-sm">{effectiveThanhNien}</span>
                <span className="text-[10px] text-blue-600 font-bold block">({tyLeThanhNien}%)</span>
              </div>

              <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-[10px] text-amber-800 block font-bold uppercase">Chưa kết nạp</span>
                <span className="font-black text-amber-800 text-sm">{chuaKetNap}</span>
                <span className="text-[10px] text-amber-700 block">(Sĩ số - Đội viên)</span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                <b>Nguyên tắc nghiệp vụ:</b> Đội viên và Thanh niên là hai chỉ tiêu riêng biệt, không tự động cộng dồn. TPT có toàn quyền chỉnh sửa trực tiếp số liệu độc lập theo báo cáo thực tế.
              </span>
            </div>
          </div>

          {/* Section 3: Troop Leaders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Chi Đội Trưởng
              </label>
              <input
                type="text"
                value={chiDoiTruong}
                onChange={(e) => setChiDoiTruong(e.target.value)}
                placeholder="Họ tên học sinh..."
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-600 bg-slate-50 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Chi Đội Phó
              </label>
              <input
                type="text"
                value={chiDoiPho}
                onChange={(e) => setChiDoiPho(e.target.value)}
                placeholder="Họ tên học sinh..."
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-600 bg-slate-50 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Section 4: Classroom & Special Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Phòng Học / Dãy Nhà
              </label>
              <input
                type="text"
                value={phongHoc}
                onChange={(e) => setPhongHoc(e.target.value)}
                placeholder="VD: Phòng 102 dãy nhà A..."
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-600 bg-slate-50 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Ghi Chú Đặc Thù Chi Đội
              </label>
              <input
                type="text"
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="VD: 100% học sinh bán trú nội trú..."
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-600 bg-slate-50 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-black rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
