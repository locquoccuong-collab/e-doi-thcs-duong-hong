import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { AppState, HocSinh, ClassData, LichCongTac, HoSoChiDoiItem, BchLienDoiMember, SuViec, ThongBao, CoDoItem, RenLuyenState } from '../types';
import { AuthUser, logSecurityEvent } from './authService';
import { getInitialAppState } from '../data/initialData';

export const APP_STATE_COLLECTION = 'app_state';
export const MAIN_STATE_DOC = 'main_state';

export interface MigrationReport {
  totalSourceStudents: number;
  existingFirestoreStudents: number;
  newStudentsAdded: number;
  duplicateStudentsSkipped: number;
  classesSynchronized: number;
  plansSynchronized: number;
  status: 'SUCCESS' | 'PARTIAL' | 'ERROR';
  message: string;
}

/**
 * Merge list of items by unique ID preserving order
 */
function mergeListById<T extends { id?: string | number }>(remoteList: T[] = [], localList: T[] = []): T[] {
  const map = new Map<string, T>();
  // 1. Populate with remote
  remoteList.forEach((item) => {
    const idKey = item.id !== undefined ? String(item.id) : null;
    if (idKey) map.set(idKey, item);
  });
  // 2. Overlay local (updates / new additions)
  localList.forEach((item) => {
    const idKey = item.id !== undefined ? String(item.id) : null;
    if (idKey) map.set(idKey, item);
  });
  return Array.from(map.values());
}

/**
 * Push local state to Firestore Cloud with intelligent role-based scope merging to prevent cross-overwrites
 */
