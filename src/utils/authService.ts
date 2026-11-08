import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

export type UserRole =
  | 'ADMIN'                 // TPT Đội - Toàn quyền
  | 'MANAGER_TRUONGCHINH'   // Giáo viên phụ trách Đội trường chính
  | 'MANAGER_PHANHIEU'      // Giáo viên phụ trách Đội phân hiệu
  | 'TEACHER_CHIDOI'        // Giáo viên phụ trách Chi đội
  | 'MANAGER'               // Tương thích ngược: Quản lý Phân hiệu
  | 'TEACHER';              // Tương thích ngược: Giáo viên

export type ScopeDiemTruong = 'ALL' | 'Trường chính' | 'Phân hiệu';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  scopeDiemTruong: ScopeDiemTruong;
  assignedClass?: string; // e.g. '9A', '8C'
  assignedScope: string; // e.g. 'Toàn trường', 'Phân hiệu (9 Chi đội)', 'Chi đội 9A'
  status: 'ACTIVE' | 'LOCKED';
  passwordHash?: string; // SHA-256 hash of password
  passwordSalt?: string;
  createdAt: string;
  lastLoginAt?: string;
  avatarColor?: string;
}

export interface SecurityConfig {
  id: string;
  pinHash: string; // SHA-256 hash of 6-digit PIN
  pinSalt: string;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  requirePinForBatchDelete: boolean;
  requirePinForRestore: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SecurityAuditLog {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: string;
  timestamp: string;
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED';
}

export interface TrashItem {
  id: string;
  itemType: 'HOC_SINH' | 'CHI_DOI' | 'KE_HOACH' | 'HO_SO' | 'THI_DUA';
  itemId: string;
  itemTitle: string;
  itemData: any;
  deletedBy: string;
  deletedAt: string;
  reason?: string;
  canRestore: boolean;
}

export const MAX_ALLOWED_ACCOUNTS = 5;
export const DEFAULT_INITIAL_PASSWORD = 'edoi@2026';

// 5 pre-configured authorized accounts for THCS Đường Hồng
export const INITIAL_AUTHORIZED_USERS: AuthUser[] = [
  {
    id: 'u-admin-1',
    email: 'locquoccuong@gmail.com',
    displayName: 'Thầy Lộc Quốc Cường (Tổng phụ trách Đội)',
    role: 'ADMIN',
    scopeDiemTruong: 'ALL',
    assignedScope: 'Toàn trường (Trường chính & Phân hiệu)',
    status: 'ACTIVE',
    createdAt: '2026-09-01T08:00:00Z',
    avatarColor: 'bg-red-600',
  },
  {
    id: 'u-phanhieu-2',
    email: 'phanhieu.edoi@duonghong.edu.vn',
    displayName: 'Thầy Đặng Văn Tiến (Phụ trách Đội Phân hiệu)',
    role: 'MANAGER_PHANHIEU',
    scopeDiemTruong: 'Phân hiệu',
    assignedScope: 'Phân hiệu (9 Chi đội: 6C, 6D, 7C, 7D, 8C, 8D, 9C, 9D, 9E)',
    status: 'ACTIVE',
    createdAt: '2026-09-02T08:00:00Z',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'u-truongchinh-3',
    email: 'truongchinh.edoi@duonghong.edu.vn',
    displayName: 'Cô Nguyễn Thị Mai (Phụ trách Đội Trường chính)',
    role: 'MANAGER_TRUONGCHINH',
    scopeDiemTruong: 'Trường chính',
    assignedScope: 'Trường chính (8 Chi đội: 6A, 6B, 7A, 7B, 8A, 8B, 9A, 9B)',
    status: 'ACTIVE',
    createdAt: '2026-09-03T08:00:00Z',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'u-gvcn-4',
    email: 'gvcn9a.edoi@duonghong.edu.vn',
    displayName: 'Cô Hoàng Thu Hà (GVCN Chi đội 9A)',
    role: 'TEACHER_CHIDOI',
    scopeDiemTruong: 'Trường chính',
    assignedClass: '9A',
    assignedScope: 'Chi đội 9A (Trường chính)',
    status: 'ACTIVE',
    createdAt: '2026-09-05T08:00:00Z',
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'u-gvcn-5',
    email: 'gvcn8c.edoi@duonghong.edu.vn',
    displayName: 'Thầy Ma Văn Toàn (GVCN Chi đội 8C)',
    role: 'TEACHER_CHIDOI',
    scopeDiemTruong: 'Phân hiệu',
    assignedClass: '8C',
    assignedScope: 'Chi đội 8C (Phân hiệu)',
    status: 'ACTIVE',
    createdAt: '2026-09-05T08:00:00Z',
    avatarColor: 'bg-purple-600',
  },
];

const LOCAL_STORAGE_USERS_KEY = 'EDOI_AUTHORIZED_USERS_V2';
const LOCAL_STORAGE_SECURITY_KEY = 'EDOI_SECURITY_CONFIG_V1';
const LOCAL_STORAGE_AUDIT_KEY = 'EDOI_AUDIT_LOGS_V1';
const LOCAL_STORAGE_TRASH_KEY = 'EDOI_TRASH_BIN_V1';
const LOCAL_STORAGE_CURRENT_USER_KEY = 'EDOI_CURRENT_AUTH_USER_V2';
const LOCAL_STORAGE_PIN_ATTEMPTS_KEY = 'EDOI_PIN_FAILED_ATTEMPTS_V1';

// Web Crypto SHA-256 Hash for PIN
export async function hashPin(pin: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${pin}:eDoi_DH2026_SecGuard`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Web Crypto SHA-256 Hash for Passwords
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:eDoi_DH_PassSec2026`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate random salt
export function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Load Security Configuration (Default PIN: 123456)
export async function loadSecurityConfig(): Promise<SecurityConfig> {
  try {
    // Try Firestore Cloud first
    const docRef = doc(db, 'security_config', 'default');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as SecurityConfig;
      localStorage.setItem(LOCAL_STORAGE_SECURITY_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Could not read security config from Firestore:', err);
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SECURITY_KEY);
    if (raw) return JSON.parse(raw);

    const defaultSalt = generateSalt();
    // Default 6-digit PIN: '123456'
    const defaultHash = await hashPin('123456', defaultSalt);
    const initialConfig: SecurityConfig = {
      id: 'default',
      pinHash: defaultHash,
      pinSalt: defaultSalt,
      maxFailedAttempts: 5,
      lockoutDurationMinutes: 5,
      requirePinForBatchDelete: true,
      requirePinForRestore: true,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Hệ thống (Mặc định: 123456)',
    };
    saveSecurityConfig(initialConfig);
    return initialConfig;
  } catch {
    const fallbackSalt = 'edoi_salt_2026';
    const fallbackHash = await hashPin('123456', fallbackSalt);
    return {
      id: 'default',
      pinHash: fallbackHash,
      pinSalt: fallbackSalt,
      maxFailedAttempts: 5,
      lockoutDurationMinutes: 5,
      requirePinForBatchDelete: true,
      requirePinForRestore: true,
    };
  }
}

export function saveSecurityConfig(cfg: SecurityConfig): void {
  localStorage.setItem(LOCAL_STORAGE_SECURITY_KEY, JSON.stringify(cfg));
  // Asynchronously save to Firestore Cloud
  try {
    const docRef = doc(db, 'security_config', 'default');
    setDoc(docRef, cfg, { merge: true }).catch((err) =>
      console.warn('Could not write security config to Firestore:', err)
    );
  } catch (err) {
    console.warn('Firestore setDoc failed:', err);
  }
}

// PIN Verification with brute-force lockout protection
export async function verifyAdminPin(enteredPin: string): Promise<{ isValid: boolean; message: string; remainingAttempts?: number }> {
  if (!/^\d{6}$/.test(enteredPin)) {
    return { isValid: false, message: 'Mã PIN bắt buộc phải gồm đúng 06 chữ số.' };
  }

  // Check lockout
  const attemptsData = getPinAttemptsData();
  if (attemptsData.lockUntil && Date.now() < attemptsData.lockUntil) {
    const remainingSeconds = Math.ceil((attemptsData.lockUntil - Date.now()) / 1000);
    return {
      isValid: false,
      message: `Mã PIN đang bị khóa tạm thời do nhập sai quá 5 lần. Vui lòng thử lại sau ${remainingSeconds} giây.`,
    };
  }

  const config = await loadSecurityConfig();
  const enteredHash = await hashPin(enteredPin, config.pinSalt);

  if (enteredHash === config.pinHash) {
    resetPinAttempts();
    return { isValid: true, message: 'Xác thực mã PIN ADMIN thành công!' };
  }

  // Failed attempt
  const newAttempts = attemptsData.attempts + 1;
  const maxAttempts = config.maxFailedAttempts || 5;

  if (newAttempts >= maxAttempts) {
    const lockoutMs = (config.lockoutDurationMinutes || 5) * 60 * 1000;
    savePinAttemptsData({
      attempts: newAttempts,
      lockUntil: Date.now() + lockoutMs,
    });
    return {
      isValid: false,
      message: `Đã nhập sai PIN 5 lần liên tiếp! Hệ thống khóa chức năng bảo mật trong ${config.lockoutDurationMinutes || 5} phút.`,
      remainingAttempts: 0,
    };
  }

  savePinAttemptsData({
    attempts: newAttempts,
    lockUntil: null,
  });

  return {
    isValid: false,
    message: `Mã PIN không đúng! Thầy/Cô còn ${maxAttempts - newAttempts} lần thử.`,
    remainingAttempts: maxAttempts - newAttempts,
  };
}

function getPinAttemptsData(): { attempts: number; lockUntil: number | null } {
  if (typeof localStorage === 'undefined') return { attempts: 0, lockUntil: null };
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PIN_ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : { attempts: 0, lockUntil: null };
  } catch {
    return { attempts: 0, lockUntil: null };
  }
}

function savePinAttemptsData(data: { attempts: number; lockUntil: number | null }): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_PIN_ATTEMPTS_KEY, JSON.stringify(data));
  }
}

