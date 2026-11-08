import * as XLSX from 'xlsx';
import { HocSinh, DiemTruongType } from '../types';
import { CLASS_DEFINITIONS } from '../data/initialData';

export interface ParsedRowResult {
  rowNum: number; // 1-indexed row number in Excel
  maHs: string;
  hoTen: string;
  gioiTinh: 'Nam' | 'Nữ';
  ngaySinh: string;
  danToc: string;
  lop: string;
  diemTruong: DiemTruongType;
  isDoiVien: boolean;
  ngayVaoDoi?: string;
  isBanTru: boolean;
  hoanThanhRenLuyen: HocSinh['hoanThanhRenLuyen'];
  isDoanVien?: boolean;
  ngayVaoDoan?: string;
  soTheDoan?: string;
  chiDoanSinhHoat?: string;
  ghiChu: string;
  status: 'valid' | 'update' | 'error';
  errors: string[];
  warnings: string[];
  existingStudentId?: string;
}

export interface ParseExcelResult {
  totalRows: number;
  validRows: ParsedRowResult[];
  errorRows: ParsedRowResult[];
  updateRows: ParsedRowResult[];
  allRows: ParsedRowResult[];
  headersFound: Record<string, string>;
  sheetName: string;
}

/**
 * Normalize text by removing diacritics and non-alphanumeric chars for header matching
 */
export function normalizeHeader(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Remove any wrapping quotes and trim text without altering Unicode accents
 */
export function cleanString(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .trim()
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
    .trim();
}

/**
 * Parse Excel date or string date to DD/MM/YYYY format
 */
export function parseExcelDate(val: any): string {
  if (val === null || val === undefined || val === '') return '';

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    const d = String(val.getDate()).padStart(2, '0');
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const y = val.getFullYear();
    return `${d}/${m}/${y}`;
  }

  if (typeof val === 'number') {
    // Excel date serial number (typically between 20000 and 60000 for realistic birth years)
    if (val > 10000 && val < 60000) {
      const utcDays = Math.floor(val - 25569);
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      const d = String(dateInfo.getUTCDate()).padStart(2, '0');
      const m = String(dateInfo.getUTCMonth() + 1).padStart(2, '0');
      const y = dateInfo.getUTCFullYear();
      return `${d}/${m}/${y}`;
    }
    return String(val);
  }

  const str = cleanString(val);
  if (!str) return '';

  // Match YYYY-MM-DD or YYYY/MM/DD
  const ymd = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymd) {
    return `${ymd[3].padStart(2, '0')}/${ymd[2].padStart(2, '0')}/${ymd[1]}`;
  }

  // Match DD-MM-YYYY or DD/MM/YYYY or D/M/YYYY
  const dmy = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmy) {
    return `${dmy[1].padStart(2, '0')}/${dmy[2].padStart(2, '0')}/${dmy[3]}`;
  }

  return str;
}

/**
 * Normalize and match class key to one of the 17 classes
 */
export function matchClassKey(val: any): { key: string; diemTruong: DiemTruongType } | null {
  if (!val) return null;
  const raw = String(val).trim().toUpperCase();

  // Direct match (e.g., '6A', '8C', '9E')
  const directDef = CLASS_DEFINITIONS.find((c) => c.key === raw);
  if (directDef) {
    return { key: directDef.key, diemTruong: directDef.diemTruong };
  }

  // Regex extract like "Chi đội 6A", "Lớp 7C", "CHI ĐỘI 8D"
  const match = raw.match(/(?:CHI\s*ĐỘI|LỚP|LOP)?\s*([6-9][A-E])/);
  if (match) {
    const key = match[1];
    const def = CLASS_DEFINITIONS.find((c) => c.key === key);
    if (def) {
      return { key: def.key, diemTruong: def.diemTruong };
    }
  }

  return null;
}

/**
 * Detect column indices based on header names
 */
