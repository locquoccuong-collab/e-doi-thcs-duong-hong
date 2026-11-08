import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  School,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { AppState, SchoolConfig } from '../types';
import { exportBackupJSON } from '../utils/storage';
import { getInitialAppState } from '../data/initialData';

interface CauHinhDonViViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onOpenQuanTriDuLieu?: () => void;
}

export const CauHinhDonViView: React.FC<CauHinhDonViViewProps> = ({
  appState,
  setAppState,
  onOpenQuanTriDuLieu,
}) => {
  const [cfg, setCfg] = useState<SchoolConfig>({ ...appState.schoolConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setAppState((prev) => ({
      ...prev,
      schoolConfig: { ...cfg },
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.schoolConfig && parsed.classesData) {
          setAppState(parsed);
          setRestoreStatus('Khôi phục dữ liệu thành công!');
          setTimeout(() => setRestoreStatus(null), 3000);
        } else {
          alert('Tệp sao lưu không đúng định dạng e-Đội chuẩn!');
        }
      } catch (err) {
        alert('Lỗi khi đọc tệp JSON sao lưu!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetClean = () => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn thiết lập lại toàn bộ dữ liệu về trạng thái sạch ban đầu của THCS Đường Hồng?'
      )
    ) {
      const initial = getInitialAppState();
      setAppState(initial);
      setCfg(initial.schoolConfig);
      alert('Đã thiết lập lại dữ liệu ban đầu thành công!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-700 font-extrabold uppercase tracking-wide">
            <Settings className="w-5 h-5 text-yellow-500" />
            <span>Cấu Hình Thông Tin Đơn Vị & Quản Trị Dữ Liệu</span>
          </div>
          <h2 className="font-black text-xl text-slate-800 mt-1">
            Thông Tin Nhà Trường & Sao Lưu An Toàn
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cập nhật tên trường, giáo viên Tổng phụ trách, số lượng học sinh dự kiến và sao lưu cơ sở dữ liệu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Cấu hình */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide flex items-center space-x-2">
              <School className="w-4 h-4 text-red-600" />
              <span>Thông Tin Đơn Vị Đội</span>
            </h3>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã lưu thay đổi!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tên Trường / Đơn Vị Liên Đội *
              </label>
              <input
                type="text"
                required
                value={cfg.schoolName}
                onChange={(e) => setCfg({ ...cfg, schoolName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Địa Bàn / Xã / Tỉnh *
              </label>
              <input
                type="text"
                required
                value={cfg.location}
                onChange={(e) => setCfg({ ...cfg, location: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Năm Học *</label>
                <input
                  type="text"
                  required
                  value={cfg.schoolYear}
                  onChange={(e) => setCfg({ ...cfg, schoolYear: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tổng HS Dự Kiến (toàn trường) *
                </label>
                <input
                  type="number"
                  required
                  value={cfg.projectedStudents}
                  onChange={(e) =>
                    setCfg({ ...cfg, projectedStudents: parseInt(e.target.value) || 0 })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-black text-red-700 focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Giáo Viên Tổng Phụ Trách Đội (TPT) *
              </label>
              <input
                type="text"
                required
                value={cfg.tptName}
                onChange={(e) => setCfg({ ...cfg, tptName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="pt-2 border-t">
              <label className="block font-black text-slate-800 uppercase tracking-wide mb-2 text-[11px]">
                Ngưỡng Điểm Xếp Loại Thi Đua
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Xuất sắc &gt;=</span>
                  <input
                    type="number"
                    value={cfg.diemThresholds.xuatSac}
                    onChange={(e) =>
                      setCfg({
                        ...cfg,
                        diemThresholds: {
                          ...cfg.diemThresholds,
                          xuatSac: parseFloat(e.target.value) || 95,
                        },
                      })
                    }
                    className="w-full border rounded p-1.5 font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Tốt &gt;=</span>
                  <input
                    type="number"
                    value={cfg.diemThresholds.tot}
                    onChange={(e) =>
                      setCfg({
                        ...cfg,
                        diemThresholds: {
                          ...cfg.diemThresholds,
                          tot: parseFloat(e.target.value) || 85,
                        },
                      })
                    }
                    className="w-full border rounded p-1.5 font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Khá &gt;=</span>
                  <input
                    type="number"
                    value={cfg.diemThresholds.kha}
                    onChange={(e) =>
                      setCfg({
                        ...cfg,
                        diemThresholds: {
                          ...cfg.diemThresholds,
                          kha: parseFloat(e.target.value) || 70,
                        },
                      })
                    }
                    className="w-full border rounded p-1.5 font-bold text-center"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình Thông Tin Đơn Vị</span>
            </button>
          </form>
        </div>

        {/* Sao lưu & Phục hồi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide flex items-center space-x-2 border-b pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sao Lưu & Phục Hồi Dữ Liệu</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Toàn bộ dữ liệu của Liên đội (17 Chi đội, điểm thi đua tuần, 8 nhóm hồ sơ số hóa kèm tài liệu đính kèm, danh sách cờ đỏ) được lưu trữ an toàn ngay trên trình duyệt máy tính của Thầy/Cô.
            </p>

            {onOpenQuanTriDuLieu && (
              <button
                type="button"
                onClick={onOpenQuanTriDuLieu}
                className="w-full p-3 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-xl shadow-xs hover:from-emerald-800 hover:to-teal-900 transition flex items-center justify-between font-bold text-xs cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-yellow-300" />
                  <span>Mở Hệ Thống Đồng Bộ & Sao Lưu 3 Lớp</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase">
                  Mới
                </span>
              </button>
            )}

            {restoreStatus && (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{restoreStatus}</span>
              </div>
            )}

            {/* Export JSON box */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                <Download className="w-4 h-4 text-amber-700" />
                <span>1. Tải về file sao lưu dự phòng (.json):</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Nên tải file dự phòng định kỳ hàng tuần hoặc trước khi dọn dẹp trình duyệt để bảo vệ toàn bộ dữ liệu công tác Đội.
              </p>
              <button
                onClick={() => exportBackupJSON(appState)}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Tải Về Tệp Sao Lưu (.json)</span>
              </button>
            </div>

            {/* Import JSON box */}
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-blue-900 flex items-center space-x-1.5">
                <Upload className="w-4 h-4 text-blue-700" />
                <span>2. Khôi phục từ tệp sao lưu đã có:</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Chọn file JSON đã tải về trước đó để phục hồi lại toàn bộ dữ liệu trên máy tính mới.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleResetClean}
              className="w-full text-xs text-red-600 hover:text-red-800 font-bold hover:underline flex items-center justify-center space-x-1 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Thiết lập lại dữ liệu sạch ban đầu (Cần xác nhận)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
