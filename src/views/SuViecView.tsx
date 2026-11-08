import React, { useState } from 'react';
import { AlertTriangle, PlusCircle, Trash2, Filter, Search, Award, MapPin, User } from 'lucide-react';
import { AppState, SuViec } from '../types';
import { CLASS_DEFINITIONS } from '../data/initialData';

interface SuViecViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  hocKy: 'HK1' | 'HK2' | 'CA_NAM';
  selectedWeek: number;
  onOpenModalViPham: () => void;
}

export const SuViecView: React.FC<SuViecViewProps> = ({
  appState,
  setAppState,
  hocKy,
  selectedWeek,
  onOpenModalViPham,
}) => {
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'MINUS' | 'PLUS'>('ALL');
  const [keyword, setKeyword] = useState<string>('');

  // Strict filtering by current week and period
  const rawList = appState.listSuViec.filter(
    (s) => s.tuan === selectedWeek && (s.hocKy === hocKy || hocKy === 'CA_NAM')
  );

  const filteredList = rawList.filter((s) => {
    if (filterClass !== 'ALL' && s.lop !== filterClass) return false;
    if (filterType === 'MINUS' && s.diem >= 0) return false;
    if (filterType === 'PLUS' && s.diem <= 0) return false;
    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      const matchName = s.hocSinh.toLowerCase().includes(q);
      const matchCriteria = s.tieuChi.toLowerCase().includes(q);
      const matchDesc = s.moTa.toLowerCase().includes(q);
      const matchNguoiGhi = s.nguoiGhi.toLowerCase().includes(q);
      if (!matchName && !matchCriteria && !matchDesc && !matchNguoiGhi) return false;
    }
    return true;
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa bản ghi sự việc này?')) {
      setAppState((prev) => ({
        ...prev,
        listSuViec: prev.listSuViec.filter((s) => s.id !== id),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-700 font-extrabold uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>
              Nhật Ký Sự Việc & Vi Phạm — {hocKy === 'CA_NAM' ? 'Cả năm' : hocKy === 'HK1' ? 'Học kỳ 1' : 'Học kỳ 2'} (Tuần {selectedWeek})
            </span>
          </div>
          <h2 className="font-black text-xl text-slate-800 mt-1">
            Ghi Nhận Nền Nếp, Điểm Danh & Vi Phạm Bán Trú
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lọc chính xác theo Tuần {selectedWeek}. Không cộng dồn từ các tuần khác nhằm bảo đảm tính công bằng.
          </p>
        </div>

        <button
          onClick={onOpenModalViPham}
          className="bg-red-700 hover:bg-red-800 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Ghi nhận sự việc mới</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-500 font-bold">
          <Filter className="w-4 h-4 text-slate-600" />
          <span>Lọc:</span>
        </div>

        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium focus:outline-none focus:ring-1 focus:ring-red-600"
        >
          <option value="ALL">Tất cả 17 Chi đội</option>
          <optgroup label="Trường chính">
            {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Trường chính').map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Phân hiệu">
            {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Phân hiệu').map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </optgroup>
        </select>

        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-md font-bold transition ${
              filterType === 'ALL' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
            }`}
          >
            Tất cả ({rawList.length})
          </button>
          <button
            onClick={() => setFilterType('MINUS')}
            className={`px-3 py-1 rounded-md font-bold transition ${
              filterType === 'MINUS' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Vi phạm ({rawList.filter((s) => s.diem < 0).length})
          </button>
          <button
            onClick={() => setFilterType('PLUS')}
            className={`px-3 py-1 rounded-md font-bold transition ${
              filterType === 'PLUS' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Tuyên dương ({rawList.filter((s) => s.diem > 0).length})
          </button>
        </div>

        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm tên học sinh, tiêu chí, người ghi..."
            className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 text-[11px]">
                <th className="p-3 w-12 text-center">STT</th>
                <th className="p-3">Thời Gian</th>
                <th className="p-3">Chi Đội</th>
                <th className="p-3">Học Sinh / Tập Thể</th>
                <th className="p-3">Tiêu Chí / Hành Vi</th>
                <th className="p-3 text-center">Điểm</th>
                <th className="p-3">Người Ghi</th>
                <th className="p-3 text-center w-16">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    Chưa có sự việc nào phù hợp với bộ lọc trong Tuần {selectedWeek}.
                  </td>
                </tr>
              ) : (
                filteredList.map((sv, idx) => {
                  const isPlus = sv.diem > 0;
                  return (
                    <tr key={sv.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">{sv.thoiGian}</td>
                      <td className="p-3 font-black text-red-700 whitespace-nowrap">
                        Chi đội {sv.lop}
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {sv.hocSinh}
                        {sv.diaDiem && (
                          <span className="text-[10px] text-slate-500 font-normal flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{sv.diaDiem}</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-700">
                        <div className="font-semibold text-slate-900">{sv.tieuChi}</div>
                        {sv.moTa && (
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {sv.moTa}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block font-black text-xs px-2.5 py-1 rounded-full ${
                            isPlus
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {isPlus ? `+${sv.diem}đ` : `${sv.diem}đ`}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 text-[11px] whitespace-nowrap">
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{sv.nguoiGhi}</span>
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(sv.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition"
                          title="Xóa sự việc"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
