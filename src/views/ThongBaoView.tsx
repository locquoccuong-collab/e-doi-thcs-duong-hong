import React from 'react';
import { Bell, PlusCircle, Trash2, Clock, Users, AlertTriangle } from 'lucide-react';
import { AppState } from '../types';

interface ThongBaoViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onOpenModalThongBao: () => void;
}

export const ThongBaoView: React.FC<ThongBaoViewProps> = ({
  appState,
  setAppState,
  onOpenModalThongBao,
}) => {
  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa thông báo này?')) {
      setAppState((prev) => ({
        ...prev,
        listThongBao: prev.listThongBao.filter((t) => t.id !== id),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs text-blue-700 font-extrabold uppercase tracking-wide">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Kênh Thông Báo & Chỉ Đạo Công Tác Đội</span>
          </div>
          <h2 className="font-black text-xl text-slate-800 mt-1">
            Truyền Đạt Thông Tin Nhanh Đến GVCN & 17 Chi Đội
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thông báo lịch kiểm tra nền nếp, hoạt động phong trào, phân công đột xuất và thông tin khẩn cấp.
          </p>
        </div>

        <button
          onClick={onOpenModalThongBao}
          className="bg-blue-700 hover:bg-blue-800 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Đăng thông báo mới</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3.5">
        {appState.listThongBao.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center text-slate-400 italic text-xs">
            Chưa có thông báo nào được đăng. Hãy bấm nút phía trên để tạo thông báo mới!
          </div>
        ) : (
          [...appState.listThongBao].reverse().map((tb) => (
            <div
              key={tb.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-3"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        tb.mucDo === 'TỐI KHẨN'
                          ? 'bg-red-600 text-white animate-pulse'
                          : tb.mucDo === 'KHẨN'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {tb.mucDo}
                    </span>
                    <h3 className="font-black text-base text-slate-900 leading-snug">
                      {tb.tieuDe}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(tb.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Xóa thông báo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {tb.noiDung}
              </p>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 gap-2">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tb.thoiGian}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Gửi tới: <b className="text-slate-700">{tb.doiTuong}</b>
                    </span>
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Người đăng: <b>{tb.nguoiDang}</b>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
