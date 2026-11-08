import React from 'react';
import { Award, Trophy, Star, Medal, School, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppState } from '../types';
import { CLASS_DEFINITIONS } from '../data/initialData';

interface KhenThuongViewProps {
  appState: AppState;
  hocKy: 'HK1' | 'HK2' | 'CA_NAM';
  selectedWeek: number;
  calculateXepLoai: (score: number) => { text: string; bgClass: string; textClass: string };
}

export const KhenThuongView: React.FC<KhenThuongViewProps> = ({
  appState,
  hocKy,
  selectedWeek,
  calculateXepLoai,
}) => {
  const tcClasses = CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Trường chính');
  const phClasses = CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Phân hiệu');

  const getScore = (classKey: string) => {
    const key = `${appState.schoolConfig.schoolYear}_${hocKy}_W${selectedWeek}_${classKey}`;
    return appState.weeklyScores[key] !== undefined ? appState.weeklyScores[key] : 100;
  };

  // Find best for each campus
  let bestTC = tcClasses[0];
  let maxScoreTC = -1;
  tcClasses.forEach((c) => {
    const s = getScore(c.key);
    if (s > maxScoreTC) {
      maxScoreTC = s;
      bestTC = c;
    }
  });

  let bestPH = phClasses[0];
  let maxScorePH = -1;
  phClasses.forEach((c) => {
    const s = getScore(c.key);
    if (s > maxScorePH) {
      maxScorePH = s;
      bestPH = c;
    }
  });

  // Overall ranking of 17 classes
  const allRanked = [...CLASS_DEFINITIONS].map((c) => ({
    ...c,
    classObj: appState.classesData[c.key] || c,
    score: getScore(c.key),
  })).sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 text-xs text-red-700 font-extrabold uppercase tracking-wide">
          <Award className="w-5 h-5 text-yellow-500" />
          <span>
            Tuyên Dương Chi Đội Dẫn Đầu — {hocKy === 'CA_NAM' ? 'Cả năm' : hocKy === 'HK1' ? 'Học kỳ 1' : 'Học kỳ 2'} (Tuần {selectedWeek})
          </span>
        </div>
        <h2 className="font-black text-xl text-slate-800 mt-1">
          Lễ Trao Cờ Luân Lưu Đầu Tuần & Bảng Xếp Hạng Toàn Trường
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tuyên dương các Chi đội xuất sắc nhất của 2 điểm trường trong tiết Sinh hoạt dưới cờ thứ Hai hàng tuần.
        </p>
      </div>

      {/* 2 Big Spotlight Cards for Campus Winners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trường chính Spotlight */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 text-white shadow-xl border-4 border-yellow-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="bg-black/30 backdrop-blur-xs text-yellow-200 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1.5 border border-yellow-300/40">
              <Trophy className="w-3.5 h-3.5 text-yellow-300" />
              <span>Dẫn Đầu Trường Chính (8 Chi đội)</span>
            </span>
            <span className="text-3xl">🚩</span>
          </div>

          <div className="my-6 text-center">
            <div className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md">
              {bestTC?.name}
            </div>
            <div className="text-sm font-semibold text-amber-100 mt-2">
              Khối {bestTC?.grade} • Trường chính
            </div>
            <div className="mt-3 inline-block bg-white/20 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/30 text-white font-black text-2xl shadow-inner">
              {maxScoreTC} <span className="text-xs font-bold text-amber-200">/ 100 điểm</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20 text-xs text-amber-100 flex justify-between items-center">
            <div>
              GVCN: <b className="text-white">{appState.classesData[bestTC?.key]?.gvcn || 'Chưa cập nhật'}</b>
            </div>
            <div className="font-bold text-yellow-200 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nhận Cờ Luân Lưu</span>
            </div>
          </div>
        </div>

        {/* Phân hiệu Spotlight */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-700 rounded-3xl p-6 text-white shadow-xl border-4 border-sky-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="bg-black/30 backdrop-blur-xs text-sky-200 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1.5 border border-sky-300/40">
              <Trophy className="w-3.5 h-3.5 text-sky-200" />
              <span>Dẫn Đầu Phân Hiệu (9 Chi đội)</span>
            </span>
            <span className="text-3xl">🚩</span>
          </div>

          <div className="my-6 text-center">
            <div className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md">
              {bestPH?.name}
            </div>
            <div className="text-sm font-semibold text-sky-100 mt-2">
              Khối {bestPH?.grade} • Phân hiệu (vùng cao)
            </div>
            <div className="mt-3 inline-block bg-white/20 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/30 text-white font-black text-2xl shadow-inner">
              {maxScorePH} <span className="text-xs font-bold text-sky-200">/ 100 điểm</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20 text-xs text-sky-100 flex justify-between items-center">
            <div>
              GVCN: <b className="text-white">{appState.classesData[bestPH?.key]?.gvcn || 'Chưa cập nhật'}</b>
            </div>
            <div className="font-bold text-sky-200 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nhận Cờ Luân Lưu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Leaderboard Table (17 Chi đội) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <h3 className="font-bold text-xs uppercase tracking-wider flex items-center space-x-2">
            <Medal className="w-4 h-4 text-yellow-400" />
            <span>Bảng Xếp Hạng Thi Đua Toàn Trường (17 Chi Đội)</span>
          </h3>
          <span className="text-[11px] text-slate-300">
            Tuần {selectedWeek} — {hocKy === 'CA_NAM' ? 'Cả năm' : hocKy}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-extrabold border-b text-[11px]">
                <th className="p-3 text-center w-16">Thứ Hạng</th>
                <th className="p-3">Chi Đội</th>
                <th className="p-3">Điểm Trường</th>
                <th className="p-3">GV Phụ trách (GVCN)</th>
                <th className="p-3 text-center">Sĩ số</th>
                <th className="p-3 text-center">Điểm Tuần {selectedWeek}</th>
                <th className="p-3 text-center">Xếp Loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allRanked.map((c, idx) => {
                const xl = calculateXepLoai(c.score);
                const isGold = idx === 0;
                const isSilver = idx === 1;
                const isBronze = idx === 2;

                return (
                  <tr
                    key={c.key}
                    className={`hover:bg-slate-50 transition ${
                      isGold
                        ? 'bg-amber-50/60 font-semibold'
                        : isSilver
                        ? 'bg-slate-50 font-semibold'
                        : isBronze
                        ? 'bg-orange-50/40 font-semibold'
                        : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      {isGold ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-xs">
                          🥇 1
                        </span>
                      ) : isSilver ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black text-xs shadow-xs">
                          🥈 2
                        </span>
                      ) : isBronze ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-black text-xs shadow-xs">
                          🥉 3
                        </span>
                      ) : (
                        <span className="font-bold text-slate-500">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-black text-slate-900 text-sm">{c.name}</span>
                      <span className="text-[10px] text-slate-400 block">Khối {c.grade}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.diemTruong === 'Trường chính'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {c.diemTruong}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">
                      {c.classObj.gvcn || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                    </td>
                    <td className="p-3 text-center font-medium text-slate-700">
                      {c.classObj.siso ? `${c.classObj.siso} em` : '--'}
                    </td>
                    <td className="p-3 text-center font-black text-sm text-red-700">
                      {c.score} <span className="text-slate-400 text-xs font-normal">/100</span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${xl.bgClass} ${xl.textClass}`}
                      >
                        {xl.text}
                      </span>
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