function resetPinAttempts(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_PIN_ATTEMPTS_KEY);
  }
}

// 05-Account Management
export function loadAuthorizedUsers(): AuthUser[] {
  if (typeof localStorage === 'undefined') return INITIAL_AUTHORIZED_USERS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (!raw) {
      saveAuthorizedUsers(INITIAL_AUTHORIZED_USERS);
      return INITIAL_AUTHORIZED_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveAuthorizedUsers(INITIAL_AUTHORIZED_USERS);
    return INITIAL_AUTHORIZED_USERS;
  } catch {
    return INITIAL_AUTHORIZED_USERS;
  }
}

export function saveAuthorizedUsers(users: AuthUser[]): void {
  // Ensure maximum 5 accounts constraint
  const validUsers = users.slice(0, MAX_ALLOWED_ACCOUNTS);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(validUsers));
  }

  // Persist to Cloud Firestore users collection
  try {
    validUsers.forEach((u) => {
      setDoc(doc(db, 'users', u.id), u, { merge: true }).catch((err) =>
        console.warn('Could not sync user to Firestore:', u.email, err)
      );
    });
  } catch (err) {
    console.warn('saveAuthorizedUsers to Firestore failed:', err);
  }
}

/**
 * Subscribe to Firestore users collection in realtime
 */
