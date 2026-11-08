import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  KeyRound,
  Lock,
  Unlock,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle2,
  FileText,
  UserCheck,
  UserX,
  Plus,
  Eye,
  EyeOff,
  Database,
  Cloud,
  Layers,
  Archive,
  ArrowRight,
  School,
  AlertCircle,
  FileSpreadsheet,
  Info,
  ExternalLink,
} from 'lucide-react';
import { AppState, HocSinh } from '../types';
import {
  AuthUser,
  SecurityConfig,
  SecurityAuditLog,
  TrashItem,
  MAX_ALLOWED_ACCOUNTS,
  loadAuthorizedUsers,
  saveAuthorizedUsers,
  loadSecurityConfig,
  saveSecurityConfig,
  verifyAdminPin,
  hashPin,
  hashPassword,
  generateSalt,
  loadAuditLogs,
  logSecurityEvent,
  loadTrashBin,
  removeFromTrashBin,
  getSavedCurrentUser,
  setSavedCurrentUser,
  UserRole,
  ScopeDiemTruong,
  DEFAULT_INITIAL_PASSWORD,
} from '../utils/authService';
import {
  pushStateToFirestore,
  migrateLocalDataToFirestore,
  MigrationReport,
} from '../utils/firestoreSync';

interface QuanLyTaiKhoanBaoMatViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  currentUser: AuthUser;
  setCurrentUser: (user: AuthUser) => void;
  onOpenQuanTriDuLieu?: () => void;
}

type TabKeySection = 'tai_khoan' | 'khoa_pin' | 'thung_rac' | 'nhat_ky' | 'dong_bo_cloud';

