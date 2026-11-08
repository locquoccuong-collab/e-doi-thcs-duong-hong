import React, { useState } from 'react';
import { Sliders, PlusCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { AppState, TieuChiItem } from '../types';

interface CauHinhTieuChiViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const CauHinhTieuChiView: React.FC<CauHinhTieuChiViewProps> = ({
  appState,
  setAppState,
}) => {
  const [nhom, setNhom] = useState<string>('Kỷ luật');
  const [ten, setTen] = useState<string>('');
  const [diem, setDiem] = useState<number>(-2);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const handleAddTieuChi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ten.trim()) return;

    const newItem: TieuChiItem = {
      id: Date.now(),
      nhom,
      ten: ten.trim(),
      diem: Number(diem),
    };

    setAppState((prev) => ({
      ...prev,
      listTieuChi: [...prev.listTieuChi, newItem],
    }));

    setTen('');
    setShowAddForm(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa tiêu chí này khỏi danh sách?')) {
      setAppState((prev) => ({
        ...prev,
        listTieuChi: prev.listTieuChi.filter((tc) => tc.id !== id),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-700 font-extrabold uppercase tracking-wide">
            <Sliders className="w-5 h-5 text-red-600" />
            <span>Quy Chuẩn Đánh Giá — Bộ Tiêu Chí Chấm Điểm Thi Đua</span>
          </div>
          <h2 className="font-black text-xl text-slate-800 mt-1">
            Bảng Tiêu Chí Điểm Cộng / Trừ Áp Dụng Cho 17 Chi Đội
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bao gồm đầy đủ các nội dung đặc thù trường PTDTBT: nề nếp bán trú, chuyên cần vùng cao, vệ sinh và búp măng hoa điểm tốt.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-slate-800 hover:bg-slate-900 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showAddForm ? 'Đóng form thêm' : '+ Thêm tiêu chí mới'}</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddTieuChi}
          className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm space-y-4"
        >
          <div className="font-black text-sm text-red-800 uppercase flex items-center space-x-2">
            <PlusCircle className="w-4 h-4 text-red-600" />
            <span>Thêm Tiêu Chí Đánh Giá Mới</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nhóm Tiêu Chí *
              </label>
              <select
                value={nhom}
                onChange={(e) => setNhom(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-600"
              >
                <option value="Chuyên cần">Chuyên cần</option>
                <option value="Tác phong">Tác phong</option>
                <option value="Vệ sinh">Vệ sinh</option>
                <option value="Kỷ luật">Kỷ luật</option>
                <option value="Học tập">Học tập</option>
                <option value="Bán trú">Nề nếp Bán trú</option>
                <option value="Tuyên dương">Tuyên dương / Việc tốt</option>
                <option value="Phong trào">Phong trào Đội</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên Tiêu Chí / Mô Tả Quy Định *
              </label>
              <input
                type="text"
                required
                value={ten}
                onChange={(e) => setTen(e.target.value)}
                placeholder="Ví dụ: Đạt giải nhất hội thao cấp trường..."
                className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Điểm áp dụng (+ hoặc -) *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={diem}
                onChange={(e) => setDiem(parseFloat(e.target.value))}
                className="w-32 border border-slate-300 rounded-lg p-2 text-xs font-black text-red-700 focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black shadow-md"
              >
                Lưu Tiêu Chí
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Criteria Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 text-[11px]">
                <th className="p-3 w-12 text-center">STT</th>
                <th className="p-3 w-36">Nhóm Tiêu Chí</th>
                <th className="p-3">Nội Dung Tiêu Chí</th>
                <th className="p-3 text-center w-32">Mức Điểm Áp Dụng</th>
                <th className="p-3 text-center w-16">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appState.listTieuChi.map((tc, idx) => {
                const isPlus = tc.diem > 0;
                return (
                  <tr key={tc.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-800">
                      <span className="inline-block bg-slate-100 text-slate-800 text-[11px] px-2.5 py-1 rounded-md border border-slate-200">
                        {tc.nhom}
                      </span>
                    </td>
                    <td className="p-3 text-slate-800 font-medium text-sm">{tc.ten}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block font-black text-xs px-2.5 py-0.5 rounded-full ${
                          isPlus
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {isPlus ? `+${tc.diem}đ` : `${tc.diem}đ`}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(tc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Xóa tiêu chí"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