export function subscribeToAuthorizedUsers(onUpdate: (users: AuthUser[]) => void): () => void {
  const colRef = collection(db, 'users');
  return onSnapshot(
    colRef,
    (snap) => {
      if (!snap.empty) {
        const usersList: AuthUser[] = [];
        snap.forEach((d) => {
          usersList.push(d.data() as AuthUser);
        });
        if (usersList.length > 0) {
          const sorted = usersList.slice(0, MAX_ALLOWED_ACCOUNTS);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(sorted));
          }
          onUpdate(sorted);
        }
      }
    },
    (err) => console.warn('Users realtime listener error:', err)
  );
}

// Current Logged-in User Session (Default is null: NO automatic admin login!)
export function getSavedCurrentUser(): AuthUser | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    if (raw) {
      const parsed: AuthUser = JSON.parse(raw);
      // Validate that user exists in authorized list and is ACTIVE
      const currentList = loadAuthorizedUsers();
      const matched = currentList.find(
        (u) => u.email.toLowerCase() === parsed.email.toLowerCase() || u.id === parsed.id
      );
      if (matched && matched.status === 'ACTIVE') {
        return matched;
      }
      // If locked or removed, clear session
      clearSavedCurrentUser();
      return null;
    }
  } catch {}
  return null;
}

export function setSavedCurrentUser(user: AuthUser): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export function clearSavedCurrentUser(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
  }
}

/**
 * Authentication Helper: Authenticate by email & password
 */
