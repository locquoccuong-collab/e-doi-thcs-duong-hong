import React, { useState } from 'react';
import {
  School,
  Trophy,
  Share2,
  FolderTree,
  PlusCircle,
  Bell,
  ShieldCheck,
  Award,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Flame,
  ChevronRight,
  TrendingUp,
  Bot,
  Sparkles,
  Target,
  ArrowRight,
  Mountain,
  Building,
  GraduationCap,
  Heart,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { AppState, TabKey, DiemTruongType } from '../types';
import { CLASS_DEFINITIONS } from '../data/initialData';

interface DashboardViewProps {
  appState: AppState;
  hocKy: 'HK1' | 'HK2' | 'CA_NAM';
  selectedWeek: number;
  onSelectTab: (tab: TabKey) => void;
  onOpenModalViPham: () => void;
  onOpenModalThongBao: () => void;
  onOpenModalCoDo: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  appState,
  hocKy,
  selectedWeek,
  onSelectTab,
  onOpenModalViPham,
  onOpenModalThongBao,
  onOpenModalCoDo,
}) => {
  // Location selection filter for dashboard: 'ALL' | 'Trường chính' | 'Phân hiệu'
  const [selectedCampus, setSelectedCampus] = useState<'ALL' | DiemTruongType>('ALL');

  // Filter classes based on selected location
  const relevantClasses =
    selectedCampus === 'ALL'
      ? CLASS_DEFINITIONS
      : CLASS_DEFINITIONS.filter((c) => c.diemTruong === selectedCampus);

  // Student metrics
  const allStudents = appState.listHocSinh || [];
  const relevantStudents =
    selectedCampus === 'ALL'
      ? allStudents
      : allStudents.filter((s) => s.diemTruong === selectedCampus);

  const totalStudents = relevantStudents.length;
  const totalDoiVien = relevantStudents.filter((s) => s.isDoiVien).length;
  const totalBanTru = relevantStudents.filter((s) => s.isBanTru).length;
  const totalHoanThanhRenLuyen = relevantStudents.filter(
    (s) => s.hoanThanhRenLuyen === 'Hoàn thành' || s.hoanThanhRenLuyen === 'Xuất sắc'
  ).length;

  // Actual total students entered across classes
  let tongSiSoThucTe = 0;
  let soLopDaNhap = 0;
  relevantClasses.forEach((c) => {
    const classData = appState.classesData[c.key];
    if (classData?.siso && classData.siso > 0) {
      tongSiSoThucTe += Number(classData.siso);
      soLopDaNhap++;
    }
  });

  // Events of current week for selected campus
  const suViecTuan = appState.listSuViec.filter((s) => {
    if (s.tuan !== selectedWeek) return false;
    if (s.hocKy !== hocKy && hocKy !== 'CA_NAM') return false;
    if (selectedCampus !== 'ALL') {
      const cDef = CLASS_DEFINITIONS.find((c) => c.key === s.lop);
      if (cDef?.diemTruong !== selectedCampus) return false;
    }
    return true;
  });

  // Calculate scores for top class in campus
  const getScore = (classKey: string) => {
    const key = `${appState.schoolConfig.schoolYear}_${hocKy}_W${selectedWeek}_${classKey}`;
    return appState.weeklyScores[key] !== undefined ? appState.weeklyScores[key] : 100;
  };

  const tcClasses = CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Trường chính');
  const phClasses = CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Phân hiệu');

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

  // Compare 2 campuses
  const avgScoreTC = Math.round(
    tcClasses.reduce((acc, c) => acc + getScore(c.key), 0) / tcClasses.length
  );
  const avgScorePH = Math.round(
    phClasses.reduce((acc, c) => acc + getScore(c.key), 0) / phClasses.length
  );

  return (
    <div className="space-y-6">
      {/* Executive Command Header & Campus Switcher */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#990000] via-[#C62828] to-[#B71C1C] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-red-800">
        <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-red-700/60 pb-4 mb-4">
          <div>
            <div className="flex items-center space-x-2 text-yellow-300 text-xs font-black uppercase tracking-wider mb-1">
              <School className="w-4 h-4 text-yellow-300" />
              <span>TRANG CHỦ ĐIỀU HÀNH CÔNG TÁC ĐỘI TNTP HỒ CHÍ MINH</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Liên Đội {appState.schoolConfig.schoolName}
            </h1>
            <p className="text-xs text-red-100 mt-0.5">
              Địa bàn: <b>{appState.schoolConfig.location}</b> • TPT: <b>{appState.schoolConfig.tptName}</b> • Năm học: <b>{appState.schoolConfig.schoolYear}</b>
            </p>
          </div>

          {/* Campus Selector Pill Bar */}
          <div className="flex items-center bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 text-xs font-bold w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedCampus('ALL')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                selectedCampus === 'ALL'
                  ? 'bg-yellow-400 text-red-950 font-black shadow-md'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Toàn trường (17 Chi đội)</span>
            </button>

            <button
              onClick={() => setSelectedCampus('Trường chính')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                selectedCampus === 'Trường chính'
                  ? 'bg-yellow-400 text-red-950 font-black shadow-md'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Trường chính (8 lớp)</span>
            </button>

            <button
              onClick={() => setSelectedCampus('Phân hiệu')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                selectedCampus === 'Phân hiệu'
                  ? 'bg-yellow-400 text-red-950 font-black shadow-md'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>Phân hiệu (9 lớp)</span>
            </button>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onSelectTab('tro-ly-ai')}
            className="bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-red-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition transform hover:-translate-y-0.5"
          >
            <Bot className="w-4 h-4 text-red-950 animate-pulse" />
            <span>Trợ Lý AI Nghiệp Vụ</span>
          </button>

          <button
            onClick={() => onSelectTab('quan-ly-hoc-sinh')}
            className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 transition backdrop-blur-xs"
          >
            <Users className="w-4 h-4 text-yellow-300" />
            <span>Quản Lý Học Sinh & Đội Viên</span>
          </button>

          <button
            onClick={() => onSelectTab('bch-lien-doi')}
            className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 transition backdrop-blur-xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Ban Chỉ Huy Liên Đội</span>
          </button>

          <button
            onClick={() => onSelectTab('thi-dua-tuan')}
            className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 transition backdrop-blur-xs"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Thi Đua Tuần {selectedWeek}</span>
          </button>

          <button
            onClick={() => onSelectTab('ho-so-so-hoa')}
            className="bg-slate-900/60 hover:bg-slate-900/80 text-yellow-300 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 transition border border-yellow-400/40"
          >
            <BookOpen className="w-4 h-4 text-yellow-300" />
            <span>8 Sổ Đội Điện Tử (HD 283)</span>
          </button>
        </div>
      </div>

      {/* Dynamic Key Performance Indicators (Filtered by Campus) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-red-300 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Tổng Học Sinh</span>
            <Users className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1">
            {selectedCampus === 'ALL' ? appState.schoolConfig.projectedStudents : Math.round(appState.schoolConfig.projectedStudents * (relevantClasses.length / 17))}{' '}
            <span className="text-xs text-slate-500 font-semibold">em</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Đã nhập thực tế: <b className="text-slate-800">{tongSiSoThucTe} em</b> ({soLopDaNhap}/{relevantClasses.length} lớp)
          </div>
        </div>

        {/* Metric 2: Chi đội */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Quy Mô Chi Đội</span>
            <School className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {relevantClasses.length} <span className="text-xs text-slate-500 font-semibold">Chi đội</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {selectedCampus === 'ALL' ? 'Trường chính: 8 | Phân hiệu: 9' : selectedCampus}
          </div>
        </div>

        {/* Metric 3: Đội viên */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Số Đội Viên</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {totalDoiVien}{' '}
            <span className="text-xs font-bold text-emerald-600">
              ({totalStudents > 0 ? Math.round((totalDoiVien / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Đeo khăn quàng sinh hoạt Đội
          </div>
        </div>

        {/* Metric 4: Hoàn thành rèn luyện */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Rèn Luyện Đội Viên</span>
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {totalHoanThanhRenLuyen}{' '}
            <span className="text-xs font-bold text-purple-600">
              ({totalStudents > 0 ? Math.round((totalHoanThanhRenLuyen / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Đạt rèn luyện THCS
          </div>
        </div>

        {/* Metric 5: Bán trú */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Nội Trú Bán Trú</span>
            <Heart className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {totalBanTru}{' '}
            <span className="text-xs font-bold text-amber-600">
              ({totalStudents > 0 ? Math.round((totalBanTru / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Ăn ở nội trú tại trường
          </div>
        </div>
      </div>

      {/* Target Progress Indicators (Chỉ tiêu công tác Đội năm học 2026-2027) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-red-600" />
            <h2 className="font-black text-sm text-slate-800 uppercase tracking-wide">
              Tiến Độ Thực Hiện Các Chỉ Tiêu Công Tác Đội Năm Học 2026–2027
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-bold">
            Theo Nghị quyết Đại hội Liên đội
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(appState.listChiTieu || []).map((ct) => {
            const pct = ct.chiTieu > 0 ? Math.min(100, Math.round((ct.hienTai / ct.chiTieu) * 100)) : 100;
            return (
              <div
                key={ct.id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 hover:bg-white hover:shadow-xs transition"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xs text-slate-900 leading-snug">{ct.ten}</h3>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      pct >= 100
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 100 ? 'bg-emerald-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>
                    Hiện tại: <b className="text-slate-800">{ct.hienTai} {ct.donVi}</b>
                  </span>
                  <span>
                    Chỉ tiêu: <b className="text-slate-800">{ct.chiTieu} {ct.donVi}</b>
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 italic">{ct.mucTieu}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campus Comparative Analysis (Trường chính vs Phân hiệu) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="font-black text-sm text-slate-800 uppercase tracking-wide">
              So Sánh Nền Nếp & Thi Đua Giữa 2 Điểm Trường
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-bold">Tuần {selectedWeek} ({hocKy})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trường chính Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="bg-amber-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5" />
                <span>Trường Chính (8 Chi Đội THCS)</span>
              </span>
              <span className="text-xs font-bold text-amber-900">Điểm chuẩn: 100đ</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Quy mô lớp</div>
                <div className="text-xl font-black text-slate-800 mt-0.5">8 lớp</div>
                <div className="text-[10px] text-slate-500">Khối 6, 7, 8, 9</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Điểm TB Tuần</div>
                <div className="text-xl font-black text-red-700 mt-0.5">{avgScoreTC}đ</div>
                <div className="text-[10px] text-emerald-700 font-bold">Xếp loại Tốt</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Dẫn đầu tuần</div>
                <div className="text-lg font-black text-amber-700 mt-0.5">{bestTC?.name}</div>
                <div className="text-[10px] text-red-700 font-bold">{maxScoreTC} điểm 🚩</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              • Duy trì tốt việc truy bài 15 phút đầu giờ và tác phong đồng phục khăn quàng đỏ tại cổng trường.
            </p>
          </div>

          {/* Phân hiệu Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="bg-blue-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1.5">
                <Mountain className="w-3.5 h-3.5" />
                <span>Phân Hiệu (9 Chi Đội THCS - Có 8C)</span>
              </span>
              <span className="text-xs font-bold text-blue-900">Điểm chuẩn: 100đ</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Quy mô lớp</div>
                <div className="text-xl font-black text-slate-800 mt-0.5">9 lớp</div>
                <div className="text-[10px] text-slate-500">Khối 6, 7, 8, 9</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Điểm TB Tuần</div>
                <div className="text-xl font-black text-blue-800 mt-0.5">{avgScorePH}đ</div>
                <div className="text-[10px] text-emerald-700 font-bold">Xếp loại Tốt</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Dẫn đầu tuần</div>
                <div className="text-lg font-black text-blue-800 mt-0.5">{bestPH?.name}</div>
                <div className="text-[10px] text-blue-700 font-bold">{maxScorePH} điểm 🚩</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              • Đẩy mạnh nề nếp ăn ở khu bán trú nội trú, sắp xếp chăn màn và vệ sinh phòng ở trước 7h00 sáng.
            </p>
          </div>
        </div>
      </div>

      {/* Dual Blocks: Notifications & Red Flag Guards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Latest Announcements */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Chỉ đạo & Thông báo gửi GVCN / Chi đội</span>
              </h3>
              <button
                onClick={() => onSelectTab('thong-bao')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Xem tất cả ({appState.listThongBao.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {appState.listThongBao.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-6 text-center">
                  Chưa có thông báo nào được đăng.
                </div>
              ) : (
                appState.listThongBao
                  .slice(-3)
                  .reverse()
                  .map((tb) => (
                    <div
                      key={tb.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1 hover:bg-slate-100/80 transition"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-slate-800 leading-tight">{tb.tieuDe}</span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded whitespace-nowrap ${
                            tb.mucDo === 'TỐI KHẨN'
                              ? 'bg-red-600 text-white'
                              : tb.mucDo === 'KHẨN'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {tb.mucDo}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                        {tb.noiDung}
                      </p>
                      <div className="text-[10px] text-slate-400 flex justify-between items-center pt-1 border-t border-slate-200/60">
                        <span>{tb.thoiGian}</span>
                        <span>
                          Gửi: <b>{tb.doiTuong}</b>
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <button
            onClick={onOpenModalThongBao}
            className="mt-4 w-full py-2 border border-blue-600 text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl transition text-center shadow-xs"
          >
            + Đăng Thông Báo / Chỉ Đạo Mới
          </button>
        </div>

        {/* Right: Active Red Flag Team */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Đội Cờ đỏ Phân công Giám sát</span>
              </h3>
              <button
                onClick={() => onSelectTab('doi-co-do')}
                className="text-xs text-red-600 font-bold hover:underline"
              >
                Xem phân công ({appState.listCoDo.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {appState.listCoDo.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-6 text-center">
                  Chưa có phân công cờ đỏ. Hãy bấm nút dưới để thêm đội viên trực.
                </div>
              ) : (
                appState.listCoDo
                  .slice(-3)
                  .reverse()
                  .map((cd) => (
                    <div
                      key={cd.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs flex justify-between items-center hover:bg-slate-100/80 transition"
                    >
                      <div>
                        <div className="font-bold text-slate-800">
                          {cd.hoTen} <span className="text-red-700 font-extrabold">(Chi đội {cd.lop})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {cd.diemTruong} • {cd.caTruc}
                        </div>
                        <div className="text-[10px] text-slate-400 italic">
                          Nhiệm vụ: {cd.ghiChu || 'Theo dõi nề nếp, trang phục'}
                        </div>
                      </div>
                      <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded border border-red-200 whitespace-nowrap ml-2">
                        {cd.viTri}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>

          <button
            onClick={onOpenModalCoDo}
            className="mt-4 w-full py-2 border border-red-600 text-red-700 hover:bg-red-50 font-bold text-xs rounded-xl transition text-center shadow-xs"
          >
            + Phân Công Đội Cờ Đỏ Mới
          </button>
        </div>
      </div>
    </div>
  );
};