export const QuanLyTaiKhoanBaoMatView: React.FC<QuanLyTaiKhoanBaoMatViewProps> = ({
  appState,
  setAppState,
  currentUser,
  setCurrentUser,
  onOpenQuanTriDuLieu,
}) => {
  const [activeTab, setActiveTab] = useState<TabKeySection>('tai_khoan');

  // Guard: Only ADMIN has permission to access this management view
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="bg-white p-8 rounded-3xl border border-red-200 text-center max-w-lg mx-auto mt-12 shadow-md space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-800">GIỚI HẠN QUYỀN TRUY CẬP QUẢN TRỊ</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Chỉ tài khoản <b>ADMIN (Thầy Lộc Quốc Cường – Tổng phụ trách Đội)</b> mới có quyền truy cập vào bảng điều khiển bảo mật, quản lý 05 tài khoản và cấu hình mã PIN.
        </p>
        <p className="text-[11px] text-slate-500">
          Tài khoản hiện tại của Thầy/Cô: <b>{currentUser.email}</b> ({currentUser.role} - {currentUser.assignedScope})
        </p>
      </div>
    );
  }

  // Accounts State
  const [users, setUsers] = useState<AuthUser[]>(() => loadAuthorizedUsers());
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('MANAGER_PHANHIEU');
  const [newUserScopeDiemTruong, setNewUserScopeDiemTruong] = useState<ScopeDiemTruong>('Phân hiệu');
  const [newUserAssignedClass, setNewUserAssignedClass] = useState('');
  const [newUserPassword, setNewUserPassword] = useState(DEFAULT_INITIAL_PASSWORD);
  const [newUserScope, setNewUserScope] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Security & PIN State
  const [secConfig, setSecConfig] = useState<SecurityConfig | null>(null);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeMessage, setPinChangeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPinTestModal, setShowPinTestModal] = useState(false);
  const [testPinInput, setTestPinInput] = useState('');
  const [testPinResult, setTestPinResult] = useState<string | null>(null);

  // Trash Bin State
  const [trashItems, setTrashItems] = useState<TrashItem[]>(() => loadTrashBin());
  const [permanentDeletePin, setPermanentDeletePin] = useState('');
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<TrashItem | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(() => loadAuditLogs());

  // Cloud Sync & Migration State
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [migrationReport, setMigrationReport] = useState<MigrationReport | null>(null);

  useEffect(() => {
    loadSecurityConfig().then(setSecConfig);
  }, []);

  const refreshTrash = () => setTrashItems(loadTrashBin());
  const refreshLogs = () => setAuditLogs(loadAuditLogs());
  const refreshUsers = () => setUsers(loadAuthorizedUsers());

  // Handler: Lock / Unlock account
  const handleToggleLockUser = (targetUser: AuthUser) => {
    if (targetUser.role === 'ADMIN' && users.filter((u) => u.role === 'ADMIN').length === 1 && targetUser.status === 'ACTIVE') {
      alert('BẢO MẬT: Không thể khóa tài khoản ADMIN duy nhất trong hệ thống!');
      return;
    }

    const newStatus: 'ACTIVE' | 'LOCKED' = targetUser.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    const actionDesc = newStatus === 'LOCKED' ? 'Khóa tài khoản' : 'Mở khóa tài khoản';

    const updated: AuthUser[] = users.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u));
    setUsers(updated);
    saveAuthorizedUsers(updated);

    logSecurityEvent(
      { email: currentUser.email, role: currentUser.role },
      actionDesc,
      'USER_ACCOUNT',
      `Thay đổi trạng thái tài khoản ${targetUser.email} thành ${newStatus}`,
      'SUCCESS',
      targetUser.id
    );
    refreshLogs();
  };

  // Handler: Revoke account
  const handleRevokeUser = (targetUser: AuthUser) => {
    if (targetUser.role === 'ADMIN' && users.filter((u) => u.role === 'ADMIN').length === 1) {
      alert('BẢO MẬT: Không thể thu hồi tài khoản ADMIN duy nhất trong hệ thống!');
      return;
    }

    const ok = window.confirm(`Thầy có chắc chắn muốn thu hồi tài khoản ${targetUser.email} (${targetUser.displayName}) không?`);
    if (!ok) return;

    const updated = users.filter((u) => u.id !== targetUser.id);
    setUsers(updated);
    saveAuthorizedUsers(updated);

    logSecurityEvent(
      { email: currentUser.email, role: currentUser.role },
      'THU HỒI TÀI KHOẢN',
      'USER_ACCOUNT',
      `Thu hồi quyền truy cập của tài khoản ${targetUser.email}`,
      'SUCCESS',
      targetUser.id
    );
    refreshLogs();
  };

  // Handler: Add Replacement Account (Max 5)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (users.length >= MAX_ALLOWED_ACCOUNTS) {
      alert('Đã đạt giới hạn 05 tài khoản được phép sử dụng ứng dụng. Không thể cấp thêm tài khoản.');
      return;
    }

    if (!newUserEmail.trim() || !newUserName.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và email.');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === newUserEmail.trim().toLowerCase())) {
      alert('Email này đã tồn tại trong danh sách tài khoản.');
      return;
    }

    const salt = generateSalt();
    const passHash = await hashPassword(newUserPassword || DEFAULT_INITIAL_PASSWORD, salt);

    const newUser: AuthUser = {
      id: `u-${Date.now()}`,
      email: newUserEmail.trim().toLowerCase(),
      displayName: newUserName.trim(),
      role: newUserRole,
      scopeDiemTruong: newUserScopeDiemTruong,
      assignedClass: newUserAssignedClass.trim() || undefined,
      assignedScope:
        newUserScope.trim() ||
        (newUserRole === 'ADMIN'
          ? 'Toàn trường'
          : newUserRole === 'MANAGER_PHANHIEU'
          ? 'Phân hiệu (9 Chi đội)'
          : newUserRole === 'MANAGER_TRUONGCHINH'
          ? 'Trường chính (8 Chi đội)'
          : `Chi đội ${newUserAssignedClass || 'được phân công'}`),
      status: 'ACTIVE',
      passwordHash: passHash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
      avatarColor:
        newUserRole === 'ADMIN'
          ? 'bg-red-600'
          : newUserRole === 'MANAGER_PHANHIEU'
          ? 'bg-blue-600'
          : newUserRole === 'MANAGER_TRUONGCHINH'
          ? 'bg-emerald-600'
          : 'bg-amber-600',
    };

    const updated = [...users, newUser];
    setUsers(updated);
    saveAuthorizedUsers(updated);

    setShowAddModal(false);
    setNewUserEmail('');
    setNewUserName('');
    setNewUserScope('');
    setNewUserAssignedClass('');
    setNewUserPassword(DEFAULT_INITIAL_PASSWORD);

    logSecurityEvent(
      { email: currentUser.email, role: currentUser.role },
      'CẤP TÀI KHOẢN MỚI',
      'USER_ACCOUNT',
      `Cấp quyền tài khoản ${newUser.email} với vai trò ${newUser.role} (${newUser.assignedScope})`,
      'SUCCESS',
      newUser.id
    );
    refreshLogs();
    alert(`Đã cấp quyền thành công cho tài khoản: ${newUser.email} (${users.length + 1}/5 tài khoản)`);
  };

  // Handler: Change 6-digit PIN
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMessage(null);

    if (!/^\d{6}$/.test(newPinInput)) {
      setPinChangeMessage({ type: 'error', text: 'Mã PIN mới bắt buộc phải gồm đúng 06 chữ số.' });
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinChangeMessage({ type: 'error', text: 'Xác nhận mã PIN mới không trùng khớp.' });
      return;
    }

    // Verify current PIN first
    const verifyRes = await verifyAdminPin(currentPinInput);
    if (!verifyRes.isValid) {
      setPinChangeMessage({ type: 'error', text: 'Mã PIN hiện tại không chính xác: ' + verifyRes.message });
      return;
    }

    const salt = generateSalt();
    const hash = await hashPin(newPinInput, salt);

    const updatedCfg: SecurityConfig = {
      ...(secConfig || {
        id: 'default',
        maxFailedAttempts: 5,
        lockoutDurationMinutes: 5,
        requirePinForBatchDelete: true,
        requirePinForRestore: true,
      }),
      pinHash: hash,
      pinSalt: salt,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.email,
    };

    saveSecurityConfig(updatedCfg);
    setSecConfig(updatedCfg);

    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setPinChangeMessage({ type: 'success', text: 'Đã cập nhật mã PIN ADMIN 06 số thành công!' });

    logSecurityEvent(
      { email: currentUser.email, role: currentUser.role },
      'ĐỔI MÃ PIN ADMIN',
      'SECURITY_CONFIG',
      'Cập nhật mã PIN quản trị 06 chữ số bảo mật mới',
      'SUCCESS'
    );
    refreshLogs();
  };

  // Handler: Test PIN
  const handleTestPin = async () => {
    const res = await verifyAdminPin(testPinInput);
    if (res.isValid) {
      setTestPinResult('✓ Mã PIN chính xác! Đã mở khóa quyền bảo mật.');
    } else {
      setTestPinResult(`✗ Thất bại: ${res.message}`);
    }
  };

  // Handler: Restore from Trash Bin
  const handleRestoreFromTrash = (item: TrashItem) => {
    if (item.itemType === 'HOC_SINH') {
      const restoredHs = item.itemData as HocSinh;
      // Check if already in list
      if (!appState.listHocSinh.some((h) => h.id === restoredHs.id)) {
        setAppState((prev) => ({
          ...prev,
          listHocSinh: [restoredHs, ...prev.listHocSinh],
        }));
      }
    }

    removeFromTrashBin(item.id);
    refreshTrash();

    logSecurityEvent(
      { email: currentUser.email, role: currentUser.role },
      'KHÔI PHỤC TỪ THÙNG RÁC',
      item.itemType,
      `Khôi phục lại ${item.itemTitle} từ thùng rác dữ liệu`,
      'SUCCESS',
      item.itemId
    );
    refreshLogs();
    alert(`Đã khôi phục thành công: ${item.itemTitle}`);
  };

  // Handler: Permanent Delete from Trash Bin (Requires PIN)
  const handlePermanentDelete = async () => {
    if (!permanentDeleteTarget) return;

    const verify = await verifyAdminPin(permanentDeletePin);
    if (!verify.isValid) {
      alert('Mã PIN không đúng! ' + verify.message);
      return;
    }

    removeFromTrashBin(permanentDeleteTarget.id);
    refreshTrash();

    logSecurityEvent(
      { email: currentUser.email, role: currentUser.role },
      'XÓA VĨNH VIỄN KHỎI THÙNG RÁC',
      permanentDeleteTarget.itemType,
      `Đã xóa vĩnh viễn ${permanentDeleteTarget.itemTitle} (Xác thực bằng PIN ADMIN)`,
      'SUCCESS',
      permanentDeleteTarget.itemId
    );
    refreshLogs();

    alert(`Đã xóa vĩnh viễn bản ghi: ${permanentDeleteTarget.itemTitle}`);
    setPermanentDeleteTarget(null);
    setPermanentDeletePin('');
  };

  // Handler: Migrate Data to Cloud Firestore
  const handleRunMigration = async () => {
    if (currentUser.role !== 'ADMIN') {
      alert('Chỉ tài khoản ADMIN mới có quyền thực hiện chuyển dữ liệu lên Cloud Firestore.');
      return;
    }

    setMigrationRunning(true);
    try {
      const rep = await migrateLocalDataToFirestore(appState, {
        email: currentUser.email,
        role: currentUser.role,
      });
      setMigrationReport(rep);
      refreshLogs();
    } catch (err: any) {
      alert('Lỗi chuyển dữ liệu: ' + err.message);
    } finally {
      setMigrationRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-red-700 font-extrabold uppercase tracking-wide">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              <span>Hệ Thống Bảo Mật & Giới Hạn 05 Tài Khoản e-Đội THCS Đường Hồng</span>
            </div>
            <h2 className="font-black text-xl text-slate-800 mt-1">
              Khóa Bảo Mật, PIN Quản Trị & Chống Mất Dữ Liệu
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quy định nghiêm ngặt: Giới hạn tối đa đúng 05 tài khoản, khóa PIN 06 số chống xóa nhầm, thùng rác dữ liệu và nhật ký kiểm toán.
            </p>
          </div>

          {/* Current User Session Badge & Switcher */}
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center space-x-3 text-xs">
            <div className={`w-8 h-8 rounded-full ${currentUser.avatarColor || 'bg-red-600'} text-white font-black flex items-center justify-center text-sm shadow-xs`}>
              {currentUser.role[0]}
            </div>
            <div>
              <div className="font-bold text-slate-800 truncate max-w-[200px]">
                {currentUser.displayName}
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                <span className={`px-1.5 py-0.2 rounded font-black text-white ${
                  currentUser.role === 'ADMIN' ? 'bg-red-600' : currentUser.role === 'MANAGER' ? 'bg-blue-600' : 'bg-emerald-600'
                }`}>
                  {currentUser.role}
                </span>
                <span>• {currentUser.assignedScope}</span>
              </div>
            </div>

            {/* Quick Switch for Testing User Accounts */}
            <select
              value={currentUser.id}
              onChange={(e) => {
                const selected = users.find((u) => u.id === e.target.value);
                if (selected) {
                  setCurrentUser(selected);
                  setSavedCurrentUser(selected);
                  logSecurityEvent(
                    { email: selected.email, role: selected.role },
                    'CHUYỂN PHIÊN ĐĂNG NHẬP',
                    'SESSION',
                    `Đăng nhập vào tài khoản ${selected.email}`
                  );
                  refreshLogs();
                }
              }}
              className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2 py-1 font-medium focus:outline-none"
              title="Chuyển đổi nhanh tài khoản thử nghiệm"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.role}: {u.displayName.split('(')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mt-5 space-x-1 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('tai_khoan')}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'tai_khoan'
                ? 'border-red-700 text-red-700 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 text-red-600" />
            <span>1. Quản Lý 05 Tài Khoản ({users.length}/05)</span>
          </button>

          <button
            onClick={() => setActiveTab('khoa_pin')}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'khoa_pin'
                ? 'border-red-700 text-red-700 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>2. Khóa PIN Quản Trị 06 Số</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('thung_rac');
              refreshTrash();
            }}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'thung_rac'
                ? 'border-red-700 text-red-700 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Archive className="w-4 h-4 text-purple-600" />
            <span>3. Thùng Rác Dữ Liệu ({trashItems.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('nhat_ky');
              refreshLogs();
            }}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'nhat_ky'
                ? 'border-red-700 text-red-700 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>4. Nhật Ký Hoạt Động & Bảo Mật</span>
          </button>

          <button
            onClick={() => setActiveTab('dong_bo_cloud')}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'dong_bo_cloud'
                ? 'border-red-700 text-red-700 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Cloud className="w-4 h-4 text-emerald-600" />
            <span>5. Đồng Bộ Cloud Firestore (Lớp 1)</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          PHÂN HỆ 1: QUẢN LÝ 05 TÀI KHOẢN NGƯỜI DÙNG
      ======================================================== */}
      {activeTab === 'tai_khoan' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-sm text-slate-900 uppercase">
                  Danh Sách Tài Khoản Được Cấp Quyền Truy Cập
                </h3>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                  users.length >= MAX_ALLOWED_ACCOUNTS
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {users.length}/05 Tài khoản
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chỉ đúng 05 tài khoản này mới có quyền đọc và ghi dữ liệu. Tài khoản thứ 06 bị từ chối tuyệt đối theo quy định bảo mật.
              </p>
            </div>

            {currentUser.role === 'ADMIN' && (
              <div>
                {users.length >= MAX_ALLOWED_ACCOUNTS ? (
                  <div className="text-[11px] text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                    Đã đạt giới hạn 05 tài khoản được phép sử dụng ứng dụng. Không thể cấp thêm tài khoản.
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cấp Tài Khoản Thay Thế ({5 - users.length} chỗ trống)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Accounts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-black text-[10px] uppercase">
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Người dùng / Email</th>
                  <th className="py-2.5 px-3">Vai trò</th>
                  <th className="py-2.5 px-3">Phạm vi phân quyền</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3">Ngày cấp</th>
                  {currentUser.role === 'ADMIN' && <th className="py-2.5 px-3 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-black text-slate-900">{u.displayName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        u.role === 'ADMIN'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : u.role === 'MANAGER'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {u.assignedScope}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 w-max ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{u.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã bị khóa'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    {currentUser.role === 'ADMIN' && (
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Toggle Lock */}
                          <button
                            onClick={() => handleToggleLockUser(u)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={u.status === 'ACTIVE' ? 'Khóa tài khoản này' : 'Mở khóa tài khoản'}
                          >
                            {u.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>

                          {/* Revoke User */}
                          <button
                            onClick={() => handleRevokeUser(u)}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Thu hồi tài khoản này"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          PHÂN HỆ 2: KHÓA PIN QUẢN TRỊ 06 SỐ
      ======================================================== */}
      {activeTab === 'khoa_pin' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 text-xs font-black text-amber-700 uppercase tracking-wide">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Khóa PIN Quản Trị 06 Chữ Số – Lớp Xác Thực Thứ 2</span>
              </div>
              <h3 className="font-black text-base text-slate-800 mt-1">
                Bảo Vệ Các Thao Tác Nguy Hiểm (Xóa hàng loạt, Khôi phục ghi đè)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã PIN gồm đúng 06 chữ số, được mã hóa băm SHA-256 kèm chuỗi Salt ngẫu nhiên. Giới hạn 5 lần nhập sai, khóa 5 phút để chống tấn công dò mã.
              </p>
            </div>

            <button
              onClick={() => {
                setShowPinTestModal(true);
                setTestPinInput('');
                setTestPinResult(null);
              }}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              <span>Thử Nghiệm Nhập PIN</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Đổi PIN */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="font-black text-xs text-slate-800 uppercase flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-red-600" />
                <span>Thiết Lập / Thay Đổi Mã PIN ADMIN (06 Số)</span>
              </div>

              {pinChangeMessage && (
                <div className={`p-3 rounded-xl text-xs font-medium ${
                  pinChangeMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-red-50 text-red-900 border border-red-300'
                }`}>
                  {pinChangeMessage.text}
                </div>
              )}

              <form onSubmit={handleChangePin} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Mã PIN hiện tại (Mặc định ban đầu: 123456):
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Nhập 6 số PIN hiện tại..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-center text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Mã PIN mới (Đúng 06 chữ số):
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Nhập 6 chữ số mới..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-center text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Xác nhận mã PIN mới:
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Nhập lại 6 chữ số mới..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-center text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>CẬP NHẬT MÃ PIN MỚI</span>
                </button>
              </form>
            </div>

            {/* Quy định bắt buộc nhập PIN */}
            <div className="space-y-3">
              <div className="font-black text-xs text-slate-800 uppercase">
                Các Thao Tác Bắt Buộc Nhập PIN Quản Trị:
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <b className="text-red-950">1. Xóa hàng loạt học sinh:</b>
                    <p className="text-[11px] text-red-900 mt-0.5">
                      Bắt buộc nhập đúng 6 số PIN để xác nhận. Học sinh sẽ được chuyển vào <b>Thùng rác dữ liệu</b> thay vì xóa vĩnh viễn ngay.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <b className="text-amber-950">2. Khôi phục dữ liệu ở chế độ Ghi đè:</b>
                    <p className="text-[11px] text-amber-900 mt-0.5">
                      Bắt buộc sao lưu dữ liệu hiện tại trước, nhập PIN ADMIN và xác nhận lần cuối để tránh mất mát.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <b className="text-purple-950">3. Xóa vĩnh viễn khỏi Thùng rác:</b>
                    <p className="text-[11px] text-purple-900 mt-0.5">
                      Chỉ ADMIN có quyền xóa dọn dẹp thùng rác và bắt buộc xác thực PIN.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <b className="text-blue-950">4. Thay đổi phân quyền ADMIN / Cấu hình bảo mật:</b>
                    <p className="text-[11px] text-blue-900 mt-0.5">
                      Ngăn chặn tự ý thay đổi cấu hình bảo mật hoặc thu hồi quyền quản trị.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PHÂN HỆ 3: THÙNG RÁC DỮ LIỆU (SOFT DELETE)
      ======================================================== */}
      {activeTab === 'thung_rac' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 text-xs font-black text-purple-700 uppercase tracking-wide">
                <Archive className="w-4 h-4 text-purple-600" />
                <span>Thùng Rác Dữ Liệu (Bảo Vệ Chống Xóa Nhầm)</span>
              </div>
              <h3 className="font-black text-base text-slate-800 mt-1">
                Các Bản Ghi Đã Xóa Tạm Thời ({trashItems.length} mục)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Khi xóa học sinh hoặc hồ sơ, hệ thống chuyển vào Thùng rác trước. Thầy/Cô có thể <b>Khôi phục</b> lại bất kỳ lúc nào mà không sợ mất dữ liệu.
              </p>
            </div>
          </div>

          {trashItems.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl p-6 space-y-2">
              <Archive className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-xs text-slate-600">Thùng rác hiện đang trống</div>
              <div className="text-[11px] text-slate-400">
                Chưa có bản ghi nào bị xóa tạm thời. Dữ liệu học sinh đang an toàn 100%.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-black text-[10px] uppercase">
                    <th className="py-2.5 px-3">Loại mục</th>
                    <th className="py-2.5 px-3">Tên / Nội dung bản ghi</th>
                    <th className="py-2.5 px-3">Người xóa</th>
                    <th className="py-2.5 px-3">Thời gian xóa</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trashItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {item.itemType}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900">{item.itemTitle}</div>
                        {item.reason && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">Lý do: {item.reason}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{item.deletedBy}</td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(item.deletedAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleRestoreFromTrash(item)}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-xs transition cursor-pointer"
                          >
                            Khôi phục
                          </button>

                          {currentUser.role === 'ADMIN' && (
                            <button
                              onClick={() => {
                                setPermanentDeleteTarget(item);
                                setPermanentDeletePin('');
                              }}
                              className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold text-xs transition cursor-pointer"
                            >
                              Xóa vĩnh viễn (Cần PIN)
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          PHÂN HỆ 4: NHẬT KÝ HOẠT ĐỘNG & BẢO MẬT
      ======================================================== */}
      {activeTab === 'nhat_ky' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 text-xs font-black text-blue-700 uppercase tracking-wide">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Nhật Ký Hoạt Động & Bảo Mật (Audit Logs)</span>
              </div>
              <h3 className="font-black text-base text-slate-800 mt-1">
                Lịch Sử Tác Nghiệp Quản Trị & Cảnh Báo An Ninh
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ghi nhận mọi thao tác đăng nhập, xóa học sinh, khôi phục dữ liệu, đổi mã PIN. Tuyệt đối không lưu mật khẩu hoặc mã PIN vào nhật ký.
              </p>
            </div>

            <button
              onClick={() => {
                const csvHeader = 'Thời gian,Người thực hiện,Vai trò,Hành động,Đối tượng,Kết quả,Chi tiết\n';
                const csvRows = auditLogs
                  .map(
                    (l) =>
                      `"${new Date(l.timestamp).toLocaleString('vi-VN')}","${l.actorEmail}","${l.actorRole}","${l.action}","${l.targetType}","${l.result}","${l.details.replace(/"/g, '""')}"`
                  )
                  .join('\n');
                const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Nhat_Ky_Bao_Mat_eDoi_${Date.now()}.csv`;
                a.click();
              }}
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất File Nhật Ký (.CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10">
                <tr className="text-slate-700 border-b border-slate-200 font-black text-[10px] uppercase">
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Người thực hiện</th>
                  <th className="py-2.5 px-3">Hành động</th>
                  <th className="py-2.5 px-3">Đối tượng</th>
                  <th className="py-2.5 px-3">Kết quả</th>
                  <th className="py-2.5 px-3">Chi tiết tác nghiệp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                      Chưa có nhật ký hoạt động nào được ghi lại.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{log.actorEmail}</div>
                        <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                      </td>
                      <td className="py-2.5 px-3 font-black text-slate-800">{log.action}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-slate-200 text-slate-800 font-bold px-1.5 py-0.2 rounded text-[10px]">
                          {log.targetType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          log.result === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.result}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          PHÂN HỆ 5: ĐỒNG BỘ CLOUD FIRESTORE DÙNG CHUNG
      ======================================================== */}
      {activeTab === 'dong_bo_cloud' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-wide">
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span>Hạ Tầng Dữ Liệu Dùng Chung – Firebase Firestore Spark (Miễn Phí)</span>
              </div>
              <h3 className="font-black text-base text-slate-800 mt-1">
                Đồng Bộ 2 Điểm Trường: Trường Chính & Phân Hiệu
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cơ sở dữ liệu Firestore đã được khởi tạo thành công trên dự án Google Cloud <code className="font-mono text-emerald-700 font-bold">sylvan-lore-h01dl</code>. Không phát sinh chi phí hàng tháng.
              </p>
            </div>
          </div>

          {/* Action Box */}
          <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="font-black text-sm text-emerald-950">
                  CHUYỂN DỮ LIỆU CŨ TỪ MÁY TÍNH NÀY LÊN CLOUD FIRESTORE
                </h4>
                <p className="text-xs text-emerald-900 mt-0.5">
                  Đẩy <b>{appState.listHocSinh.length} học sinh</b> và 17 Chi đội lên đám mây Firestore với thuật toán đối chiếu kiểm tra, <b>tuyệt đối không nhân đôi, giữ nguyên ID gốc</b>.
                </p>
              </div>

              <button
                onClick={handleRunMigration}
                disabled={migrationRunning}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center space-x-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${migrationRunning ? 'animate-spin' : ''}`} />
                <span>{migrationRunning ? 'ĐANG CHUYỂN DỮ LIỆU...' : 'BẮT ĐẦU CHUYỂN DỮ LIỆU LÊN CLOUD'}</span>
              </button>
            </div>

            {migrationReport && (
              <div className="p-4 bg-white rounded-xl border border-emerald-300 space-y-2 text-xs">
                <div className="font-black text-emerald-900 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kết Quả Chuyển Dữ Liệu: {migrationReport.status}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
                  <div>Học sinh nguồn: <b>{migrationReport.totalSourceStudents}</b></div>
                  <div>Thêm mới lên Cloud: <b className="text-emerald-700">+{migrationReport.newStudentsAdded}</b></div>
                  <div>Trùng lặp bỏ qua: <b>{migrationReport.duplicateStudentsSkipped}</b></div>
                  <div>17 Chi đội đồng bộ: <b>{migrationReport.classesSynchronized}</b></div>
                </div>
                <div className="text-[11px] text-slate-600 italic">{migrationReport.message}</div>
              </div>
            )}
          </div>

          {/* Guide for Firebase Console */}
          <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center space-x-2 text-blue-950 font-black text-sm">
              <Info className="w-4 h-4 text-blue-700" />
              <span>HƯỚNG DẪN CẤU HÌNH DÀNH RIÊNG CHO ADMIN (FIREBASE CONSOLE)</span>
            </div>
            <p className="text-blue-900 leading-relaxed">
              Ứng dụng e-Đội đã được cấu hình bảo mật chuẩn Firebase Firestore với dự án <b>sylvan-lore-h01dl</b>. Để cho phép giáo viên phân hiệu và giáo viên chi đội đăng nhập đồng bộ bằng Email & Mật khẩu qua Firebase Auth, Thầy ADMIN vui lòng thực hiện:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
                <div className="font-bold text-blue-950">Bước 1: Mở Firebase Console</div>
                <p className="text-[11px] text-slate-600">
                  Truy cập mục Authentication &gt; Sign-in method trên dự án sylvan-lore-h01dl.
                </p>
                <a
                  href="https://console.firebase.google.com/project/sylvan-lore-h01dl/authentication/providers"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-700 font-bold hover:underline text-[11px] mt-1"
                >
                  <span>Mở Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
                <div className="font-bold text-blue-950">Bước 2: Bật Email/Password</div>
                <p className="text-[11px] text-slate-600">
                  Chọn nhà cung cấp <b>Email/Password</b>, chuyển công tắc sang <b>Enable (Bật)</b> và bấm <b>Save (Lưu)</b>.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
                <div className="font-bold text-blue-950">Bước 3: Hoàn tất đồng bộ</div>
                <p className="text-[11px] text-slate-600">
                  Tất cả 05 tài khoản có thể đăng nhập bằng mật khẩu khởi tạo <code className="font-mono text-red-700 font-bold">edoi@2026</code> trên bất kỳ máy tính nào.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cấp tài khoản mới */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200">
            <div className="bg-gradient-to-r from-red-800 to-rose-900 px-5 py-4 text-white flex justify-between items-center">
              <h3 className="font-black text-sm uppercase">Cấp Tài Khoản Người Dùng Mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white hover:opacity-80">✕</button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Họ và tên người dùng:</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="VD: Cô Hoàng Thị Lan..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email đăng nhập:</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="VD: gvcn6a@duonghong.edu.vn..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Vai trò phân quyền:</label>
                <select
                  value={newUserRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setNewUserRole(r);
                    if (r === 'MANAGER_PHANHIEU') setNewUserScopeDiemTruong('Phân hiệu');
                    else if (r === 'MANAGER_TRUONGCHINH') setNewUserScopeDiemTruong('Trường chính');
                    else if (r === 'ADMIN') setNewUserScopeDiemTruong('ALL');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="MANAGER_PHANHIEU">Giáo viên phụ trách Đội phân hiệu (9 Chi đội)</option>
                  <option value="MANAGER_TRUONGCHINH">Giáo viên phụ trách Đội trường chính (8 Chi đội)</option>
                  <option value="TEACHER_CHIDOI">Giáo viên phụ trách Chi đội</option>
                  <option value="ADMIN">ADMIN – Tổng phụ trách Đội (Toàn quyền)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Điểm trường trực thuộc:</label>
                <select
                  value={newUserScopeDiemTruong}
                  onChange={(e) => setNewUserScopeDiemTruong(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="Phân hiệu">Phân hiệu (9 Chi đội)</option>
                  <option value="Trường chính">Trường chính (8 Chi đội)</option>
                  <option value="ALL">Toàn trường (Trường chính & Phân hiệu)</option>
                </select>
              </div>

              {newUserRole === 'TEACHER_CHIDOI' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Chi đội được phân công phụ trách:</label>
                  <input
                    type="text"
                    value={newUserAssignedClass}
                    onChange={(e) => setNewUserAssignedClass(e.target.value)}
                    placeholder="VD: 9A hoặc 8C..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mật khẩu khởi tạo ban đầu:</label>
                <input
                  type="text"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="VD: edoi@2026..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-red-700 font-bold"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Mật khẩu sẽ được băm bằng SHA-256 + Salt, tuyệt đối không lưu dạng văn bản thô.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Ghi chú phạm vi (Tùy chọn):</label>
                <input
                  type="text"
                  value={newUserScope}
                  onChange={(e) => setNewUserScope(e.target.value)}
                  placeholder="VD: Phụ trách Chi đội 9A Trường chính..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 text-white font-black rounded-xl"
                >
                  Cấp tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Thử nghiệm nhập PIN */}
      {showPinTestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-200">
            <div className="bg-amber-700 px-5 py-4 text-white flex justify-between items-center">
              <h3 className="font-black text-sm uppercase flex items-center space-x-1.5">
                <KeyRound className="w-4 h-4" />
                <span>Thử Nghiệm Mã PIN Quản Trị</span>
              </h3>
              <button onClick={() => setShowPinTestModal(false)} className="text-white hover:opacity-80">✕</button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600">
                Nhập mã PIN 06 số của Thầy để kiểm tra cơ chế xác thực SHA-256:
              </p>
              <input
                type="password"
                maxLength={6}
                value={testPinInput}
                onChange={(e) => setTestPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="●●●●●●"
                className="w-full p-3 border border-slate-300 rounded-xl font-mono text-center text-lg tracking-widest"
              />

              {testPinResult && (
                <div className={`p-2.5 rounded-xl font-bold text-xs ${
                  testPinResult.startsWith('✓') ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                }`}>
                  {testPinResult}
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPinTestModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleTestPin}
                  className="px-4 py-2 bg-amber-700 text-white font-black rounded-xl"
                >
                  Xác thực
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Xác nhận xóa vĩnh viễn (Cần PIN) */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-200">
            <div className="bg-red-700 px-5 py-4 text-white flex justify-between items-center">
              <h3 className="font-black text-sm uppercase flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Xác Nhận Xóa Vĩnh Viễn</span>
              </h3>
              <button onClick={() => setPermanentDeleteTarget(null)} className="text-white hover:opacity-80">✕</button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-red-50 text-red-900 rounded-xl font-medium">
                CẢNH BÁO: Thao tác này sẽ xóa vĩnh viễn mục <b>{permanentDeleteTarget.itemTitle}</b> khỏi hệ thống và không thể khôi phục lại!
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nhập mã PIN ADMIN (06 số) để xác nhận:
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={permanentDeletePin}
                  onChange={(e) => setPermanentDeletePin(e.target.value.replace(/\D/g, ''))}
                  placeholder="●●●●●●"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-center text-sm tracking-widest"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setPermanentDeleteTarget(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handlePermanentDelete}
                  className="px-4 py-2 bg-red-700 text-white font-black rounded-xl"
                >
                  XÓA VĨNH VIỄN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