export async function authenticateUser(
  emailOrUsername: string,
  plainPassword: string
): Promise<{ success: boolean; user?: AuthUser; message: string; requiresFirebaseConsoleHelp?: boolean }> {
  const cleanInput = emailOrUsername.trim().toLowerCase();

  if (!cleanInput || !plainPassword) {
    return { success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu.' };
  }

  // 1. Locate user in authorized 5 accounts list
  const users = loadAuthorizedUsers();
  const targetUser = users.find(
    (u) =>
      u.email.toLowerCase() === cleanInput ||
      u.email.toLowerCase().startsWith(cleanInput + '@') ||
      cleanInput.replace(/@.*$/, '') === u.email.replace(/@.*$/, '')
  );

  if (!targetUser) {
    return {
      success: false,
      message: 'Tài khoản không tồn tại trong danh sách 05 tài khoản được cấp quyền của nhà trường.',
    };
  }

  // 2. Check if account is locked
  if (targetUser.status === 'LOCKED') {
    return {
      success: false,
      message: 'Tài khoản của Thầy/Cô đang bị tạm khóa. Vui lòng liên hệ Thầy TPT Đội (ADMIN) để mở khóa.',
    };
  }

  // 3. Try Firebase Auth first if applicable
  let firebaseAuthSuccess = false;
  let needsConsoleHelp = false;

  try {
    await signInWithEmailAndPassword(auth, targetUser.email, plainPassword);
    firebaseAuthSuccess = true;
  } catch (err: any) {
    // If Email/Password provider is not yet enabled in Firebase console, detect code
    if (err.code === 'auth/operation-not-allowed') {
      needsConsoleHelp = true;
    }
  }

  // 4. Verify password against salted hash or initial password
  let passwordMatches = false;
  if (targetUser.passwordHash && targetUser.passwordSalt) {
    const computedHash = await hashPassword(plainPassword, targetUser.passwordSalt);
    passwordMatches = computedHash === targetUser.passwordHash;
  } else {
    // Fallback to initial password check
    passwordMatches = plainPassword === DEFAULT_INITIAL_PASSWORD || plainPassword === '123456';
  }

  if (firebaseAuthSuccess || passwordMatches) {
    // Update lastLoginAt
    const updatedUser: AuthUser = {
      ...targetUser,
      lastLoginAt: new Date().toISOString(),
    };

    const updatedList = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    saveAuthorizedUsers(updatedList);
    setSavedCurrentUser(updatedUser);

    logSecurityEvent(
      { email: updatedUser.email, role: updatedUser.role },
      'ĐĂNG NHẬP HỆ THỐNG',
      'USER_SESSION',
      `Đăng nhập thành công vào ứng dụng e-Đội (${updatedUser.assignedScope})`,
      'SUCCESS',
      updatedUser.id
    );

    return {
      success: true,
      user: updatedUser,
      message: 'Đăng nhập thành công!',
      requiresFirebaseConsoleHelp: needsConsoleHelp,
    };
  }

  logSecurityEvent(
    { email: targetUser.email, role: targetUser.role },
    'ĐĂNG NHẬP THẤT BÀI',
    'USER_SESSION',
    'Nhập sai mật khẩu truy cập',
    'FAILED',
    targetUser.id
  );

  return {
    success: false,
    message: 'Mật khẩu không chính xác! Vui lòng kiểm tra lại mật khẩu được cấp.',
  };
}

/**
 * Authentication Helper: Authenticate with Google
 */
export async function authenticateWithGoogle(): Promise<{ success: boolean; user?: AuthUser; message: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const googleEmail = result.user.email?.toLowerCase();

    if (!googleEmail) {
      return { success: false, message: 'Không lấy được địa chỉ email từ tài khoản Google.' };
    }

    const users = loadAuthorizedUsers();
    let targetUser = users.find((u) => u.email.toLowerCase() === googleEmail);

    // If logged in with admin email (locquoccuong@gmail.com)
    if (!targetUser && googleEmail === 'locquoccuong@gmail.com') {
      targetUser = users.find((u) => u.role === 'ADMIN') || INITIAL_AUTHORIZED_USERS[0];
    }

    if (!targetUser) {
      // Sign out from Firebase if not in whitelist
      await signOut(auth);
      return {
        success: false,
        message: `Email Google "${googleEmail}" chưa được cấp quyền trong 05 tài khoản sử dụng e-Đội. Vui lòng đăng nhập bằng tài khoản được cấp.`,
      };
    }

    if (targetUser.status === 'LOCKED') {
      await signOut(auth);
      return {
        success: false,
        message: 'Tài khoản của Thầy/Cô đang bị tạm khóa. Vui lòng liên hệ Thầy TPT Đội để mở khóa.',
      };
    }

    const updatedUser: AuthUser = {
      ...targetUser,
      lastLoginAt: new Date().toISOString(),
    };

    const updatedList = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    saveAuthorizedUsers(updatedList);
    setSavedCurrentUser(updatedUser);

    logSecurityEvent(
      { email: updatedUser.email, role: updatedUser.role },
      'ĐĂNG NHẬP GOOGLE',
      'USER_SESSION',
      `Đăng nhập Google thành công: ${googleEmail}`,
      'SUCCESS',
      updatedUser.id
    );

    return {
      success: true,
      user: updatedUser,
      message: 'Đăng nhập Google thành công!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Đăng nhập Google không thành công: ${err.message || 'Người dùng đã hủy xác thực.'}`,
    };
  }
}

