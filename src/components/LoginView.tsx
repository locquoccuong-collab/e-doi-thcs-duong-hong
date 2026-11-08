import React, { useState } from 'react';
import {
  Star,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  School,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import {
  AuthUser,
  authenticateUser,
  authenticateWithGoogle,
  loadAuthorizedUsers,
  DEFAULT_INITIAL_PASSWORD,
} from '../utils/authService';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [emailOrUsername, setEmailOrUsername] = useState<string>('locquoccuong@gmail.com');
  const [password, setPassword] = useState<string>(DEFAULT_INITIAL_PASSWORD);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConsoleGuide, setShowConsoleGuide] = useState<boolean>(false);
  const [selectedQuickAccount, setSelectedQuickAccount] = useState<string>('locquoccuong@gmail.com');

  const authorizedUsers = loadAuthorizedUsers();

  const handleSelectQuickAccount = (u: AuthUser) => {
    setSelectedQuickAccount(u.email);
    setEmailOrUsername(u.email);
    setPassword(DEFAULT_INITIAL_PASSWORD);
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await authenticateUser(emailOrUsername, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.message);
        if (res.requiresFirebaseConsoleHelp) {
          setShowConsoleGuide(true);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra trong quá trình đăng nhập.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await authenticateWithGoogle();
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập Google thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex flex-col justify-center items-center p-4 selection:bg-yellow-400 selection:text-red-950">
      {/* Background glow effects */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-900/30 flex flex-col md:flex-row">
        {/* Left Side: Brand & School Heritage */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#990000] via-[#B71C1C] to-[#880E4F] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg border-2 border-red-900">
                <Star className="w-7 h-7 fill-red-800 text-red-800" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-2xl tracking-wider text-white">e-ĐỘI</span>
                  <span className="bg-yellow-400 text-red-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                    Số Hóa 2026
                  </span>
                </div>
                <div className="text-[11px] text-red-200 font-bold uppercase tracking-wider">
                  Trợ Lý Số TPT Đội
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-red-800/60">
              <h2 className="text-lg font-black text-yellow-300 leading-snug">
                TRƯỜNG PTDTBT THCS ĐƯỜNG HỒNG
              </h2>
              <p className="text-xs text-red-100 mt-1 leading-relaxed">
                Hệ thống quản lý dùng chung 17 Chi đội, 332 học sinh, thi đua nề nếp bán trú giữa <b>Trường chính</b> và <b>Phân hiệu</b>.
              </p>
            </div>

            {/* Quota Badge */}
            <div className="p-3.5 bg-red-950/60 rounded-2xl border border-red-700/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-yellow-300 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Bảo mật hệ thống:</span>
                </span>
                <span className="bg-amber-400 text-red-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  05 Tài khoản
                </span>
              </div>
              <p className="text-[11px] text-red-200 leading-relaxed">
                Hệ thống kiểm soát định danh khép kín, phân quyền tự động theo Trường chính, Phân hiệu và từng Chi đội.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-6 text-[11px] text-red-200 border-t border-red-800/60 flex items-center justify-between">
            <span>© 2026 THCS Đường Hồng</span>
            <span className="text-yellow-300 font-bold">Phiên bản 2.5 Cloud</span>
          </div>
        </div>

        {/* Right Side: Login Form & Account Switcher */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between bg-slate-50">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-black text-slate-800">Đăng Nhập Hệ Thống</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn hoặc nhập tài khoản được cấp quyền để truy cập
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-700">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-800 animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{errorMessage}</div>
              </div>
            )}

            {/* Quick 5 Authorized Accounts Selector */}
            <div className="mt-4 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center justify-between">
                <span>Chọn nhanh trong 05 tài khoản được cấp:</span>
                <span className="text-[10px] text-red-700 font-bold">1 Click để điền</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {authorizedUsers.map((u) => {
                  const isSelected = selectedQuickAccount === u.email;
                  const isLocked = u.status === 'LOCKED';
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectQuickAccount(u)}
                      className={`text-left p-2 rounded-xl border text-xs transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-red-600 bg-red-50/80 font-bold text-red-950 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      } ${isLocked ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            u.role === 'ADMIN'
                              ? 'bg-red-600'
                              : u.role === 'MANAGER_PHANHIEU'
                              ? 'bg-blue-600'
                              : u.role === 'MANAGER_TRUONGCHINH'
                              ? 'bg-emerald-600'
                              : 'bg-amber-600'
                          }`}
                        />
                        <div className="truncate">
                          <span className="font-bold">{u.displayName.split('(')[0]}</span>
                          <span className="text-[10px] text-slate-500 ml-1 truncate">({u.assignedScope})</span>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-red-100 text-red-800'
                            : u.role === 'MANAGER_PHANHIEU'
                            ? 'bg-blue-100 text-blue-800'
                            : u.role === 'MANAGER_TRUONGCHINH'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {u.role.replace('MANAGER_', '').replace('TEACHER_', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email hoặc Tên đăng nhập:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="ví dụ: locquoccuong@gmail.com"
                    required
                    className="w-full bg-white border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-200 text-slate-800 rounded-xl px-3.5 pl-9 py-2 text-xs font-semibold focus:outline-none transition shadow-2xs"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Mật khẩu:</label>
                  <span className="text-[10px] text-slate-500">
                    Mặc định: <code className="font-mono font-bold text-red-700">{DEFAULT_INITIAL_PASSWORD}</code>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    required
                    className="w-full bg-white border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-200 text-slate-800 rounded-xl px-3.5 pl-9 pr-10 py-2 text-xs font-semibold focus:outline-none transition shadow-2xs"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <LogIn className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'ĐANG XÁC THỰC...' : 'ĐĂNG NHẬP VÀO ỨNG DỤNG'}</span>
              </button>
            </form>

            {/* Google Login Option */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Đăng nhập nhanh bằng Google (Thầy Lộc Quốc Cường)</span>
              </button>
            </div>
          </div>

          {/* Footer Guide for Firebase Console */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chỉ 05 tài khoản được cấp quyền</span>
            </span>
            <button
              type="button"
              onClick={() => setShowConsoleGuide(true)}
              className="text-red-700 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Cấu hình Firebase Console</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Firebase Console Email/Password Configuration Guide */}
      {showConsoleGuide && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-red-700 font-black text-sm">
                <Info className="w-5 h-5" />
                <span>HƯỚNG DẪN BẬT EMAIL/PASSWORD TRONG FIREBASE CONSOLE</span>
              </div>
              <button
                onClick={() => setShowConsoleGuide(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <p>
                Để đồng bộ tài khoản giáo viên qua Firebase Authentication trực tiếp trên đám mây, Thầy ADMIN vui lòng thực hiện 3 bước đơn giản:
              </p>
              <ol className="list-decimal list-inside space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <li>
                  Truy cập vào trang cấu hình <b>Firebase Authentication</b> của dự án:
                  <div className="mt-1">
                    <a
                      href="https://console.firebase.google.com/project/sylvan-lore-h01dl/authentication/providers"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 hover:underline"
                    >
                      <span>Mở Firebase Console → Sign-in method</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </li>
                <li>
                  Nhấp vào nhà cung cấp <b>Email/Password</b> và gạt thanh công tắc <b>Enable (Bật)</b>.
                </li>
                <li>
                  Nhấp <b>Save (Lưu)</b> để hoàn tất.
                </li>
              </ol>
              <p className="text-[11px] text-slate-500 italic">
                * Lưu ý: Hiện tại hệ thống e-Đội đã tích hợp sẵn cơ chế xác thực nội bộ an toàn với mã băm mật khẩu SHA-256 + Salt, Thầy/Cô có thể đăng nhập và sử dụng ngay lập tức mà không bị gián đoạn.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowConsoleGuide(false)}
                className="px-5 py-2 bg-red-700 text-white font-bold text-xs rounded-xl hover:bg-red-800 transition cursor-pointer"
              >
                Đã Hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