export async function pushStateToFirestore(
  state: AppState,
  actor: { email: string; role: string; scopeDiemTruong?: string }
): Promise<void> {
  // CRITICAL GUARD: Never push an empty student state that would wipe existing records!
  if (!state.listHocSinh || state.listHocSinh.length === 0) {
    console.warn('Blocked attempt to push empty state to Firestore.');
    return;
  }

  const docRef = doc(db, APP_STATE_COLLECTION, MAIN_STATE_DOC);

  try {
    const existingRemote = await fetchStateFromFirestore();

    if (!existingRemote) {
      // First write to cloud
      const payload = {
        ...state,
        lastSyncedAt: new Date().toISOString(),
        lastSyncedBy: actor.email,
        serverTimestamp: serverTimestamp(),
      };
      await setDoc(docRef, payload, { merge: true });
      return;
    }

    // Prepare deep merged state
    let mergedStudents = [...state.listHocSinh];
    let mergedClasses: Record<string, ClassData> = {
      ...(existingRemote.classesData || {}),
      ...(state.classesData || {}),
    };

    if (actor.role === 'MANAGER_PHANHIEU' || actor.scopeDiemTruong === 'Phân hiệu') {
      // Preserve Trường chính students from remote; update Phân hiệu students from local
      const nonPhanHieuStudents = (existingRemote.listHocSinh || []).filter((s) => s.diemTruong !== 'Phân hiệu');
      const phanHieuStudents = state.listHocSinh.filter((s) => s.diemTruong === 'Phân hiệu');
      mergedStudents = [...nonPhanHieuStudents, ...phanHieuStudents];

      // Update Phân hiệu classes only, keep Trường chính classes untouched
      mergedClasses = { ...(existingRemote.classesData || {}) };
      Object.entries(state.classesData || {}).forEach(([key, val]) => {
        if (val.diemTruong === 'Phân hiệu') {
          mergedClasses[key] = val;
        }
      });
    } else if (actor.role === 'MANAGER_TRUONGCHINH' || actor.scopeDiemTruong === 'Trường chính') {
      // Preserve Phân hiệu students from remote; update Trường chính students from local
      const nonTruongChinhStudents = (existingRemote.listHocSinh || []).filter((s) => s.diemTruong !== 'Trường chính');
      const truongChinhStudents = state.listHocSinh.filter((s) => s.diemTruong === 'Trường chính');
      mergedStudents = [...nonTruongChinhStudents, ...truongChinhStudents];

      // Update Trường chính classes only, keep Phân hiệu classes untouched
      mergedClasses = { ...(existingRemote.classesData || {}) };
      Object.entries(state.classesData || {}).forEach(([key, val]) => {
        if (val.diemTruong === 'Trường chính') {
          mergedClasses[key] = val;
        }
      });
    }

    // Deep merge renLuyenState so evaluations from both campuses are preserved
    const mergedRenLuyen: RenLuyenState = {
      danhGiaThang: {
        ...(existingRemote.renLuyenState?.danhGiaThang || {}),
        ...(state.renLuyenState?.danhGiaThang || {}),
      },
      tongKetKy: {
        ...(existingRemote.renLuyenState?.tongKetKy || {}),
        ...(state.renLuyenState?.tongKetKy || {}),
      },
      lockedKy: {
        ...(existingRemote.renLuyenState?.lockedKy || {}),
        ...(state.renLuyenState?.lockedKy || {}),
      },
    };

    // Deep merge weeklyScores
    const mergedWeeklyScores = {
      ...(existingRemote.weeklyScores || {}),
      ...(state.weeklyScores || {}),
    };

    // Merge shared list collections by ID
    const mergedLich = mergeListById<LichCongTac>(existingRemote.listLichCongTac, state.listLichCongTac);
    const mergedHoSoChiDoi = mergeListById<HoSoChiDoiItem>(existingRemote.listHoSoChiDoi, state.listHoSoChiDoi);
    const mergedBch = mergeListById<BchLienDoiMember>(existingRemote.listBchLienDoi, state.listBchLienDoi);
    const mergedSuViec = mergeListById<SuViec>(existingRemote.listSuViec, state.listSuViec);
    const mergedThongBao = mergeListById<ThongBao>(existingRemote.listThongBao, state.listThongBao);
    const mergedCoDo = mergeListById<CoDoItem>(existingRemote.listCoDo, state.listCoDo);

    const payload: AppState & { serverTimestamp: any } = {
      ...existingRemote,
      ...state,
      classesData: mergedClasses,
      listHocSinh: mergedStudents,
      renLuyenState: mergedRenLuyen,
      weeklyScores: mergedWeeklyScores,
      listLichCongTac: mergedLich,
      listHoSoChiDoi: mergedHoSoChiDoi,
      listBchLienDoi: mergedBch,
      listSuViec: mergedSuViec,
      listThongBao: mergedThongBao,
      listCoDo: mergedCoDo,
      lastSyncedAt: new Date().toISOString(),
      lastSyncedBy: actor.email,
      serverTimestamp: serverTimestamp(),
    };

    await setDoc(docRef, payload, { merge: true });

    logSecurityEvent(
      actor,
      'ĐỒNG BỘ CLOUD FIRESTORE',
      'APP_STATE',
      `Đồng bộ ${mergedStudents.length} học sinh và 17 Chi đội lên đám mây Firestore (${actor.role})`
    );
  } catch (error: any) {
    console.error('Firestore push error:', error);
    handleFirestoreError(error, OperationType.WRITE, `${APP_STATE_COLLECTION}/${MAIN_STATE_DOC}`);
  }
}

/**
 * Fetch latest state from Firestore Cloud
 */
export async function fetchStateFromFirestore(): Promise<AppState | null> {
  try {
    const docRef = doc(db, APP_STATE_COLLECTION, MAIN_STATE_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AppState;
    }
    return null;
  } catch (error) {
    console.warn('Cannot fetch from Firestore:', error);
    return null;
  }
}

/**
 * Subscribe to realtime Firestore changes with auto-seeding if empty
 */
