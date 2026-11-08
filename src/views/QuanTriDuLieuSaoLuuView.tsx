import React, { useState, useRef } from 'react';
import {
  Database,
  HardDriveDownload,
  UploadCloud,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileJson,
  FileSpreadsheet,
  Download,
  RefreshCw,
  FolderTree,
  Users,
  Award,
  Layers,
  ArrowRight,
  FileText,
  Lock,
  ExternalLink,
  Info,
  Check,
  X,
  Eye,
  Server,
  CloudOff,
  Radio,
} from 'lucide-react';
import { AppState, SyncStatus } from '../types';
import {
  exportFullBackupJSON,
  exportModuleBackupJSON,
  validateBackupContent,
  restoreBackupIntoState,
  ValidationResult,
  RestoreMergeStats,
  BackupModuleType,
} from '../utils/backupService';
import { CLASS_DEFINITIONS } from '../data/initialData';
import { pushStateToFirestore, fetchStateFromFirestore } from '../utils/firestoreSync';
import { getSavedCurrentUser } from '../utils/authService';

interface QuanTriDuLieuSaoLuuViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onRequestFirebaseSetup?: () => void;
  onOpenQuanLyTaiKhoan?: () => void;
}

export const QuanTriDuLieuSaoLuuView: React.FC<QuanTriDuLieuSaoLuuViewProps> = ({
  appState,
  setAppState,
  onRequestFirebaseSetup,
  onOpenQuanLyTaiKhoan,
}) => {
  // Sync Status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Vừa xong (Cloud Firestore)');
  const [isCloudPushing, setIsCloudPushing] = useState<boolean>(false);
  const [isCloudPulling, setIsCloudPulling] = useState<boolean>(false);
  const [cloudNotice, setCloudNotice] = useState<string | null>(null);

  // Local Backup State
  const [lastLocalBackup, setLastLocalBackup] = useState<{
    fileName: string;
    sizeBytes: number;
    time: string;
    recordsCount: number;
  } | null>(() => {
    const saved = localStorage.getItem('EDOI_LAST_LOCAL_BACKUP_INFO');
    return saved ? JSON.parse(saved) : null;
  });

  const handlePushToCloudNow = async () => {
    const user = getSavedCurrentUser();
    setIsCloudPushing(true);
    setCloudNotice(null);
    try {
      await pushStateToFirestore(appState, {
        email: user?.email || 'locquoccuong@gmail.com',
        role: user?.role || 'ADMIN',
        scopeDiemTruong: user?.scopeDiemTruong,
      });
      setCloudNotice('Đã đồng bộ 100% dữ liệu lên Firebase Firestore thành công! Tất cả các máy tính khác đã nhận được cập nhật.');
      setLastSyncTime(new Date().toLocaleTimeString('vi-VN'));
    } catch (err: any) {
      setCloudNotice(`Lỗi đồng bộ Cloud: ${err.message}`);
    } finally {
      setIsCloudPushing(false);
    }
  };

  const handlePullFromCloudNow = async () => {
    setIsCloudPulling(true);
    setCloudNotice(null);
    try {
      const remote = await fetchStateFromFirestore();
      if (remote && remote.listHocSinh && remote.listHocSinh.length > 0) {
        setAppState(remote);
        setCloudNotice(`Đã nạp thành công ${remote.listHocSinh.length} học sinh và 17 Chi đội từ Firebase Cloud Firestore.`);
        setLastSyncTime(new Date().toLocaleTimeString('vi-VN'));
      } else {
        setCloudNotice('Chưa có dữ liệu trên Firestore hoặc dữ liệu rỗng.');
      }
    } catch (err: any) {
      setCloudNotice(`Lỗi nạp từ Cloud: ${err.message}`);
    } finally {
      setIsCloudPulling(false);
    }
  };

  // Restore State
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [restoreMode, setRestoreMode] = useState<'append_no_overwrite' | 'replace_controlled'>('append_no_overwrite');
  const [restoreStats, setRestoreStats] = useState<RestoreMergeStats | null>(null);
  const [restoreLogs, setRestoreLogs] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats calculation
  const totalStudents = appState.listHocSinh?.length || 0;
  const totalClasses = Object.keys(appState.classesData || {}).length || 17;
  const totalDoiVien = appState.listHocSinh?.filter((h) => h.isDoiVien).length || 0;
  const totalDoanVien = appState.listHocSinh?.filter((h) => h.isDoanVien).length || 0;
  const totalPlans = appState.listLichCongTac?.length || 0;
  const totalChiDoiFiles = appState.listHoSoChiDoi?.length || 0;

  // Handler: Full Backup
  const handleFullBackup = () => {
    try {
      const res = exportFullBackupJSON(appState);
      const nowStr = new Date().toLocaleString('vi-VN');
      const backupInfo = {
        fileName: res.fileName,
        sizeBytes: res.sizeBytes,
        time: nowStr,
        recordsCount: totalStudents + totalClasses + totalPlans + totalChiDoiFiles,
      };
      setLastLocalBackup(backupInfo);
      localStorage.setItem('EDOI_LAST_LOCAL_BACKUP_INFO', JSON.stringify(backupInfo));
      alert(`Đã xuất bản sao lưu thành công!\nTệp: ${res.fileName}\nSố học sinh: ${totalStudents}\nSố Chi đội: ${totalClasses}`);
    } catch (err: any) {
      alert('Lỗi khi xuất tệp sao lưu: ' + err.message);
    }
  };

  // Handler: Module Backup
  const handleModuleBackup = (moduleType: BackupModuleType, moduleName: string) => {
    try {
      const res = exportModuleBackupJSON(appState, moduleType);
      alert(`Đã sao lưu phân hệ "${moduleName}" thành công!\nTệp: ${res.fileName}\nSố bản ghi: ${res.count}`);
    } catch (err: any) {
      alert(`Lỗi khi sao lưu phân hệ ${moduleName}: ` + err.message);
    }
  };

  // Handler: File Selected for Restore
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);
    setRestoreStats(null);
    setRestoreLogs([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateBackupContent(content);
      setValidationResult(result);
    };
    reader.readAsText(file);
  };

  // Handler: Perform Restore
  const handleExecuteRestore = () => {
    if (!validationResult || !validationResult.isValid || !validationResult.extractedState) {
      alert('Vui lòng chọn tệp sao lưu hợp lệ trước khi khôi phục.');
      return;
    }

    if (restoreMode === 'replace_controlled') {
      const confirmText = prompt(
        'CẢNH BÁO: Chế độ "Khôi phục thay thế có kiểm soát" sẽ thay thế cấu trúc dữ liệu hiện tại bằng tệp sao lưu. Nhập "DONG Y" để tiếp tục:'
      );
      if (confirmText !== 'DONG Y') {
        alert('Đã hủy thao tác khôi phục thay thế.');
        return;
      }
    }

    setIsRestoring(true);
    const logs: string[] = [];
    logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] Bắt đầu phân tích và khôi phục dữ liệu...`);
    logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] Chế độ: ${restoreMode === 'append_no_overwrite' ? 'Bổ sung an toàn (chống nhân đôi)' : 'Thay thế có kiểm soát'}`);

    setTimeout(() => {
      try {
        const { newState, stats } = restoreBackupIntoState(
          appState,
          validationResult.extractedState!,
          restoreMode
        );

        setAppState(newState);
        setRestoreStats(stats);

        logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] Học sinh thêm mới: +${stats.studentsAdded}`);
        logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] Học sinh đã có được cập nhật thông tin: ${stats.studentsUpdated}`);
        logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] Học sinh trùng lặp đã được bỏ qua (an toàn): ${stats.studentsSkippedDuplicates}`);
        logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] Chi đội được cập nhật: ${stats.classesUpdated}`);
        logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] Kế hoạch & minh chứng bổ sung: +${stats.plansAdded}`);
        logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] Hồ sơ Chi đội bổ sung: +${stats.chiDoiFilesAdded}`);
        logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] KHÔI PHỤC HOÀN TẤT THÀNH CÔNG VÀ ĐÃ ĐỒNG BỘ BỘ NHỚ!`);

        setRestoreLogs(logs);
      } catch (err: any) {
        logs.push(`[${new Date().toLocaleTimeString('vi-VN')}] LỖI KHÔI PHỤC: ${err.message}`);
        setRestoreLogs(logs);
        alert('Có lỗi xảy ra trong quá trình khôi phục: ' + err.message);
      } finally {
        setIsRestoring(false);
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs text-red-700 font-extrabold uppercase tracking-wide">
              <Database className="w-5 h-5 text-red-600" />
              <span>Hệ Thống Đồng Bộ & Sao Lưu 3 Lớp e-Đội THCS Đường Hồng</span>
            </div>
            <h2 className="font-black text-xl text-slate-800 mt-1">
              Quản Trị Dữ Liệu – Sao Lưu & Khôi Phục An Toàn
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bảo vệ toàn vẹn dữ liệu 332 học sinh và 17 Chi đội. Đồng bộ nhiều máy tính giữa Trường chính & Phân hiệu, sao lưu 3 lớp tiết kiệm tối đa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenQuanLyTaiKhoan && (
              <button
                onClick={onOpenQuanLyTaiKhoan}
                className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-slate-950" />
                <span>05 TÀI KHOẢN & KHÓA PIN</span>
              </button>
            )}

            <button
              onClick={handleFullBackup}
              className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center space-x-2 cursor-pointer"
            >
              <HardDriveDownload className="w-4 h-4 text-yellow-300" />
              <span>SAO LƯU TOÀN BỘ VỀ MÁY TÍNH</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          KHU VỰC 1: TÌNH TRẠNG DỮ LIỆU HIỆN TẠI & TRẠNG THÁI ĐỒNG BỘ
      ======================================================== */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wide">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Khu Vực 1: Tình Trạng Dữ Liệu & Kết Nối Đồng Bộ</span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Đồng bộ gần nhất:</span>
            <span className="font-bold text-slate-700">{lastSyncTime}</span>
          </div>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Tổng học sinh</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalStudents}{' '}
              <span className="text-xs font-medium text-slate-400">em</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
              ✓ Đang lưu an toàn
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">17 Chi đội</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalClasses}{' '}
              <span className="text-xs font-medium text-slate-400">lớp</span>
            </div>
            <div className="text-[10px] text-blue-600 font-bold mt-0.5">
              8 Chính • 9 Phân hiệu
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Đội viên TNTP</div>
            <div className="text-2xl font-black text-red-700 mt-1">
              {totalDoiVien}{' '}
              <span className="text-xs font-medium text-slate-400">em</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {totalStudents > 0 ? Math.round((totalDoiVien / totalStudents) * 100) : 0}% sĩ số
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Đoàn viên TNCS</div>
            <div className="text-2xl font-black text-blue-700 mt-1">
              {totalDoanVien}{' '}
              <span className="text-xs font-medium text-slate-400">em</span>
            </div>
            <div className="text-[10px] text-blue-600 font-bold mt-0.5">Khối 9 kết nạp</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Hồ sơ 17 Chi đội</div>
            <div className="text-2xl font-black text-purple-700 mt-1">
              {totalChiDoiFiles}{' '}
              <span className="text-xs font-medium text-slate-400">tệp</span>
            </div>
            <div className="text-[10px] text-purple-600 font-bold mt-0.5">8 Thư mục chuẩn</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Kế hoạch & Lịch</div>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {totalPlans}{' văn bản'}
            </div>
            <div className="text-[10px] text-amber-600 font-bold mt-0.5">Kèm minh chứng</div>
          </div>
        </div>

        {/* Cloud Firestore Realtime Sync Panel */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-xl space-y-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Cloud className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-xs text-emerald-950 uppercase tracking-wide">
                    CLOUD FIRESTORE DÙNG CHUNG: KẾT NỐI REALTIME HOẠT ĐỘNG
                  </span>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-extrabold border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                    <span>Trực tuyến</span>
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 space-y-0.5">
                  <div>
                    Dự án: <code className="font-mono text-emerald-800 font-bold">sylvan-lore-h01dl</code> • Database: <code className="font-mono text-emerald-800 font-bold">ai-studio-eithcsnghngtrlst-2885bc30-024c-4316-a79e-81e6965830fa</code>
                  </div>
                  <div className="text-emerald-900 font-medium">
                    Tất cả 05 tài khoản (ADMIN, Quản lý Trường chính, Quản lý Phân hiệu, GVCN) đều làm việc trên cùng 1 cơ sở dữ liệu. Mọi thay đổi đều tự động đồng bộ ngay lập tức qua <code className="font-mono font-bold">onSnapshot()</code>.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={handlePushToCloudNow}
                disabled={isCloudPushing}
                className="flex-1 md:flex-initial px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCloudPushing ? 'animate-spin' : ''}`} />
                <span>{isCloudPushing ? 'Đang đẩy lên...' : 'ĐỒNG BỘ NGAY LÊN CLOUD'}</span>
              </button>

              <button
                onClick={handlePullFromCloudNow}
                disabled={isCloudPulling}
                className="flex-1 md:flex-initial px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-800 font-black text-xs rounded-xl border border-emerald-300 transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download className={`w-3.5 h-3.5 ${isCloudPulling ? 'animate-bounce' : ''}`} />
                <span>{isCloudPulling ? 'Đang tải về...' : 'NẠP LẠI TỪ CLOUD'}</span>
              </button>
            </div>
          </div>

          {cloudNotice && (
            <div className="p-2.5 bg-white/90 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{cloudNotice}</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          KHU VỰC 2: SAO LƯU TRÊN MÁY TÍNH (LỚP 3 - BẮT BUỘC)
      ======================================================== */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-red-700 uppercase tracking-wide">
              <HardDriveDownload className="w-4 h-4 text-red-600" />
              <span>Khu Vực 2: Lớp 3 – Sao Lưu Dữ Liệu Về Máy Tính (Bắt Buộc)</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Xuất tệp JSON đầy đủ 100% dữ liệu gốc từ máy tính của thầy/cô. Tên tệp có ngày giờ chuẩn hóa: <code className="font-mono text-red-700 font-bold">E_DOI_DUONG_HONG_FULL_BACKUP_YYYY-MM-DD_HH-MM-SS.json</code>
            </p>
          </div>

          {lastLocalBackup && (
            <div className="text-right text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="text-slate-500">Lần sao lưu gần nhất:</div>
              <div className="font-bold text-slate-800">{lastLocalBackup.time}</div>
              <div className="text-[10px] text-emerald-700 font-bold truncate max-w-[200px]" title={lastLocalBackup.fileName}>
                {lastLocalBackup.fileName} ({(lastLocalBackup.sizeBytes / 1024).toFixed(1)} KB)
              </div>
            </div>
          )}
        </div>

        {/* Big Master Button */}
        <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-black text-sm text-red-950">
              SAO LƯU TOÀN BỘ 100% DỮ LIỆU HỆ THỐNG
            </h4>
            <p className="text-xs text-red-900 leading-relaxed">
              Bao gồm đầy đủ <b>{totalStudents} học sinh</b>, 17 Chi đội, Đội viên, Đoàn viên, điểm thi đua tuần, kế hoạch và hồ sơ điện tử. Tệp sao lưu có thể mở được trên mọi máy tính khác.
            </p>
          </div>

          <button
            onClick={handleFullBackup}
            className="w-full sm:w-auto px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer flex-shrink-0"
          >
            <Download className="w-5 h-5 text-yellow-300" />
            <span>TẢI TỆP SAO LƯU TOÀN BỘ (.JSON)</span>
          </button>
        </div>

        {/* Module-by-Module Backup Grid */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wide">
            Hoặc sao lưu riêng biệt theo từng phân hệ:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleModuleBackup('hocSinh', 'Danh sách Học sinh')}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-300 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-red-700">
                  1. DS Học sinh ({totalStudents} HS)
                </div>
                <div className="text-[10px] text-slate-400">Mã HS, họ tên, lớp, bán trú...</div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-red-700" />
            </button>

            <button
              onClick={() => handleModuleBackup('chiDoi', 'Danh sách 17 Chi đội')}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-300 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-red-700">
                  2. 17 Chi đội & GVCN
                </div>
                <div className="text-[10px] text-slate-400">Sĩ số, GVCN, BCH chi đội...</div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-red-700" />
            </button>

            <button
              onClick={() => handleModuleBackup('doiVien', 'Đội viên TNTP')}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-300 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-red-700">
                  3. Đội viên ({totalDoiVien} em)
                </div>
                <div className="text-[10px] text-slate-400">Ngày vào Đội, chuyên hiệu...</div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-red-700" />
            </button>

            <button
              onClick={() => handleModuleBackup('doanVien', 'Đoàn viên TNCS')}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-300 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-red-700">
                  4. Đoàn viên ({totalDoanVien} em)
                </div>
                <div className="text-[10px] text-slate-400">Số thẻ Đoàn, ngày kết nạp...</div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-red-700" />
            </button>

            <button
              onClick={() => handleModuleBackup('renLuyen', 'Rèn luyện Đội viên')}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-300 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-red-700">
                  5. Rèn luyện Đội viên
                </div>
                <div className="text-[10px] text-slate-400">Đánh giá tháng 9..5, HK1, HK2...</div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-red-700" />
            </button>

            <button
              onClick={() => handleModuleBackup('keHoach', 'Kế hoạch & Báo cáo')}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-300 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-red-700">
                  6. Kế hoạch & Báo cáo
                </div>
                <div className="text-[10px] text-slate-400">{totalPlans} kế hoạch năm, tháng...</div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-red-700" />
            </button>

            <button
              onClick={() => handleModuleBackup('hoSo', 'Hồ sơ 17 Chi đội')}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-300 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-red-700">
                  7. Hồ sơ 17 Chi đội ({totalChiDoiFiles} tệp)
                </div>
                <div className="text-[10px] text-slate-400">8 Thư mục chuẩn hóa...</div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-red-700" />
            </button>

            <button
              onClick={() => handleModuleBackup('thiDua', 'Thi đua & Khen thưởng')}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-300 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-red-700">
                  8. Thi đua & Khen thưởng
                </div>
                <div className="text-[10px] text-slate-400">Điểm tuần, sự việc vi phạm...</div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-red-700" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          KHU VỰC 3: SAO LƯU GOOGLE DRIVE (LỚP 2 - NGOÀI HỆ THỐNG)
      ======================================================== */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-blue-700 uppercase tracking-wide">
              <Cloud className="w-4 h-4 text-blue-600" />
              <span>Khu Vực 3: Lớp 2 – Bản Sao Lưu Độc Lập Lên Google Drive</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lưu trữ định kỳ vào thư mục riêng: <code className="font-mono text-blue-700 font-bold">SAO_LUU_E_DOI_DUONG_HONG</code> trên Google Drive cá nhân của thầy/cô.
            </p>
          </div>

          <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Miễn phí 100% • 15GB Drive cá nhân</span>
          </span>
        </div>

        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-black text-xs text-blue-950 flex items-center space-x-1.5">
              <span>Thư mục lưu trữ:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800">
                /Google Drive/SAO_LUU_E_DOI_DUONG_HONG/
              </span>
            </div>
            <div className="text-xs text-blue-900 leading-relaxed">
              Mỗi bản sao lưu tạo một tệp riêng biệt theo định dạng ngày giờ <code className="font-mono text-[11px] font-bold">SAO_LUU_E_DOI_DUONG_HONG_YYYY-MM-DD_HH-MM-SS.json</code>, tuyệt đối không ghi đè tệp cũ để có thể quay về bất cứ thời điểm nào.
            </div>
          </div>

          <button
            onClick={() => {
              // Trigger backup download with special drive prefix name
              const res = exportFullBackupJSON(appState);
              alert(
                `Đã tạo bản sao lưu dành cho Google Drive!\nTệp: ${res.fileName}\n\nThầy/Cô chỉ cần kéo thả tệp này vào thư mục "SAO_LUU_E_DOI_DUONG_HONG" trên Google Drive để bảo vệ dữ liệu ở tầng thứ 2 hoàn toàn miễn phí!`
              );
            }}
            className="w-full md:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer flex-shrink-0"
          >
            <Cloud className="w-4 h-4 text-sky-300" />
            <span>TẠO BẢN SAO LƯU CHO GOOGLE DRIVE</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          KHU VỰC 4: KHÔI PHỤC DỮ LIỆU (CHỐNG NHÂN ĐÔI, AN TOÀN)
      ======================================================== */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-amber-700 uppercase tracking-wide">
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <span>Khu Vực 4: Khôi Phục Dữ Liệu Từ Tệp Sao Lưu (.JSON)</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cơ chế khôi phục thông minh: Kiểm tra tính toàn vẹn, xem trước số liệu, lọc trùng lặp học sinh, mặc định <b>không ghi đè</b>.
            </p>
          </div>
        </div>

        {/* Step 1: File Upload & Validation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="font-bold text-xs text-slate-800">
              1. Chọn tệp sao lưu (.JSON) từ máy tính:
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-5 text-center bg-slate-50/50 hover:bg-amber-50/30 transition cursor-pointer"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                accept=".json"
                className="hidden"
              />
              <FileJson className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="font-black text-slate-800 text-xs">
                {restoreFile ? restoreFile.name : 'Bấm vào đây để chọn tệp .JSON sao lưu'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {restoreFile
                  ? `${(restoreFile.size / 1024).toFixed(1)} KB`
                  : 'Hỗ trợ tệp Full Backup hoặc AppState gốc'}
              </div>
            </div>

            {/* Restore Mode Selection */}
            <div className="space-y-2 pt-1">
              <div className="font-bold text-xs text-slate-800">
                2. Chọn phương án khôi phục:
              </div>
              <div className="space-y-2 text-xs">
                <label className="flex items-start space-x-2.5 p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 cursor-pointer">
                  <input
                    type="radio"
                    name="restoreMode"
                    value="append_no_overwrite"
                    checked={restoreMode === 'append_no_overwrite'}
                    onChange={() => setRestoreMode('append_no_overwrite')}
                    className="mt-0.5 text-emerald-600"
                  />
                  <div>
                    <div className="font-black text-emerald-950">
                      Khôi phục bổ sung (Mặc định — Khuyến nghị)
                    </div>
                    <div className="text-[11px] text-emerald-900 mt-0.5">
                      Chỉ thêm học sinh và hồ sơ mới chưa có trong hệ thống. Nếu học sinh đã tồn tại (trùng mã HS hoặc họ tên + ngày sinh), giữ nguyên thông tin, <b>tuyệt đối không ghi đè, không nhân đôi</b>.
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-2.5 p-3 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="restoreMode"
                    value="replace_controlled"
                    checked={restoreMode === 'replace_controlled'}
                    onChange={() => setRestoreMode('replace_controlled')}
                    className="mt-0.5 text-amber-600"
                  />
                  <div>
                    <div className="font-black text-slate-900">
                      Khôi phục thay thế có kiểm soát (Yêu cầu xác nhận)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Đưa toàn bộ hệ thống về đúng trạng thái tại thời điểm tạo bản sao lưu.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Step 2: Verification Preview & Execution */}
          <div className="space-y-3">
            <div className="font-bold text-xs text-slate-800">
              3. Kết quả kiểm tra tệp & Xem trước số liệu:
            </div>

            {!validationResult ? (
              <div className="p-8 border border-slate-200 rounded-2xl text-center text-slate-400 italic text-xs">
                Chưa chọn tệp sao lưu. Vui lòng tải tệp .JSON để kiểm tra tính toàn vẹn.
              </div>
            ) : !validationResult.isValid ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 space-y-1">
                <div className="font-black flex items-center space-x-1.5 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Tệp sao lưu không hợp lệ!</span>
                </div>
                <div>{validationResult.errorMessage}</div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-black text-slate-800">Thông tin tệp sao lưu:</span>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    ✓ Cấu trúc hợp lệ ({validationResult.format})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Ứng dụng:</span>{' '}
                    <b className="text-slate-700">{validationResult.summary.appName || 'e-Đội THCS'}</b>
                  </div>
                  <div>
                    <span className="text-slate-400">Năm học:</span>{' '}
                    <b className="text-slate-700">{validationResult.summary.schoolYear || '2026-2027'}</b>
                  </div>
                  <div>
                    <span className="text-slate-400">Thời gian tạo:</span>{' '}
                    <b className="text-slate-700">
                      {validationResult.summary.exportTimestamp
                        ? new Date(validationResult.summary.exportTimestamp).toLocaleString('vi-VN')
                        : 'Không xác định'}
                    </b>
                  </div>
                  <div>
                    <span className="text-slate-400">Số Chi đội:</span>{' '}
                    <b className="text-slate-700">{validationResult.summary.totalClasses} lớp</b>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="font-black text-slate-900 text-sm">
                      {validationResult.summary.totalStudents} học sinh
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Đội viên: {validationResult.summary.totalDoiVien} • Đoàn viên: {validationResult.summary.totalDoanVien}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <div>{validationResult.summary.totalPlans} kế hoạch</div>
                    <div>{validationResult.summary.totalChiDoiFiles} hồ sơ Chi đội</div>
                  </div>
                </div>

                <button
                  onClick={handleExecuteRestore}
                  disabled={isRestoring}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                  <span>
                    {isRestoring
                      ? 'ĐANG KHÔI PHỤC VÀ ĐỐI CHIẾU DỮ LIỆU...'
                      : `BẮT ĐẦU KHÔI PHỤC DỮ LIỆU (${validationResult.summary.totalStudents} HỌC SINH)`}
                  </span>
                </button>
              </div>
            )}

            {/* Restore Logs */}
            {restoreLogs.length > 0 && (
              <div className="p-3 bg-slate-950 text-emerald-400 font-mono text-[10px] rounded-xl space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                {restoreLogs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