function identifyHeaders(headerRow: any[]): Record<string, number> {
  const colMap: Record<string, number> = {};

  headerRow.forEach((cellVal, colIdx) => {
    const norm = normalizeHeader(cellVal);
    if (!norm) return;

    if (
      norm === 'stt' ||
      norm === 'so thu tu' ||
      norm === 'tt' ||
      norm === 'no' ||
      norm === 'order'
    ) {
      colMap['stt'] = colIdx;
    } else if (
      norm === 'ma hs' ||
      norm === 'ma hoc sinh' ||
      norm === 'mshs' ||
      norm === 'ma so hs' ||
      norm === 'ma so' ||
      norm === 'student id' ||
      norm === 'id'
    ) {
      colMap['maHs'] = colIdx;
    } else if (
      norm === 'ho va ten' ||
      norm === 'ho ten' ||
      norm === 'ho va ten hoc sinh' ||
      norm === 'ten hoc sinh' ||
      norm === 'full name' ||
      norm === 'ho ten hoc sinh'
    ) {
      colMap['hoTen'] = colIdx;
    } else if (norm === 'ho' || norm === 'ho dem' || norm === 'ho va dem' || norm === 'ho lot') {
      colMap['hoDem'] = colIdx;
    } else if (norm === 'ten' || norm === 'first name') {
      colMap['ten'] = colIdx;
    } else if (
      norm === 'gioi tinh' ||
      norm === 'phai' ||
      norm === 'gender' ||
      norm === 'sex' ||
      norm === 'nam nu'
    ) {
      colMap['gioiTinh'] = colIdx;
    } else if (
      norm === 'ngay sinh' ||
      norm === 'ngay thang nam sinh' ||
      norm === 'nam sinh' ||
      norm === 'dob' ||
      norm === 'birthday' ||
      norm === 'birth date'
    ) {
      colMap['ngaySinh'] = colIdx;
    } else if (norm === 'dan toc' || norm === 'ethnic' || norm === 'ethnicity') {
      colMap['danToc'] = colIdx;
    } else if (
      norm === 'chi doi' ||
      norm === 'lop' ||
      norm === 'chi doi lop' ||
      norm === 'lop hoc' ||
      norm === 'ten lop' ||
      norm === 'class'
    ) {
      colMap['lop'] = colIdx;
    } else if (
      norm === 'diem truong' ||
      norm === 'co so' ||
      norm === 'phan hieu' ||
      norm === 'dia diem' ||
      norm === 'campus'
    ) {
      colMap['diemTruong'] = colIdx;
    } else if (
      norm === 'doi vien' ||
      norm === 'la doi vien' ||
      norm === 'da vao doi' ||
      norm === 'ket nap doi' ||
      norm === 'tinh trang doi vien'
    ) {
      colMap['isDoiVien'] = colIdx;
    } else if (
      norm === 'ngay vao doi' ||
      norm === 'ngay ket nap' ||
      norm === 'ngay ket nap doi' ||
      norm === 'ngay vao doi tntp'
    ) {
      colMap['ngayVaoDoi'] = colIdx;
    } else if (
      norm === 'ban tru' ||
      norm === 'noi tru' ||
      norm === 'ban tru noi tru' ||
      norm === 'dien ban tru' ||
      norm === 'o ban tru' ||
      norm === 'che do ban tru'
    ) {
      colMap['isBanTru'] = colIdx;
    } else if (
      norm === 'ren luyen' ||
      norm === 'ren luyen doi vien' ||
      norm === 'chuong trinh ren luyen' ||
      norm === 'xep loai ren luyen' ||
      norm === 'hoan thanh ren luyen'
    ) {
      colMap['hoanThanhRenLuyen'] = colIdx;
    } else if (
      norm === 'doan vien' ||
      norm === 'la doan vien' ||
      norm === 'da vao doan' ||
      norm === 'ket nap doan' ||
      norm === 'doan vien tncs'
    ) {
      colMap['isDoanVien'] = colIdx;
    } else if (
      norm === 'ngay vao doan' ||
      norm === 'ngay ket nap doan' ||
      norm === 'ngay vao doan tncs'
    ) {
      colMap['ngayVaoDoan'] = colIdx;
    } else if (
      norm === 'so the doan' ||
      norm === 'so the doan vien' ||
      norm === 'the doan' ||
      norm === 'so the'
    ) {
      colMap['soTheDoan'] = colIdx;
    } else if (
      norm === 'chi doan' ||
      norm === 'chi doan sinh hoat' ||
      norm === 'chi doan thcs'
    ) {
      colMap['chiDoanSinhHoat'] = colIdx;
    } else if (
      norm === 'ghi chu' ||
      norm === 'note' ||
      norm === 'notes' ||
      norm === 'nhan xet' ||
      norm === 'thong tin them'
    ) {
      colMap['ghiChu'] = colIdx;
    }
  });

  return colMap;
}