export function subscribeToFirestoreState(
  onUpdate: (remoteState: AppState) => void,
  onError?: (err: any) => void,
  initialFallbackState?: AppState,
  currentUser?: AuthUser | null
): () => void {
  const docRef = doc(db, APP_STATE_COLLECTION, MAIN_STATE_DOC);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as AppState;
        if (data && Array.isArray(data.listHocSinh) && data.listHocSinh.length > 0) {
          onUpdate(data);
        }
      } else {
        // Auto-seed Firestore on first start if document doesn't exist
        const seedState = initialFallbackState && initialFallbackState.listHocSinh.length > 0
          ? initialFallbackState
          : getInitialAppState();

        console.log('Document app_state/main_state missing, auto-seeding initial Firestore state...');
        pushStateToFirestore(seedState, {
          email: currentUser?.email || 'locquoccuong@gmail.com',
          role: currentUser?.role || 'ADMIN',
        }).catch((err) => console.warn('Could not auto-seed Firestore:', err));
      }
    },
    (err) => {
      console.warn('Firestore realtime listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Migrate local data to Firestore with pre-check, no duplicates, preserving IDs
 */
export async function migrateLocalDataToFirestore(
  localState: AppState,
  actor: { email: string; role: string }
): Promise<MigrationReport> {
  const report: MigrationReport = {
    totalSourceStudents: localState.listHocSinh.length,
    existingFirestoreStudents: 0,
    newStudentsAdded: 0,
    duplicateStudentsSkipped: 0,
    classesSynchronized: Object.keys(localState.classesData).length,
    plansSynchronized: localState.listLichCongTac.length,
    status: 'SUCCESS',
    message: '',
  };

  try {
    const remoteState = await fetchStateFromFirestore();
    const existingRemoteStudents = remoteState?.listHocSinh || [];
    report.existingFirestoreStudents = existingRemoteStudents.length;

    // Build deduplication map
    const existingMap = new Map<string, HocSinh>();
    existingRemoteStudents.forEach((s) => {
      if (s.id) existingMap.set(`id:${s.id}`, s);
      if (s.maHs) existingMap.set(`ma:${s.maHs.trim().toUpperCase()}`, s);
      const nameKey = `name:${s.hoTen.trim().toLowerCase()}_${s.lop}_${s.ngaySinh || ''}`;
      existingMap.set(nameKey, s);
    });

    const mergedStudents = [...existingRemoteStudents];

    localState.listHocSinh.forEach((localHs) => {
      const matchById = localHs.id ? existingMap.get(`id:${localHs.id}`) : undefined;
      const matchByMa = localHs.maHs ? existingMap.get(`ma:${localHs.maHs.trim().toUpperCase()}`) : undefined;
      const nameKey = `name:${localHs.hoTen.trim().toLowerCase()}_${localHs.lop}_${localHs.ngaySinh || ''}`;
      const matchByName = existingMap.get(nameKey);

      if (matchById || matchByMa || matchByName) {
        report.duplicateStudentsSkipped++;
      } else {
        mergedStudents.push(localHs);
        if (localHs.id) existingMap.set(`id:${localHs.id}`, localHs);
        if (localHs.maHs) existingMap.set(`ma:${localHs.maHs.trim().toUpperCase()}`, localHs);
        existingMap.set(nameKey, localHs);
        report.newStudentsAdded++;
      }
    });

    const mergedClasses = { ...(remoteState?.classesData || {}), ...localState.classesData };
    const mergedPlans = [...(remoteState?.listLichCongTac || localState.listLichCongTac)];
    const mergedHoSoChiDoi = [...(remoteState?.listHoSoChiDoi || localState.listHoSoChiDoi || [])];

    const finalMergedState: AppState = {
      ...localState,
      classesData: mergedClasses,
      listHocSinh: mergedStudents,
      listLichCongTac: mergedPlans,
      listHoSoChiDoi: mergedHoSoChiDoi,
    };

    // Save to Firestore
    await pushStateToFirestore(finalMergedState, actor);

    report.status = 'SUCCESS';
    report.message = `Đã chuyển thành công! Thêm mới: ${report.newStudentsAdded} HS, Bỏ qua trùng lặp: ${report.duplicateStudentsSkipped} HS, Tổng HS trên Cloud: ${mergedStudents.length}`;
    return report;
  } catch (error: any) {
    report.status = 'ERROR';
    report.message = `Lỗi trong quá trình chuyển dữ liệu: ${error.message}`;
    return report;
  }
}

