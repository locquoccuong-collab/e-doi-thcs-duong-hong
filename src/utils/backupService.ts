import { AppState, FullBackupData, BackupMetadata, HocSinh, LichCongTac, HoSoChiDoiItem } from '../types';
import { CLASS_DEFINITIONS } from '../data/initialData';

/**
 * Tạo timestamp chuẩn định dạng YYYY-MM-DD_HH-mm-ss
 */
export function getBackupTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${yyyy}-${MM}-${dd}_${HH}-${mm}-${ss}`;
}

/**
 * LỚP 3: SAO LƯU TOÀN BỘ VỀ MÁY TÍNH
 * Tên tệp chuẩn: E_DOI_DUONG_HONG_FULL_BACKUP_YYYY-MM-DD_HH-MM-SS.json
 */
export function exportFullBackupJSON(state: AppState): { fileName: string; sizeBytes: number; counts: BackupMetadata['counts'] } {
  const timestamp = getBackupTimestamp();
  const fileName = `E_DOI_DUONG_HONG_FULL_BACKUP_${timestamp}.json`;

  const counts: BackupMetadata['counts'] = {
    hocSinh: state.listHocSinh?.length || 0,
    doiVien: state.listHocSinh?.filter((h) => h.isDoiVien).length || 0,
    doanVien: state.listHocSinh?.filter((h) => h.isDoanVien).length || 0,
    chiDoi: Object.keys(state.classesData || {}).length || 17,
    bchLienDoi: state.listBchLienDoi?.length || 0,
    lichCongTac: state.listLichCongTac?.length || 0,
    hoSoChiDoi: state.listHoSoChiDoi?.length || 0,
    suViec: state.listSuViec?.length || 0,
    thongBao: state.listThongBao?.length || 0,
  };

  const metadata: BackupMetadata = {
    appName: 'e-Đội THCS Đường Hồng | Trợ lý Số TPT Đội',
    version: '2026.3.0',
    exportTimestamp: new Date().toISOString(),
    schoolYear: state.schoolConfig?.schoolYear || '2026-2027',
    counts,
    integrityCheck: true,
  };

  const fullData: FullBackupData = {
    metadata,
    appState: state,
  };

  const jsonStr = JSON.stringify(fullData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return {
    fileName,
    sizeBytes: blob.size,
    counts,
  };
}

/**
 * SAO LƯU TỪNG PHÂN HỆ VỀ MÁY TÍNH
 */
export type BackupModuleType =
  | 'hocSinh'
  | 'chiDoi'
  | 'doiVien'
  | 'doanVien'
  | 'renLuyen'
  | 'keHoach'
  | 'hoSo'
  | 'thiDua';

export function exportModuleBackupJSON(state: AppState, moduleType: BackupModuleType): { fileName: string; count: number } {
  const timestamp = getBackupTimestamp();
  let data: any = null;
  let fileName = '';
  let count = 0;

  switch (moduleType) {
    case 'hocSinh':
      data = state.listHocSinh || [];
      fileName = `E_DOI_DUONG_HONG_HOC_SINH_${timestamp}.json`;
      count = data.length;
      break;
    case 'chiDoi':
      data = state.classesData || {};
      fileName = `E_DOI_DUONG_HONG_CHI_DOI_${timestamp}.json`;
      count = Object.keys(data).length;
      break;
    case 'doiVien':
      data = (state.listHocSinh || []).filter((h) => h.isDoiVien);
      fileName = `E_DOI_DUONG_HONG_DOI_VIEN_${timestamp}.json`;
      count = data.length;
      break;
    case 'doanVien':
      data = (state.listHocSinh || []).filter((h) => h.isDoanVien);
      fileName = `E_DOI_DUONG_HONG_DOAN_VIEN_${timestamp}.json`;
      count = data.length;
      break;
    case 'renLuyen':
      data = state.renLuyenState || {};
      fileName = `E_DOI_DUONG_HONG_REN_LUYEN_${timestamp}.json`;
      count = Object.keys(state.renLuyenState?.danhGiaThang || {}).length;
      break;
    case 'keHoach':
      data = state.listLichCongTac || [];
      fileName = `E_DOI_DUONG_HONG_KE_HOACH_${timestamp}.json`;
      count = data.length;
      break;
    case 'hoSo':
      data = {
        hoSoGroups: state.hoSoGroups || [],
        listHoSoChiDoi: state.listHoSoChiDoi || [],
      };
      fileName = `E_DOI_DUONG_HONG_HO_SO_${timestamp}.json`;
      count = (state.listHoSoChiDoi || []).length;
      break;
    case 'thiDua':
      data = {
        weeklyScores: state.weeklyScores || {},
        listSuViec: state.listSuViec || [],
        listTieuChi: state.listTieuChi || [],
      };
      fileName = `E_DOI_DUONG_HONG_THI_DUA_${timestamp}.json`;
      count = Object.keys(state.weeklyScores || {}).length;
      break;
  }

  const payload = {
    appName: 'e-Đội THCS Đường Hồng',
    moduleType,
    exportDate: new Date().toISOString(),
    schoolYear: state.schoolConfig?.schoolYear || '2026-2027',
    totalRecords: count,
    data,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { fileName, count };
}

/**
 * KIỂM TRA ĐỊNH DẠNG TỆP SAO LƯU TRƯỚC KHI KHÔI PHỤC
 */
export interface ValidationResult {
  isValid: boolean;
  format: 'full_backup' | 'raw_appstate' | 'module_backup' | 'unknown';
  parsedData: any;
  extractedState?: Partial<AppState>;
  summary: {
    totalStudents: number;
    totalDoiVien: number;
    totalDoanVien: number;
    totalClasses: number;
    totalPlans: number;
    totalChiDoiFiles: number;
    exportTimestamp?: string;
    appName?: string;
    schoolYear?: string;
  };
  warnings: string[];
  errorMessage?: string;
}

export function validateBackupContent(content: string): ValidationResult {
  try {
    const parsed = JSON.parse(content);
    const warnings: string[] = [];

    // Case 1: FullBackupData structure
    if (parsed.metadata && parsed.appState) {
      const state = parsed.appState as AppState;
      const students = state.listHocSinh || [];
      return {
        isValid: true,
        format: 'full_backup',
        parsedData: parsed,
        extractedState: state,
        summary: {
          totalStudents: students.length,
          totalDoiVien: students.filter((s) => s.isDoiVien).length,
          totalDoanVien: students.filter((s) => s.isDoanVien).length,
          totalClasses: Object.keys(state.classesData || {}).length,
          totalPlans: (state.listLichCongTac || []).length,
          totalChiDoiFiles: (state.listHoSoChiDoi || []).length,
          exportTimestamp: parsed.metadata.exportTimestamp,
          appName: parsed.metadata.appName,
          schoolYear: parsed.metadata.schoolYear,
        },
        warnings,
      };
    }

    // Case 2: Raw AppState
    if (parsed.classesData && (parsed.listHocSinh || parsed.schoolConfig)) {
      const state = parsed as AppState;
      const students = state.listHocSinh || [];
      warnings.push('Tệp sao lưu ở định dạng AppState gốc (hợp lệ để khôi phục).');
      return {
        isValid: true,
        format: 'raw_appstate',
        parsedData: parsed,
        extractedState: state,
        summary: {
          totalStudents: students.length,
          totalDoiVien: students.filter((s) => s.isDoiVien).length,
          totalDoanVien: students.filter((s) => s.isDoanVien).length,
          totalClasses: Object.keys(state.classesData || {}).length,
          totalPlans: (state.listLichCongTac || []).length,
          totalChiDoiFiles: (state.listHoSoChiDoi || []).length,
          schoolYear: state.schoolConfig?.schoolYear,
        },
        warnings,
      };
    }

    // Case 3: Module-specific backup
    if (parsed.moduleType && parsed.data) {
      warnings.push(`Tệp sao lưu theo phân hệ: ${parsed.moduleType}`);
      const partialState: Partial<AppState> = {};
      if (parsed.moduleType === 'hocSinh') partialState.listHocSinh = parsed.data;
      if (parsed.moduleType === 'chiDoi') partialState.classesData = parsed.data;
      if (parsed.moduleType === 'keHoach') partialState.listLichCongTac = parsed.data;
      if (parsed.moduleType === 'renLuyen') partialState.renLuyenState = parsed.data;

      return {
        isValid: true,
        format: 'module_backup',
        parsedData: parsed,
        extractedState: partialState,
        summary: {
          totalStudents: parsed.moduleType === 'hocSinh' ? (parsed.data as any[]).length : 0,
          totalDoiVien: 0,
          totalDoanVien: 0,
          totalClasses: parsed.moduleType === 'chiDoi' ? Object.keys(parsed.data).length : 0,
          totalPlans: parsed.moduleType === 'keHoach' ? (parsed.data as any[]).length : 0,
          totalChiDoiFiles: 0,
          exportTimestamp: parsed.exportDate,
          appName: parsed.appName,
          schoolYear: parsed.schoolYear,
        },
        warnings,
      };
    }

    return {
      isValid: false,
      format: 'unknown',
      parsedData: parsed,
      summary: {
        totalStudents: 0,
        totalDoiVien: 0,
        totalDoanVien: 0,
        totalClasses: 0,
        totalPlans: 0,
        totalChiDoiFiles: 0,
      },
      warnings: ['Tệp không chứa cấu trúc dữ liệu hợp lệ của ứng dụng e-Đội.'],
      errorMessage: 'Không tìm thấy các khóa dữ liệu tiêu chuẩn (listHocSinh, classesData, v.v.).',
    };
  } catch (err: any) {
    return {
      isValid: false,
      format: 'unknown',
      parsedData: null,
      summary: {
        totalStudents: 0,
        totalDoiVien: 0,
        totalDoanVien: 0,
        totalClasses: 0,
        totalPlans: 0,
        totalChiDoiFiles: 0,
      },
      warnings: [],
      errorMessage: 'Tệp không phải là JSON hợp lệ hoặc bị lỗi cú pháp: ' + err.message,
    };
  }
}

/**
 * HỢP NHẤT DỮ LIỆU KHÔI PHỤC (KHÔNG GHI ĐÈ, TRÁNH TRÙNG LẶP)
 */
export interface RestoreMergeStats {
  studentsAdded: number;
  studentsUpdated: number;
  studentsSkippedDuplicates: number;
  classesUpdated: number;
  plansAdded: number;
  chiDoiFilesAdded: number;
  renLuyenRecordsAdded: number;
  totalErrors: number;
}

export function restoreBackupIntoState(
  currentState: AppState,
  incomingState: Partial<AppState>,
  mode: 'append_no_overwrite' | 'replace_controlled'
): { newState: AppState; stats: RestoreMergeStats } {
  const stats: RestoreMergeStats = {
    studentsAdded: 0,
    studentsUpdated: 0,
    studentsSkippedDuplicates: 0,
    classesUpdated: 0,
    plansAdded: 0,
    chiDoiFilesAdded: 0,
    renLuyenRecordsAdded: 0,
    totalErrors: 0,
  };

  // If controlled replace:
  if (mode === 'replace_controlled') {
    const merged: AppState = {
      ...currentState,
      ...incomingState,
      schoolConfig: { ...currentState.schoolConfig, ...(incomingState.schoolConfig || {}) },
      classesData: { ...currentState.classesData, ...(incomingState.classesData || {}) },
      listHocSinh: incomingState.listHocSinh || currentState.listHocSinh,
      listLichCongTac: incomingState.listLichCongTac || currentState.listLichCongTac,
      listHoSoChiDoi: incomingState.listHoSoChiDoi || currentState.listHoSoChiDoi,
      renLuyenState: incomingState.renLuyenState || currentState.renLuyenState,
    };
    stats.studentsAdded = (incomingState.listHocSinh || []).length;
    stats.classesUpdated = Object.keys(incomingState.classesData || {}).length;
    return { newState: merged, stats };
  }

  // DEFAULT SAFE MODE: append_no_overwrite (Khôi phục bổ sung, chống nhân đôi)
  const existingStudentsMap = new Map<string, HocSinh>();
  // Index existing students by multiple keys to prevent any duplicate insertion
  currentState.listHocSinh.forEach((s) => {
    if (s.id) existingStudentsMap.set(`id:${s.id}`, s);
    if (s.maHs) existingStudentsMap.set(`ma:${s.maHs.trim().toUpperCase()}`, s);
    const normalizedKey = `name:${s.hoTen.trim().toLowerCase()}_${s.lop}_${s.ngaySinh || ''}`;
    existingStudentsMap.set(normalizedKey, s);
  });

  const mergedStudents = [...currentState.listHocSinh];

  if (incomingState.listHocSinh && Array.isArray(incomingState.listHocSinh)) {
    incomingState.listHocSinh.forEach((incoming) => {
      const matchById = incoming.id ? existingStudentsMap.get(`id:${incoming.id}`) : undefined;
      const matchByMa = incoming.maHs ? existingStudentsMap.get(`ma:${incoming.maHs.trim().toUpperCase()}`) : undefined;
      const normalizedKey = `name:${incoming.hoTen.trim().toLowerCase()}_${incoming.lop}_${incoming.ngaySinh || ''}`;
      const matchByName = existingStudentsMap.get(normalizedKey);

      const existingMatch = matchById || matchByMa || matchByName;

      if (existingMatch) {
        // Exists already: update empty fields only, do NOT duplicate
        let hasUpdate = false;
        if (!existingMatch.ngaySinh && incoming.ngaySinh) {
          existingMatch.ngaySinh = incoming.ngaySinh;
          hasUpdate = true;
        }
        if (!existingMatch.danToc && incoming.danToc) {
          existingMatch.danToc = incoming.danToc;
          hasUpdate = true;
        }
        if (!existingMatch.isDoanVien && incoming.isDoanVien) {
          existingMatch.isDoanVien = true;
          existingMatch.ngayVaoDoan = incoming.ngayVaoDoan;
          hasUpdate = true;
        }
        if (hasUpdate) {
          stats.studentsUpdated++;
        } else {
          stats.studentsSkippedDuplicates++;
        }
      } else {
        // New student record
        mergedStudents.push(incoming);
        if (incoming.id) existingStudentsMap.set(`id:${incoming.id}`, incoming);
        if (incoming.maHs) existingStudentsMap.set(`ma:${incoming.maHs.trim().toUpperCase()}`, incoming);
        existingStudentsMap.set(normalizedKey, incoming);
        stats.studentsAdded++;
      }
    });
  }

  // Merge classesData
  const mergedClasses = { ...currentState.classesData };
  if (incomingState.classesData) {
    Object.entries(incomingState.classesData).forEach(([key, inc]) => {
      if (!mergedClasses[key]) {
        mergedClasses[key] = inc;
        stats.classesUpdated++;
      } else {
        // Merge without overwriting populated fields
        const curr = mergedClasses[key];
        mergedClasses[key] = {
          ...curr,
          gvcn: curr.gvcn || inc.gvcn,
          siso: curr.siso ?? inc.siso,
          soDoiVien: curr.soDoiVien ?? inc.soDoiVien,
          soThanhNien: curr.soThanhNien ?? inc.soThanhNien,
          chiDoiTruong: curr.chiDoiTruong || inc.chiDoiTruong,
          chiDoiPho: curr.chiDoiPho || inc.chiDoiPho,
          phongHoc: curr.phongHoc || inc.phongHoc,
          ghiChu: curr.ghiChu || inc.ghiChu,
        };
        stats.classesUpdated++;
      }
    });
  }

  // Merge Plans (listLichCongTac)
  const existingPlanIds = new Set(currentState.listLichCongTac.map((p) => p.id));
  const mergedPlans = [...currentState.listLichCongTac];
  if (incomingState.listLichCongTac && Array.isArray(incomingState.listLichCongTac)) {
    incomingState.listLichCongTac.forEach((p) => {
      if (!existingPlanIds.has(p.id)) {
        mergedPlans.push(p);
        existingPlanIds.add(p.id);
        stats.plansAdded++;
      }
    });
  }

  // Merge Chi Doi Electronic Records (listHoSoChiDoi)
  const existingFileIds = new Set((currentState.listHoSoChiDoi || []).map((f) => f.id));
  const mergedHoSoChiDoi = [...(currentState.listHoSoChiDoi || [])];
  if (incomingState.listHoSoChiDoi && Array.isArray(incomingState.listHoSoChiDoi)) {
    incomingState.listHoSoChiDoi.forEach((f) => {
      if (!existingFileIds.has(f.id)) {
        mergedHoSoChiDoi.push(f);
        existingFileIds.add(f.id);
        stats.chiDoiFilesAdded++;
      }
    });
  }

  // Merge Ren Luyen State
  const mergedRenLuyen = {
    danhGiaThang: {
      ...(currentState.renLuyenState?.danhGiaThang || {}),
      ...(incomingState.renLuyenState?.danhGiaThang || {}),
    },
    tongKetKy: {
      ...(currentState.renLuyenState?.tongKetKy || {}),
      ...(incomingState.renLuyenState?.tongKetKy || {}),
    },
    lockedKy: {
      ...(currentState.renLuyenState?.lockedKy || {}),
      ...(incomingState.renLuyenState?.lockedKy || {}),
    },
  };
  stats.renLuyenRecordsAdded = Object.keys(incomingState.renLuyenState?.danhGiaThang || {}).length;

  const newState: AppState = {
    ...currentState,
    listHocSinh: mergedStudents,
    classesData: mergedClasses,
    listLichCongTac: mergedPlans,
    listHoSoChiDoi: mergedHoSoChiDoi,
    renLuyenState: mergedRenLuyen,
  };

  return { newState, stats };
}
