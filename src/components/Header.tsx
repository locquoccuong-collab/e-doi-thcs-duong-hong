import React from 'react';
import { Star, Search, Calendar, PlusCircle, User, Menu, X, CheckCircle2, LogOut, RefreshCw, Cloud } from 'lucide-react';
import { SchoolConfig } from '../types';
import { AuthUser } from '../utils/authService';

interface HeaderProps {
  schoolConfig: SchoolConfig;
  hocKy: 'HK1' | 'HK2' | 'CA_NAM';
  setHocKy: (hk: 'HK1' | 'HK2' | 'CA_NAM') => void;
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenModalViPham: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  currentUser?: AuthUser | null;
  onOpenAccountSettings?: () => void;
  onLogout?: () => void;
  syncStatus?: 'SYNCED' | 'SYNCING' | 'OFFLINE' | 'ERROR';
}

export const Header: React.FC<HeaderProps> = ({
  schoolConfig,
  hocKy,
  setHocKy,
  selectedWeek,
  setSelectedWeek,
  searchQuery,
  setSearchQuery,
  onOpenModalViPham,
  mobileMenuOpen,
  setMobileMenuOpen,
  currentUser,
  onOpenAccountSettings,
  onLogout,
  syncStatus = 'SYNCED',
}) => {
  const weeks = Array.from({ length: 34 }, (_, i) => i + 2); // Week 2 to 35

  const roleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'ADMIN (Toàn quyền)', color: 'bg-red-500 text-white border-red-400' };
      case 'MANAGER_PHANHIEU':
      case 'MANAGER':
        return { label: 'QUẢN LÝ PHÂN HIỆU', color: 'bg-sky-400 text-sky-950 border-sky-300' };
      case 'MANAGER_TRUONGCHINH':
        return { label: 'QUẢN LÝ TRƯỜNG CHÍNH', color: 'bg-emerald-400 text-emerald-950 border-emerald-300' };
      case 'TEACHER_CHIDOI':
      default:
        return { label: 'GVCN CHI ĐỘI', color: 'bg-amber-400 text-amber-950 border-amber-300' };
    }
  };

  const badge = roleBadge(currentUser?.role);

  return (
    <header className="bg-gradient-to-r from-[#990000] via-[#C62828] to-[#B71C1C] text-white shadow-lg sticky top-0 z-30 border-b border-red-900/40">
      <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Logo & School Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-red-800/80 text-white transition focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 flex items-center justify-center shadow-md border-2 border-red-800 flex-shrink-0 animate-pulse">
            <Star className="w-6 h-6 fill-red-700 text-red-700 drop-shadow-sm" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg tracking-wider text-white drop-shadow-sm">e-ĐỘI</span>
              <span className="bg-yellow-400 text-red-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shadow-xs">
                Số Hóa Nghiệp Vụ
              </span>
            </div>
            <p className="text-[11px] text-red-100 font-semibold tracking-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {schoolConfig.schoolName.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Center: Search & Period Switcher */}
        <div className="hidden lg:flex items-center space-x-3 flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm học sinh, vi phạm, cờ đỏ, hồ sơ số hóa..."
              className="w-full bg-red-950/50 hover:bg-red-950/70 focus:bg-red-950 text-white placeholder-red-200/70 text-xs rounded-lg pl-8 pr-7 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-red-700/60 transition shadow-inner"
            />
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-red-200" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-red-200 hover:text-white text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Period selector */}
          <div className="flex items-center bg-red-950/70 px-3 py-1.5 rounded-lg border border-red-700/60 text-xs font-medium space-x-2 whitespace-nowrap text-red-100 shadow-sm">
            <Calendar className="w-4 h-4 text-yellow-300" />
            <span className="font-bold text-yellow-200">{schoolConfig.schoolYear}</span>
            <span className="text-red-400">|</span>
            <select
              value={hocKy}
              onChange={(e) => setHocKy(e.target.value as any)}
              className="bg-transparent font-bold text-yellow-300 focus:outline-none cursor-pointer"
            >
              <option value="HK1" className="text-slate-900 bg-white">Học kỳ 1</option>
              <option value="HK2" className="text-slate-900 bg-white">Học kỳ 2</option>
              <option value="CA_NAM" className="text-slate-900 bg-white">Cả năm</option>
            </select>
            <span className="text-red-400">|</span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-transparent font-bold text-yellow-300 focus:outline-none cursor-pointer"
            >
              {weeks.map((w) => (
                <option key={w} value={w} className="text-slate-900 bg-white">
                  Tuần {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Realtime Cloud Sync Badge */}
        <div
          className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition flex-shrink-0"
          title="Đồng bộ Cloud Firestore thời gian thực giữa Trường chính & Phân hiệu (Database: ai-studio-eithcsnghngtrlst-2885bc30-024c-4316-a79e-81e6965830fa)"
        >
          {syncStatus === 'SYNCING' ? (
            <span className="flex items-center space-x-1.5 text-yellow-300 bg-red-950/70 px-2.5 py-0.5 rounded-full border border-yellow-400/60 shadow-xs">
              <RefreshCw className="w-3 h-3 animate-spin text-yellow-400" />
              <span>Đang lưu Cloud...</span>
            </span>
          ) : syncStatus === 'ERROR' ? (
            <span className="flex items-center space-x-1.5 text-red-200 bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-500 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Lỗi Cloud</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 text-emerald-200 bg-red-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/50 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-300"></span>
              <Cloud className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-white font-extrabold text-[11px]">Cloud Realtime</span>
            </span>
          )}
        </div>

        {/* Right: Quick Action & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenModalViPham}
            className="bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-red-950 font-black text-xs px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg shadow-md flex items-center space-x-1.5 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Ghi nhận sự việc</span>
            <span className="sm:hidden">Ghi việc</span>
          </button>

          <button
            onClick={onOpenAccountSettings}
            title="Nhấn để mở Quản lý 05 tài khoản & Khóa PIN bảo mật"
            className="flex items-center space-x-2 bg-red-950/70 hover:bg-red-950 pl-2.5 pr-3 py-1.5 rounded-lg border border-red-700/60 transition cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-full bg-red-800 flex items-center justify-center text-yellow-300 border border-red-600 flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-black text-yellow-300 leading-tight flex items-center space-x-1.5">
                <span className="truncate max-w-[120px]">
                  {currentUser?.displayName || schoolConfig.tptName}
                </span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${badge.color}`}>
                  {currentUser?.role || 'ADMIN'}
                </span>
              </div>
              <div className="text-[10px] text-red-200 leading-tight truncate max-w-[150px]">
                {currentUser?.email || 'locquoccuong@gmail.com'}
              </div>
            </div>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Đăng xuất khỏi hệ thống e-Đội"
              className="p-2 sm:px-2.5 sm:py-1.5 bg-red-950/80 hover:bg-red-900 active:bg-black text-red-200 hover:text-white rounded-lg border border-red-700/60 transition flex items-center space-x-1.5 text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-300" />
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile period selector bar */}
      <div className="lg:hidden px-3 py-2 bg-red-950/80 border-t border-red-800/60 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-2 flex-1">
          <select
            value={hocKy}
            onChange={(e) => setHocKy(e.target.value as any)}
            className="bg-red-900/90 text-yellow-300 font-bold px-2 py-1 rounded border border-red-700 text-xs"
          >
            <option value="HK1" className="text-slate-900 bg-white">HK 1</option>
            <option value="HK2" className="text-slate-900 bg-white">HK 2</option>
            <option value="CA_NAM" className="text-slate-900 bg-white">Cả năm</option>
          </select>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="bg-red-900/90 text-yellow-300 font-bold px-2 py-1 rounded border border-red-700 text-xs"
          >
            {weeks.map((w) => (
              <option key={w} value={w} className="text-slate-900 bg-white">
                Tuần {w}
              </option>
            ))}
          </select>
        </div>
        <div className="relative w-44 sm:w-60">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nhanh..."
            className="w-full bg-red-900/90 text-white placeholder-red-300/80 text-xs rounded px-2 pl-7 py-1 focus:outline-none border border-red-700"
          />
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-red-300" />
        </div>
      </div>
    </header>
  );
};
