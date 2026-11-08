import React from 'react';
import { Award, PlusCircle, Star, Heart, CheckCircle2, Sparkles, MapPin } from 'lucide-react';
import { AppState } from '../types';

interface GuongTotViewProps {
  appState: AppState;
  onOpenModalViPham: () => void;
}

export const GuongTotView: React.FC<GuongTotViewProps> = ({ appState, onOpenModalViPham }) => {
  const guongTotList = appState.listSuViec.filter((s) => s.diem > 0);

  // Class leaderboard for good deeds
  const classCount: Record<string, number> = {};
  guongTotList.forEach((g) => {
    classCount[g.lop] = (classCount[g.lop] || 0) + 1;
  });
  const topClasses = Object.entries(classCount).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-700 font-extrabold uppercase tracking-wide">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Cổng Tuyên Dương — Người Tốt Việc Tốt & Búp Măng Xinh</span>
          </div>
          <h2 className="font-black text-xl text-slate-800 mt-1">
            Gương Sáng Đội Viên Liên Đội THCS Đường Hồng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tuyên dương các hành động đẹp: nhặt được của rơi trả người mất, đôi bạn cùng tiến, giúp đỡ bạn bán trú khó khăn.
          </p>
        </div>

        <button
          onClick={onOpenModalViPham}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Tuyên dương việc tốt mới</span>
        </button>
      </div>

      {/* Top Banner stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-xl shadow-sm">
          <div className="text-emerald-100 text-xs font-bold uppercase">Tổng Lượt Biểu Dương</div>
          <div className="text-3xl font-black mt-1 flex items-center space-x-2">
            <span>{guongTotList.length}</span>
            <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />
          </div>
          <div className="text-[11px] text-emerald-100 mt-1">Hành động đẹp trong toàn Liên đội</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-4 rounded-xl shadow-sm">
          <div className="text-amber-100 text-xs font-bold uppercase">Chi Đội Đi Đầu Phong Trào</div>
          <div className="text-2xl font-black mt-1">
            {topClasses.length > 0 ? `Chi đội ${topClasses[0][0]}` : 'Đang cập nhật'}
          </div>
          <div className="text-[11px] text-amber-100 mt-1">
            {topClasses.length > 0 ? `${topClasses[0][1]} lượt biểu dương` : 'Chưa có dữ liệu'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-xl shadow-sm">
          <div className="text-blue-100 text-xs font-bold uppercase">Ý Nghĩa Phong Trào</div>
          <div className="text-sm font-bold mt-1.5 leading-snug">
            "Nghìn việc tốt nở hoa thơm ngát"
          </div>
          <div className="text-[11px] text-blue-100 mt-1">Học tập và làm theo 5 điều Bác Hồ dạy</div>
        </div>
      </div>

      {/* List of Good Deeds */}
      {guongTotList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 italic text-xs space-y-3">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <p>Chưa có hành động việc tốt nào được ghi nhận với điểm cộng (+).</p>
          <p className="text-slate-500">
            Hãy bấm vào nút <b>"+ Tuyên dương việc tốt mới"</b> để ghi nhận các tấm gương học sinh tiêu biểu!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guongTotList.map((g) => (
            <div
              key={g.id}
              className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-4 hover:shadow-md transition flex flex-col justify-between space-y-3 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100/60 rounded-bl-full pointer-events-none" />

              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <h3 className="font-black text-sm text-emerald-900 leading-tight">{g.hocSinh}</h3>
                    <span className="text-xs font-bold text-red-700">Chi đội {g.lop}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>+{g.diem}đ</span>
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 mt-2">
                  {g.tieuChi}
                </div>

                {g.moTa && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed italic">
                    "{g.moTa}"
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between items-center">
                <span>Tuần {g.tuan} • {g.thoiGian}</span>
                <span className="font-semibold text-slate-500">Ghi nhận: {g.nguoiGhi}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