/**
 * Logout Helper
 */
export async function logoutUser(user?: AuthUser | null): Promise<void> {
  if (user) {
    logSecurityEvent(
      { email: user.email, role: user.role },
      'ĐĂNG XUẤT',
      'USER_SESSION',
      'Người dùng đã đăng xuất khỏi phiên làm việc',
      'SUCCESS',
      user.id
    );
  }
  clearSavedCurrentUser();
  try {
    await signOut(auth);
  } catch {}
}

// Audit Logging
export function loadAuditLogs(): SecurityAuditLog[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logSecurityEvent(
  actor: { email: string; role: string },
  action: string,
  targetType: string,
  details: string,
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED' = 'SUCCESS',
  targetId?: string
): void {
  const newLog: SecurityAuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    actorEmail: actor.email,
    actorRole: actor.role,
    action,
    targetType,
    targetId: targetId || '',
    details,
    timestamp: new Date().toISOString(),
    result,
  };
  const logs = loadAuditLogs();
  logs.unshift(newLog);
  // Keep latest 200 logs
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_AUDIT_KEY, JSON.stringify(logs.slice(0, 200)));
  }

  // Asynchronously write to Firestore security_audit_logs
  try {
    const firestorePayload = JSON.parse(JSON.stringify(newLog));
    setDoc(doc(db, 'security_audit_logs', newLog.id), firestorePayload).catch((err) =>
      console.warn('Could not save audit log to Firestore:', err)
    );
  } catch (err) {
    console.warn('logSecurityEvent Firestore write failed:', err);
  }
}

// Trash Bin (Soft-Delete)
export function loadTrashBin(): TrashItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TRASH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToTrashBin(item: Omit<TrashItem, 'id' | 'deletedAt'>): void {
  const newItem: TrashItem = {
    ...item,
    id: `trash_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    deletedAt: new Date().toISOString(),
  };
  const bin = loadTrashBin();
  bin.unshift(newItem);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_TRASH_KEY, JSON.stringify(bin));
  }

  // Asynchronously write to Firestore trash_bin
  try {
    const firestorePayload = JSON.parse(JSON.stringify(newItem));
    setDoc(doc(db, 'trash_bin', newItem.id), firestorePayload).catch((err) =>
      console.warn('Could not save trash item to Firestore:', err)
    );
  } catch (err) {
    console.warn('addToTrashBin Firestore write failed:', err);
  }
}

export function removeFromTrashBin(trashId: string): void {
  const bin = loadTrashBin().filter((t) => t.id !== trashId);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_TRASH_KEY, JSON.stringify(bin));
  }

  // Asynchronously delete from Firestore trash_bin
  try {
    deleteDoc(doc(db, 'trash_bin', trashId)).catch((err) =>
      console.warn('Could not delete trash item from Firestore:', err)
    );
  } catch (err) {
    console.warn('removeFromTrashBin Firestore delete failed:', err);
  }
}

// ==========================================
// ROLE & PERMISSION HELPERS (RBAC)
// ==========================================

export function canAccessDiemTruong(
  user: AuthUser | null | undefined,
  diemTruong: 'Trường chính' | 'Phân hiệu'
): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.scopeDiemTruong === 'ALL') return true;
  return user.scopeDiemTruong === diemTruong;
}

export function canAccessClass(
  user: AuthUser | null | undefined,
  classKey: string,
  diemTruong: 'Trường chính' | 'Phân hiệu'
): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.role === 'MANAGER_TRUONGCHINH') {
    return diemTruong === 'Trường chính';
  }
  if (user.role === 'MANAGER_PHANHIEU' || user.role === 'MANAGER') {
    return diemTruong === 'Phân hiệu';
  }
  if (user.role === 'TEACHER_CHIDOI' || user.role === 'TEACHER') {
    if (user.assignedClass) {
      return user.assignedClass.trim().toUpperCase() === classKey.trim().toUpperCase();
    }
    return user.scopeDiemTruong === diemTruong;
  }
  return false;
}

export function canManageUsers(user: AuthUser | null | undefined): boolean {
  return user?.role === 'ADMIN';
}

export function canPerformBatchDelete(user: AuthUser | null | undefined): boolean {
  return user?.role === 'ADMIN';
}

export function canEditSchoolConfig(user: AuthUser | null | undefined): boolean {
  return user?.role === 'ADMIN';
}
