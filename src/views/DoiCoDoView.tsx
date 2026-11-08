import React, { useState } from 'react';
import {
  ShieldCheck,
  PlusCircle,
  Trash2,
  Printer,
  MapPin,
  Clock,
  School,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { AppState, CoDoItem, DiemTruongType } from '../types';
import { ModalEditCoDo } from '../components/modals/ModalEditCoDo';

interface DoiCoDoViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onOpenModalCoDo: () => void;
}

export const DoiCoDoView: React.FC<DoiCoDoViewProps> = ({
  appState,
  setAppState,
  onOpenModalCoDo,
}) => {
  const [filterCampus, setFilterCampus] = useState<string>('ALL');
  const [editingCoDo, setEditingCoDo] = useState<CoDoItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const filteredList = appState.listCoDo.filter((cd) => {
    if (filterCampus !== 'ALL' && cd.diemTruong !== filterCampus) return false;
    return true;
  });

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa phân công trực của đội viên "${name}"?`)) {
      setAppState((prev) => ({
        ...prev,
        listCoDo: prev.listCoDo.filter((cd) => cd.id !== id),
      }));
      showToast(`Đã xóa phân công trực của đội viên "${name}"!`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-700 font-extrabold uppercase tracking-wide">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Đội Cờ Đỏ Liên Đội — Giám Sát Nền Nếp & Bán Trú</span>
          </div>
          <h2 className="font-black text-xl text-slate-800 mt-1">
            Phân Công Ca Trực Đồng Bộ Tại 2 Điểm Trường
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Đội viên cờ đỏ các Chi đội tham gia chấm điểm độc lập tại Cổng trường, Giờ truy bài và Khu nội trú bán trú.
          </p>
        </div>

        <div className="flex items-center space-x-2 no-print">
          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>In lịch trực</span>
          </button>

          <button
            onClick={onOpenModalCoDo}
            className="bg-red-700 hover:bg-red-800 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Thêm Đội viên trực</span>
          </button>
        </div>
      </div>

      {/* Filter campus pills */}
      <div className="flex items-center space-x-2 text-xs no-print">
        <span className="font-bold text-slate-500">Điểm trường:</span>
        <button
          onClick={() => setFilterCampus('ALL')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            filterCampus === 'ALL'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white border text-slate-700 hover:bg-slate-50'
          }`}
        >
          Cả 2 Điểm Trường ({appState.listCoDo.length})
        </button>
        <button
          onClick={() => setFilterCampus('Trường chính')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            filterCampus === 'Trường chính'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border text-slate-700 hover:bg-slate-50'
          }`}
        >
          Trường chính ({appState.listCoDo.filter((c) => c.diemTruong === 'Trường chính').length})
        </button>
        <button
          onClick={() => setFilterCampus('Phân hiệu')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            filterCampus === 'Phân hiệu'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border text-slate-700 hover:bg-slate-50'
          }`}
        >
          Phân hiệu ({appState.listCoDo.filter((c) => c.diemTruong === 'Phân hiệu').length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 text-[11px]">
                <th className="p-3 w-12 text-center">STT</th>
                <th className="p-3">Họ Tên Đội Viên</th>
                <th className="p-3">Chi Đội</th>
                <th className="p-3">Điểm Trường</th>
                <th className="p-3">Ca Trực</th>
                <th className="p-3">Vị Trí Phân Công</th>
                <th className="p-3">Nhiệm Vụ / Ghi Chú</th>
                <th className="p-3 text-center w-16 no-print">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    Chưa có lịch trực Cờ đỏ nào. Hãy bấm <b>"+ Thêm Đội viên trực"</b> để tạo phân công.
                  </td>
                </tr>
              ) : (
                filteredList.map((cd, idx) => (
                  <tr key={cd.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 text-sm">{cd.hoTen}</td>
                    <td className="p-3 font-black text-red-700">Chi đội {cd.lop}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          cd.diemTruong === 'Trường chính'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}
                      >
                        {cd.diemTruong}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">{cd.caTruc}</span>
                          {cd.gioTruc && (
                            <span className="text-[10px] text-slate-500 block font-mono">
                              {cd.gioTruc}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      <span className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                        <span>{cd.viTri}</span>
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-[11px] leading-relaxed">
                      {cd.nhiemVu && (
                        <div className="font-semibold text-slate-800 mb-0.5">
                          {cd.nhiemVu}
                        </div>
                      )}
                      <div className="text-slate-500">
                        {cd.ghiChu || (!cd.nhiemVu ? '--' : '')}
                      </div>
                    </td>
                    <td className="p-3 text-center no-print">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setEditingCoDo(cd)}
                          className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition cursor-pointer"
                          title="Sửa phân công trực"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cd.id, cd.hoTen)}
                          className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition cursor-pointer"
                          title="Xóa phân công"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating notification toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-scale-up">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 text-xs font-bold text-white ${
              toastMessage.type === 'success' ? 'bg-emerald-700' : 'bg-red-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-200" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 hover:bg-white/20 p-0.5 rounded text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa phân công cờ đỏ */}
      <ModalEditCoDo
        isOpen={editingCoDo !== null}
        onClose={() => setEditingCoDo(null)}
        coDoItem={editingCoDo}
        appState={appState}
        setAppState={setAppState}
        onNotify={(msg, type) => showToast(msg, type)}
      />
    </div>
  );
};