/**
 * Parse an Excel/CSV file from ArrayBuffer
 */
export function parseExcelFile(
  fileBuffer: ArrayBuffer,
  currentStudents: HocSinh[]
): ParseExcelResult {
  const workbook = XLSX.read(fileBuffer, {
    type: 'array',
    cellDates: true,
    raw: false,
  });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('Tệp Excel không có trang tính (Sheet) nào.');
  }

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
  });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Trang tính trống, không có dữ liệu.');
  }

  // Locate the header row (search first 15 rows)
  let headerRowIndex = -1;
  let colMap: Record<string, number> = {};

  for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;

    const detected = identifyHeaders(row);
    // Needs at least "hoTen" (or "hoDem" + "ten") or "lop" or "maHs"
    if (
      detected['hoTen'] !== undefined ||
      (detected['hoDem'] !== undefined && detected['ten'] !== undefined) ||
      (detected['lop'] !== undefined && detected['stt'] !== undefined)
    ) {
      headerRowIndex = r;
      colMap = detected;
      break;
    }
  }

  // Fallback: If no recognized header found, assume row 0 is header
  if (headerRowIndex === -1 && rawRows.length > 0) {
    headerRowIndex = 0;
    colMap = identifyHeaders(rawRows[0]);
  }

  const headersFound: Record<string, string> = {};
  if (headerRowIndex >= 0) {
    Object.entries(colMap).forEach(([field, idx]) => {
      headersFound[field] = String(rawRows[headerRowIndex][idx] || field);
    });
  }

  const existingMap = new Map<string, HocSinh>();
  currentStudents.forEach((s) => {
    if (s.maHs) {
      existingMap.set(s.maHs.trim().toUpperCase(), s);
    }
  });

  const parsedList: ParsedRowResult[] = [];
  const seenMaHsInFile = new Map<string, number>(); // maHs -> rowNum

  // Iterate rows after header
  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;

    // Check if row is completely empty
    const isAllEmpty = row.every((c) => c === null || c === undefined || String(c).trim() === '');
    if (isAllEmpty) continue;

    const rowNum = r + 1;
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Full name
    let hoTen = '';
    if (colMap['hoTen'] !== undefined) {
      hoTen = cleanString(row[colMap['hoTen']]);
    } else if (colMap['hoDem'] !== undefined && colMap['ten'] !== undefined) {
      const hoDem = cleanString(row[colMap['hoDem']]);
      const ten = cleanString(row[colMap['ten']]);
      hoTen = cleanString(`${hoDem} ${ten}`);
    } else if (colMap['ten'] !== undefined) {
      hoTen = cleanString(row[colMap['ten']]);
    }

    if (!hoTen) {
      errors.push(`Dòng ${rowNum}: Thiếu Họ và Tên học sinh.`);
    }

    // 2. Student code (Mã HS)
    let maHs = '';
    if (colMap['maHs'] !== undefined) {
      maHs = cleanString(row[colMap['maHs']]);
    }
    if (!maHs) {
      // Auto-generate fallback code
      maHs = `DH26${String(Date.now()).slice(-4)}${r}`;
      warnings.push(`Dòng ${rowNum}: Mã HS để trống, hệ thống tự cấp mã tạm "${maHs}".`);
    }

    // Check duplicate inside this file
    const maHsUpper = maHs.toUpperCase();
    if (seenMaHsInFile.has(maHsUpper)) {
      const firstRow = seenMaHsInFile.get(maHsUpper);
      errors.push(`Dòng ${rowNum}: Trùng mã HS "${maHs}" với dòng ${firstRow} trong tệp.`);
    } else {
      seenMaHsInFile.set(maHsUpper, rowNum);
    }

    // Check if exists in system
    let existsInSystem = false;
    let existingStudentId: string | undefined = undefined;
    if (existingMap.has(maHsUpper)) {
      existsInSystem = true;
      existingStudentId = existingMap.get(maHsUpper)?.id;
      warnings.push(`Dòng ${rowNum}: Mã HS "${maHs}" đã có trong hệ thống (sẽ cập nhật).`);
    }

    // 3. Gender (Giới tính)
    let gioiTinh: 'Nam' | 'Nữ' = 'Nam';
    if (colMap['gioiTinh'] !== undefined) {
      const rawGender = cleanString(row[colMap['gioiTinh']]).toLowerCase();
      if (
        rawGender === 'nữ' ||
        rawGender === 'nu' ||
        rawGender === 'female' ||
        rawGender === 'f' ||
        rawGender === 'gái' ||
        rawGender === 'n'
      ) {
        gioiTinh = 'Nữ';
      } else {
        gioiTinh = 'Nam';
      }
    }

    // 4. Date of birth (Ngày sinh)
    let ngaySinh = '15/05/2013';
    if (colMap['ngaySinh'] !== undefined) {
      const parsedDate = parseExcelDate(row[colMap['ngaySinh']]);
      if (parsedDate) {
        ngaySinh = parsedDate;
      } else {
        warnings.push(`Dòng ${rowNum}: Ngày sinh không rõ, đặt mặc định "15/05/2013".`);
      }
    }

    // 5. Ethnicity (Dân tộc)
    let danToc = 'Tày';
    if (colMap['danToc'] !== undefined) {
      const parsedEthnic = cleanString(row[colMap['danToc']]);
      if (parsedEthnic) {
        danToc = parsedEthnic;
      }
    }

    // 6. Class & Campus (Chi đội & Điểm trường)
    let lop = '6A';
    let diemTruong: DiemTruongType = 'Trường chính';
    if (colMap['lop'] !== undefined) {
      const rawLop = row[colMap['lop']];
      const match = matchClassKey(rawLop);
      if (match) {
        lop = match.key;
        diemTruong = match.diemTruong;
      } else {
        errors.push(
          `Dòng ${rowNum}: Chi đội "${rawLop}" không hợp lệ (phải thuộc 17 lớp THCS Đường Hồng).`
        );
      }
    }

    // Optional campus override if explicitly provided
    if (colMap['diemTruong'] !== undefined) {
      const rawCampus = cleanString(row[colMap['diemTruong']]).toLowerCase();
      if (rawCampus.includes('phân hiệu') || rawCampus.includes('phan hieu')) {
        diemTruong = 'Phân hiệu';
      } else if (rawCampus.includes('chính') || rawCampus.includes('chinh')) {
        diemTruong = 'Trường chính';
      }
    }

    // 7. Pioneer status (Đội viên)
    let isDoiVien = true;
    if (colMap['isDoiVien'] !== undefined) {
      const rawDoiVien = cleanString(row[colMap['isDoiVien']]).toLowerCase();
      if (
        rawDoiVien.includes('chưa') ||
        rawDoiVien.includes('chua') ||
        rawDoiVien.includes('không') ||
        rawDoiVien.includes('khong') ||
        rawDoiVien === '0' ||
        rawDoiVien === 'false' ||
        rawDoiVien === 'no'
      ) {
        isDoiVien = false;
      } else {
        isDoiVien = true;
      }
    }

    // 8. Induction date (Ngày vào Đội)
    let ngayVaoDoi: string | undefined = undefined;
    if (colMap['ngayVaoDoi'] !== undefined && isDoiVien) {
      const parsedDate = parseExcelDate(row[colMap['ngayVaoDoi']]);
      if (parsedDate) {
        ngayVaoDoi = parsedDate;
      }
    }

    // 9. Boarding status (Bán trú)
    let isBanTru = true;
    if (colMap['isBanTru'] !== undefined) {
      const rawBanTru = cleanString(row[colMap['isBanTru']]).toLowerCase();
      if (
        rawBanTru.includes('đi về') ||
        rawBanTru.includes('di ve') ||
        rawBanTru.includes('ngoại trú') ||
        rawBanTru.includes('không') ||
        rawBanTru.includes('khong') ||
        rawBanTru === '0' ||
        rawBanTru === 'false'
      ) {
        isBanTru = false;
      } else {
        isBanTru = true;
      }
    }

    // 10. Training Program (Rèn luyện đội viên)
    let hoanThanhRenLuyen: HocSinh['hoanThanhRenLuyen'] = 'Hoàn thành';
    if (colMap['hoanThanhRenLuyen'] !== undefined) {
      const rawRenLuyen = cleanString(row[colMap['hoanThanhRenLuyen']]).toLowerCase();
      if (rawRenLuyen.includes('xuất sắc') || rawRenLuyen.includes('xuat sac')) {
        hoanThanhRenLuyen = 'Xuất sắc';
      } else if (rawRenLuyen.includes('chưa') || rawRenLuyen.includes('chua')) {
        hoanThanhRenLuyen = 'Chưa xét';
      } else if (rawRenLuyen.includes('đang') || rawRenLuyen.includes('dang')) {
        hoanThanhRenLuyen = 'Đang rèn luyện';
      } else {
        hoanThanhRenLuyen = 'Hoàn thành';
      }
    }

    // 11. Youth Union member (Đoàn viên TNCS Hồ Chí Minh)
    let isDoanVien = false;
    if (colMap['isDoanVien'] !== undefined) {
      const rawDoanVien = cleanString(row[colMap['isDoanVien']]).toLowerCase();
      if (
        rawDoanVien === 'có' ||
        rawDoanVien === 'co' ||
        rawDoanVien === 'rồi' ||
        rawDoanVien === 'roi' ||
        rawDoanVien === 'đoàn viên' ||
        rawDoanVien === 'doan vien' ||
        rawDoanVien === 'true' ||
        rawDoanVien === '1' ||
        rawDoanVien === 'x'
      ) {
        isDoanVien = true;
      }
    }

    let ngayVaoDoan: string | undefined = undefined;
    if (colMap['ngayVaoDoan'] !== undefined) {
      const parsedDate = parseExcelDate(row[colMap['ngayVaoDoan']]);
      if (parsedDate) {
        ngayVaoDoan = parsedDate;
        isDoanVien = true;
      }
    }

    let soTheDoan: string | undefined = undefined;
    if (colMap['soTheDoan'] !== undefined) {
      const val = cleanString(row[colMap['soTheDoan']]);
      if (val) {
        soTheDoan = val;
        isDoanVien = true;
      }
    }

    let chiDoanSinhHoat: string | undefined = undefined;
    if (colMap['chiDoanSinhHoat'] !== undefined) {
      const val = cleanString(row[colMap['chiDoanSinhHoat']]);
      if (val) {
        chiDoanSinhHoat = val;
      }
    }

    // 12. Notes (Ghi chú)
    let ghiChu = '';
    if (colMap['ghiChu'] !== undefined) {
      ghiChu = cleanString(row[colMap['ghiChu']]);
    }

    let status: 'valid' | 'update' | 'error' = 'valid';
    if (errors.length > 0) {
      status = 'error';
    } else if (existsInSystem) {
      status = 'update';
    }

    parsedList.push({
      rowNum,
      maHs,
      hoTen,
      gioiTinh,
      ngaySinh,
      danToc,
      lop,
      diemTruong,
      isDoiVien,
      ngayVaoDoi,
      isBanTru,
      hoanThanhRenLuyen,
      isDoanVien,
      ngayVaoDoan,
      soTheDoan,
      chiDoanSinhHoat,
      ghiChu,
      status,
      errors,
      warnings,
      existingStudentId,
    });
  }

  return {
    totalRows: parsedList.length,
    validRows: parsedList.filter((r) => r.status === 'valid'),
    updateRows: parsedList.filter((r) => r.status === 'update'),
    errorRows: parsedList.filter((r) => r.status === 'error'),
    allRows: parsedList,
    headersFound,
    sheetName,
  };
}

