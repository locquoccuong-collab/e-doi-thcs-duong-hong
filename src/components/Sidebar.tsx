import React from 'react';
import {
  LayoutDashboard,
  Bell,
  AlertTriangle,
  Award,
  Share2,
  Trophy,
  StarHalf,
  Sliders,
  Flag,
  ShieldCheck,
  FolderTree,
  CalendarDays,
  Settings,
  HardDriveDownload,
  School,
  CheckCircle2,
  Bot,
  Sparkles,
  Users,
  FolderOpen,
  Database,
  KeyRound,
} from 'lucide-react';
import { TabKey, SchoolConfig } from '../types';
import { AuthUser } from '../utils/authService';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  badgeSuViecCount: number;
  badgeThongBaoCount: number;
  schoolConfig: SchoolConfig;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser?: AuthUser | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  badgeSuViecCount,
  badgeThongBaoCount,
  schoolConfig,
  isOpenMobile,
  onCloseMobile,
  currentUser,
}) => {
  const handleNavClick = (tab: TabKey) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const navClass = (tab: TabKey, specialColor?: string) => {
    const isActive = currentTab === tab;
    if (isActive) {
      return 'bg-[#C62828] text-white font-bold border-l-4 border-yellow-400 shadow-sm';
    }
    return `text-slate-300 hover:bg-slate-800 hover:text-white ${specialColor || ''}`;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 shadow-2xl transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 custom-scrollbar overflow-y-auto`}
      >
        <div className="p-3 space-y-6">
          {/* Section 1 */}
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>TỔNG QUAN & TÁC NGHIỆP</span>
              <span className="text-yellow-400">● 2026</span>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('ban-lam-viec')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'ban-lam-viec'
                )}`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span className="font-semibold">Bàn làm việc TPT</span>
              </button>

              <button
                onClick={() => handleNavClick('tro-ly-ai')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'tro-ly-ai',
                  'text-yellow-300 font-bold bg-red-950/40 border border-yellow-400/30'
                )}`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Bot className="w-4 h-4 flex-shrink-0 text-yellow-400 animate-pulse" />
                  <span className="truncate">Trợ Lý AI Nghiệp Vụ</span>
                </div>
                <span className="bg-yellow-400 text-red-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shadow-2xs">
                  AI
                </span>
              </button>

              <button
                onClick={() => handleNavClick('thong-bao')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'thong-bao'
                )}`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Bell className="w-4 h-4 flex-shrink-0 text-blue-400" />
                  <span className="font-semibold truncate">Thông báo GVCN & Chi đội</span>
                </div>
                {badgeThongBaoCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {badgeThongBaoCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('su-viec')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'su-viec'
                )}`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                  <span className="font-semibold truncate">Sự việc / Vi phạm / Tuyên dương</span>
                </div>
                {badgeSuViecCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {badgeSuViecCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('guong-tot')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'guong-tot'
                )}`}
              >
                <Award className="w-4 h-4 flex-shrink-0 text-yellow-400" />
                <span className="font-semibold">Cổng Người tốt Việc tốt</span>
              </button>

              <button
                onClick={() => handleNavClick('bao-cao-zalo')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'bao-cao-zalo',
                  'text-emerald-400 font-semibold'
                )}`}
              >
                <Share2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>Báo Zalo Điểm danh / Nề nếp</span>
              </button>
            </nav>
          </div>

          {/* Section 2 */}
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-3 mb-2">
              THI ĐUA TUẦN & KHEN THƯỞNG
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('thi-dua-tuan')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'thi-dua-tuan'
                )}`}
              >
                <Trophy className="w-4 h-4 flex-shrink-0 text-yellow-400" />
                <span className="font-semibold">Thi đua Tuần (Tuần 2 - 35)</span>
              </button>

              <button
                onClick={() => handleNavClick('thi-dua-khen-thuong')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'thi-dua-khen-thuong'
                )}`}
              >
                <StarHalf className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span className="font-semibold">Tuyên dương & Cờ Luân Lưu</span>
              </button>

              <button
                onClick={() => handleNavClick('cau-hinh-tieu-chi')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'cau-hinh-tieu-chi'
                )}`}
              >
                <Sliders className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="font-semibold">Cấu hình Tiêu chí chấm</span>
              </button>
            </nav>
          </div>

          {/* Section 3 */}
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>TỔ CHỨC ĐỘI (17 CHI ĐỘI)</span>
              <span className="text-[9px] bg-red-900/80 text-yellow-300 px-1 rounded">2 Điểm</span>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('quan-ly-hoc-sinh')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'quan-ly-hoc-sinh'
                )}`}
              >
                <Users className="w-4 h-4 flex-shrink-0 text-yellow-300" />
                <span className="font-semibold">Học sinh & Đội viên</span>
              </button>

              <button
                onClick={() => handleNavClick('ren-luyen-doi-vien')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'ren-luyen-doi-vien',
                  'text-yellow-300 font-bold'
                )}`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Award className="w-4 h-4 flex-shrink-0 text-yellow-400" />
                  <span className="font-semibold truncate">Rèn luyện Đội viên</span>
                </div>
                <span className="bg-yellow-400 text-red-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  Mới
                </span>
              </button>

              <button
                onClick={() => handleNavClick('chi-doi')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'chi-doi'
                )}`}
              >
                <Flag className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span className="font-semibold">17 Chi đội THCS (2 Điểm)</span>
              </button>

              <button
                onClick={() => handleNavClick('bch-lien-doi')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'bch-lien-doi'
                )}`}
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span className="font-semibold">Ban Chỉ huy Liên đội</span>
              </button>

              <button
                onClick={() => handleNavClick('doi-co-do')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'doi-co-do'
                )}`}
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span className="font-semibold">Phân công Đội Cờ đỏ</span>
              </button>
            </nav>
          </div>

          {/* Section 4 */}
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>HỒ SƠ SỐ HÓA & KẾ HOẠCH</span>
              <span className="text-[9px] text-yellow-300 font-bold">HD 283</span>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('ho-so-so-hoa')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'ho-so-so-hoa',
                  'text-yellow-300 font-semibold'
                )}`}
              >
                <FolderTree className="w-4 h-4 flex-shrink-0 text-yellow-300" />
                <span>8 Nhóm Hồ Sơ Số Hóa Đội</span>
              </button>

              <button
                onClick={() => handleNavClick('kho-ho-so-chi-doi')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'kho-ho-so-chi-doi',
                  'text-rose-300 font-bold'
                )}`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <FolderOpen className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span className="truncate">Kho Hồ Sơ 17 Chi Đội</span>
                </div>
                <span className="bg-rose-900/80 text-yellow-300 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  8 Thư mục
                </span>
              </button>

              <button
                onClick={() => handleNavClick('lich-cong-tac')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'lich-cong-tac'
                )}`}
              >
                <CalendarDays className="w-4 h-4 flex-shrink-0 text-blue-400" />
                <span className="font-semibold">Kế hoạch & Lịch công tác</span>
              </button>

              <button
                onClick={() => handleNavClick('cau-hinh-don-vi')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'cau-hinh-don-vi'
                )}`}
              >
                <Settings className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="font-semibold">Cấu hình Trường & Đơn vị</span>
              </button>

              <button
                onClick={() => handleNavClick('quan-tri-du-lieu')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                  'quan-tri-du-lieu',
                  'text-emerald-300 font-bold bg-emerald-950/40 border border-emerald-500/30'
                )}`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Database className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span className="truncate">Quản Trị & Sao Lưu 3 Lớp</span>
                </div>
                <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shadow-2xs">
                  3 Lớp
                </span>
              </button>

              {currentUser?.role === 'ADMIN' && (
                <button
                  onClick={() => handleNavClick('quan-ly-tai-khoan')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition text-left ${navClass(
                    'quan-ly-tai-khoan',
                    'text-amber-300 font-bold bg-amber-950/40 border border-amber-500/30'
                  )}`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <KeyRound className="w-4 h-4 flex-shrink-0 text-amber-400" />
                    <span className="truncate">Bảo Mật & 05 Tài Khoản</span>
                  </div>
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shadow-2xs">
                    05/05
                  </span>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-auto p-3 border-t border-slate-800 text-[11px] text-slate-400 text-center leading-relaxed bg-slate-950/60">
          <div className="font-bold text-slate-300">{schoolConfig.schoolName}</div>
          <div className="text-[10px] text-slate-400">
            TPT: <span className="text-yellow-400 font-bold">{schoolConfig.tptName}</span>
          </div>
          <div className="mt-1 flex items-center justify-center space-x-1 text-[10px] text-emerald-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Dữ liệu lưu an toàn trên trình duyệt</span>
          </div>
        </div>
      </aside>
    </>
  );
};
