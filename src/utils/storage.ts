import { AppState } from '../types';
import { CLASS_DEFINITIONS, DEFAULT_HO_SO_GROUPS, getInitialAppState } from '../data/initialData';

export const STORAGE_KEY = 'E_DOI_THCS_DUONG_HONG_2026_DATA_V1';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialAppState();
      saveAppState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    const initial = getInitialAppState();

    // Ensure all 17 classes exist
    const mergedClasses = { ...initial.classesData, ...(parsed.classesData || {}) };
    CLASS_DEFINITIONS.forEach(c => {
      if (!mergedClasses[c.key]) {
        mergedClasses[c.key] = {
          key: c.key,
          name: c.name,
          grade: c.grade,
          diemTruong: c.diemTruong,
          gvcn: '',
          siso: null,
          soDoiVien: null,
          soThanhNien: null,
          chiDoiTruong: '',
          chiDoiPho: '',
          phongHoc: '',
          ghiChu: ''
        };
      }
    });

    // Ensure 8 hoSoGroups exist
    let hoSoGroups = parsed.hoSoGroups;
    if (!hoSoGroups || !Array.isArray(hoSoGroups) || hoSoGroups.length === 0) {
      hoSoGroups = DEFAULT_HO_SO_GROUPS;
    }

    const rawHocSinh = Array.isArray(parsed.listHocSinh) ? parsed.listHocSinh : initial.listHocSinh;
    const listHocSinh = rawHocSinh.map((hs: any, idx: number) => ({
      ...hs,
      id: hs.id ? String(hs.id) : `hs-${idx}-${hs.maHs || Date.now()}`,
      isDoanVien: hs.isDoanVien === true,
      ngayVaoDoan: hs.ngayVaoDoan || undefined,
      soTheDoan: hs.soTheDoan || undefined,
      chiDoanSinhHoat: hs.chiDoanSinhHoat || undefined,
    }));

    const rawLich = Array.isArray(parsed.listLichCongTac) ? parsed.listLichCongTac : initial.listLichCongTac;
    const listLichCongTac = rawLich.map((l: any) => {
      const initMatch = initial.listLichCongTac.find((initL) => initL.id === l.id);
      if (initMatch && (!l.detail || !l.linkedHoSoGroupIds)) {
        return {
          ...initMatch,
          ...l,
          detail: l.detail || initMatch.detail,
          linkedHoSoGroupIds: l.linkedHoSoGroupIds || initMatch.linkedHoSoGroupIds,
        };
      }
      return l;
    });

    const state: AppState = {
      schoolConfig: { ...initial.schoolConfig, ...(parsed.schoolConfig || {}) },
      classesData: mergedClasses,
      listHocSinh,
      listBchLienDoi: Array.isArray(parsed.listBchLienDoi) && parsed.listBchLienDoi.length > 0 ? parsed.listBchLienDoi : initial.listBchLienDoi,
      listChiTieu: Array.isArray(parsed.listChiTieu) && parsed.listChiTieu.length > 0 ? parsed.listChiTieu : initial.listChiTieu,
      weeklyScores: { ...(parsed.weeklyScores || {}) },
      listSuViec: Array.isArray(parsed.listSuViec) ? parsed.listSuViec : initial.listSuViec,
      listThongBao: Array.isArray(parsed.listThongBao) ? parsed.listThongBao : initial.listThongBao,
      listCoDo: Array.isArray(parsed.listCoDo) ? parsed.listCoDo : initial.listCoDo,
      listLichCongTac,
      listTieuChi: Array.isArray(parsed.listTieuChi) && parsed.listTieuChi.length > 0 ? parsed.listTieuChi : initial.listTieuChi,
      hoSoGroups,
      renLuyenState: parsed.renLuyenState || initial.renLuyenState || { danhGiaThang: {}, tongKetKy: {}, lockedKy: {} },
      listHoSoChiDoi: Array.isArray(parsed.listHoSoChiDoi) && parsed.listHoSoChiDoi.length > 0 ? parsed.listHoSoChiDoi : initial.listHoSoChiDoi || []
    };

    return state;
  } catch (err) {
    console.error('Failed to load local state, using initial:', err);
    return getInitialAppState();
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function exportBackupJSON(state: AppState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  link.setAttribute('download', `SaoLuu_eDoi_THCS_DuongHong_${timestamp}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportThiDuaCSV(
  state: AppState,
  hocKy: string,
  tuan: number,
  weeklyScores: Record<string, number>,
  calculateXepLoai: (score: number) => { text: string }
): void {
  let csv = '\uFEFFSTT,Chi đội,Điểm trường,Khối,GVCN,Sĩ số,Chi đội trưởng,Điểm tổng Tuần,Xếp loại\n';

  CLASS_DEFINITIONS.forEach((c, idx) => {
    const classObj = state.classesData[c.key] || c;
    const scoreKey = `${state.schoolConfig.schoolYear}_${hocKy}_W${tuan}_${c.key}`;
    const score = weeklyScores[scoreKey] !== undefined ? weeklyScores[scoreKey] : 100;
    const xl = calculateXepLoai(score);

    csv += `"${idx + 1}","${c.name}","${c.diemTruong}","Khối ${c.grade}","${classObj.gvcn || ''}","${classObj.siso ?? ''}","${classObj.chiDoiTruong || ''}","${score}","${xl.text}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Bang_Thi_Dua_${hocKy}_Tuan_${tuan}_THCS_Duong_Hong.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
