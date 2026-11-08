import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Printer,
  FileSpreadsheet,
  Save,
  RotateCcw,
  Sparkles,
  Edit3,
  School,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { AppState, DiemTruongType } from '../types';
import { CLASS_DEFINITIONS } from '../data/initialData';
import { exportThiDuaCSV } from '../utils/storage';

interface ThiDuaTuanViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  hocKy: 'HK1' | 'HK2' | 'CA_NAM';
  selectedWeek: number;
  onOpenEditChiDoi: (classKey: string) => void;
  calculateXepLoai: (score: number) => { text: string; bgClass: string; textClass: string };
}

export const ThiDuaTuanView: React.FC<ThiDuaTuanViewProps> = ({
  appState,
  setAppState,
  hocKy,
  selectedWeek,
  onOpenEditChiDoi,
  calculateXepLoai,
}) => {
  // Temporary score edit state for current week
  const [localScores, setLocalScores] = useState<Record<string, number>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load scores for this specific week
  useEffect(() => {
    const scores: Record<string, number> = {};
    CLASS_DEFINITIONS.forEach((c) => {
      const key = `${appState.schoolConfig.schoolYear}_${hocKy}_W${selectedWeek}_${c.key}`;
      scores[c.key] = appState.weeklyScores[key] !== undefined ? appState.weeklyScores[key] : 100;
    });
    setLocalScores(scores);
  }, [appState.schoolConfig.schoolYear, hocKy, selectedWeek, appState.weeklyScores]);

  // Events of this week
  const suViecTuan = appState.listSuViec.filter(
    (s) => s.tuan === selectedWeek && (s.hocKy === hocKy || hocKy === 'CA_NAM')
  );

  const handleScoreChange = (classKey: string, val: string) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 100) num = 100;
    setLocalScores((prev) => ({ ...prev, [classKey]: num }));
  };

  const handleSaveAllScores = () => {
    const updatedWeeklyScores = { ...appState.weeklyScores };
    CLASS_DEFINITIONS.forEach((c) => {
      const key = `${appState.schoolConfig.schoolYear}_${hocKy}_W${selectedWeek}_${c.key}`;
      updatedWeeklyScores[key] = localScores[c.key] !== undefined ? localScores[c.key] : 100;
    });

    setAppState((prev) => ({
      ...prev,
      weeklyScores: updatedWeeklyScores,
    }));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetTo100 = () => {
    if (window.confirm(`Bạn có chắc muốn đặt lại tất cả 17 Chi đội về 100 điểm chuẩn cho Tuần ${selectedWeek}?`)) {
      const resetObj: Record<string, number> = {};
      CLASS_DEFINITIONS.forEach((c) => {
        resetObj[c.key] = 100;
      });
      setLocalScores(resetObj);
    }
  };

  const handleAutoApplyEvents = () => {
    // 100 base minus/plus events
    const updated: Record<string, number> = {};
    CLASS_DEFINITIONS.forEach((c) => {
      const events = suViecTuan.filter((s) => s.lop === c.key);
      let sumDelta = 0;
      events.forEach((s) => (sumDelta += Number(s.diem || 0)));
      const finalScore = Math.max(0, Math.min(100, 100 + sumDelta));
      updated[c.key] = finalScore;
    });
    setLocalScores(updated);
  };

  const diemTruongs: DiemTruongType[] = ['Trường chính', 'Phân hiệu'];

  return (
    <div className="space-y-6">
      {/* View Header with actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-700 font-extrabold uppercase tracking-wide">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>
              Bảng Thi Đua Nền Nếp Chi Đội — {hocKy === 'CA_NAM' ? 'Cả năm' : hocKy === 'HK1' ? 'Học kỳ 1' : 'Học kỳ 2'} (Tuần {selectedWeek})
            </span>
          </div>
          <h2 className="font-black text-lg text-slate-800 mt-1">
            Đủ 17 Chi đội THCS (Trường chính 8 lớp | Phân hiệu 9 lớp)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Điểm số lưu độc lập mỗi tuần. Thầy/Cô có thể nhập điểm thủ công, đồng bộ vi phạm tự động hoặc xuất in báo cáo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print w-full md:w-auto">
          {saveSuccess && (
            <span className="flex items-center space-x-1 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Đã lưu điểm Tuần {selectedWeek}!</span>
            </span>
          )}

          <button
            onClick={handleAutoApplyEvents}
            title="Tính điểm từ các sự việc đã ghi nhận trong tuần"
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs px-3 py-2 rounded-lg border border-amber-300 shadow-xs flex items-center space-x-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Đồng bộ từ sự việc</span>
          </button>

          <button
            onClick={handleResetTo100}
            title="Đặt lại 100 điểm cho tất cả các lớp"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-lg border border-slate-300 shadow-xs flex items-center space-x-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Về 100đ</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In bảng điểm</span>
          </button>

          <button
            onClick={() =>
              exportThiDuaCSV(appState, hocKy, selectedWeek, localScores, calculateXepLoai)
            }
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={handleSaveAllScores}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-lg shadow-md flex items-center space-x-1.5 transition"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Điểm Tuần {selectedWeek}</span>
          </button>
        </div>
      </div>

      {/* Render 2 Campus Blocks */}
      {diemTruongs.map((dt) => {
        const classes = CLASS_DEFINITIONS.filter((c) => c.diemTruong === dt);

        return (
          <div
            key={dt}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print-card"
          >
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-3 font-bold text-xs flex justify-between items-center border-b border-slate-700">
              <span className="flex items-center space-x-2">
                <School className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-extrabold uppercase tracking-wide">
                  {dt} ({classes.length} CHI ĐỘI THCS)
                </span>
              </span>
              <span className="text-[11px] text-slate-300">
                Khung điểm chuẩn: <b className="text-yellow-400">100đ</b> | Nhập từ 0 - 100đ
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 text-[11px]">
                    <th className="p-3 w-12 text-center">STT</th>
                    <th className="p-3">Chi đội</th>
                    <th className="p-3">GV Phụ trách (GVCN)</th>
                    <th className="p-3 text-center">Sĩ số</th>
                    <th className="p-3 text-center">Cộng / Trừ Tuần {selectedWeek}</th>
                    <th className="p-3 w-36 text-center">Điểm Tổng Tuần</th>
                    <th className="p-3 text-center">Xếp loại</th>
                    <th className="p-3 text-center no-print">Sửa lớp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classes.map((c, idx) => {
                    const classObj = appState.classesData[c.key] || c;
                    const suViecOfClass = suViecTuan.filter((s) => s.lop === c.key);
                    let sumDelta = 0;
                    suViecOfClass.forEach((s) => (sumDelta += Number(s.diem || 0)));

                    const score = localScores[c.key] !== undefined ? localScores[c.key] : 100;
                    const xl = calculateXepLoai(score);

                    return (
                      <tr key={c.key} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3">
                          <span className="font-black text-slate-800 text-sm">{c.name}</span>
                          <span className="text-[10px] text-slate-400 block">Khối {c.grade}</span>
                        </td>
                        <td className="p-3 text-slate-700">
                          {classObj.gvcn ? (
                            <span className="font-semibold text-slate-800">{classObj.gvcn}</span>
                          ) : (
                            <span className="text-slate-400 italic">Chưa cập nhật GVCN</span>
                          )}
                          {classObj.chiDoiTruong && (
                            <div className="text-[10px] text-slate-500">
                              CĐT: {classObj.chiDoiTruong}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-700">
                          {classObj.siso ? (
                            <span>{classObj.siso} em</span>
                          ) : (
                            <span className="text-slate-400 italic font-normal">--</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`font-black text-xs ${
                              sumDelta > 0
                                ? 'text-emerald-600'
                                : sumDelta < 0
                                ? 'text-red-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {sumDelta > 0 ? `+${sumDelta}đ` : sumDelta < 0 ? `${sumDelta}đ` : '0đ'}
                          </span>
                          {suViecOfClass.length > 0 && (
                            <span className="text-[10px] text-slate-400 block">
                              ({suViecOfClass.length} vụ việc)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={score}
                              onChange={(e) => handleScoreChange(c.key, e.target.value)}
                              className="w-20 text-center font-black text-red-700 text-sm bg-red-50/50 hover:bg-white focus:bg-white border border-red-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                            <span className="text-slate-400 text-xs">/100</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${xl.bgClass} ${xl.textClass}`}
                          >
                            {xl.text}
                          </span>
                        </td>
                        <td className="p-3 text-center no-print">
                          <button
                            onClick={() => onOpenEditChiDoi(c.key)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition"
                            title="Chỉnh sửa GVCN & Sĩ số"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Print Signature Footer (only visible when printed) */}
      <div className="hidden print:block pt-8 text-xs text-slate-900 border-t mt-8">
        <div className="grid grid-cols-2 text-center">
          <div>
            <div className="font-bold">ĐẠI DIỆN ĐỘI CỜ ĐỎ</div>
            <div className="text-[10px] italic mt-1">(Ký, ghi rõ họ tên)</div>
            <div className="h-16" />
          </div>
          <div>
            <div className="font-bold">TỔNG PHỤ TRÁCH ĐỘI</div>
            <div className="text-[10px] italic mt-1">(Ký, ghi rõ họ tên)</div>
            <div className="h-16" />
            <div className="font-black text-sm">{appState.schoolConfig.tptName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