/**
 * Generate a standard template .xlsx file for users to download
 */
export function downloadExcelTemplate() {
  const headers = [
    'STT',
    'Mã HS',
    'Họ và tên',
    'Giới tính',
    'Ngày sinh',
    'Dân tộc',
    'Chi đội',
    'Điểm trường',
    'Đội viên',
    'Ngày vào Đội',
    'Đoàn viên',
    'Ngày vào Đoàn',
    'Số thẻ Đoàn',
    'Chi đoàn',
    'Bán trú',
    'Rèn luyện Đội viên',
    'Ghi chú',
  ];

  const sampleRows = [
    [
      1,
      'DH26001',
      'Hoàng Thị Mơ',
      'Nữ',
      '15/03/2012',
      'Tày',
      '9A',
      'Trường chính',
      'Đã kết nạp',
      '15/05/2021',
      'Đoàn viên',
      '26/03/2026',
      'ĐV-260901',
      'Chi đoàn THCS Đường Hồng',
      'Bán trú nội trú',
      'Xuất sắc',
      'Liên đội trưởng, học sinh giỏi',
    ],
    [
      2,
      'DH26002',
      'Đặng Văn Tiến',
      'Nam',
      '22/08/2013',
      'Dao',
      '8C',
      'Phân hiệu',
      'Đã kết nạp',
      '26/03/2022',
      'Chưa',
      '',
      '',
      '',
      'Bán trú nội trú',
      'Xuất sắc',
      'Liên đội phó Phân hiệu',
    ],
    [
      3,
      'DH26003',
      'Trần Văn Nam',
      'Nam',
      '10/11/2013',
      'Kinh',
      '8A',
      'Trường chính',
      'Đã kết nạp',
      '26/03/2022',
      'Chưa',
      '',
      '',
      '',
      'Ngoại trú',
      'Hoàn thành',
      'Chi đội trưởng 8A',
    ],
  ];

  const wsData = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 }, // STT
    { wch: 12 }, // Mã HS
    { wch: 22 }, // Họ và tên
    { wch: 10 }, // Giới tính
    { wch: 14 }, // Ngày sinh
    { wch: 10 }, // Dân tộc
    { wch: 10 }, // Chi đội
    { wch: 15 }, // Điểm trường
    { wch: 14 }, // Đội viên
    { wch: 14 }, // Ngày vào Đội
    { wch: 14 }, // Đoàn viên
    { wch: 14 }, // Ngày vào Đoàn
    { wch: 14 }, // Số thẻ Đoàn
    { wch: 24 }, // Chi đoàn
    { wch: 18 }, // Bán trú
    { wch: 20 }, // Rèn luyện
    { wch: 25 }, // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DanhSachHocSinh');

  XLSX.writeFile(wb, 'Mau_Danh_Sach_Hoc_Sinh_THCS_Duong_Hong.xlsx');
}
