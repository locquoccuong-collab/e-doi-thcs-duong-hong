import React, { useState, useRef } from 'react';
import {
  Users,
  PlusCircle,
  FileSpreadsheet,
  Upload,
  Search,
  Filter,
  Edit3,
  Trash2,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Download,
  School,
  X,
  AlertCircle,
  CheckSquare,
  Award,
} from 'lucide-react';
import { AppState, HocSinh, DiemTruongType } from '../types';
import { CLASS_DEFINITIONS } from '../data/initialData';
import { ModalImportExcelHocSinh } from '../components/modals/ModalImportExcelHocSinh';
import { ModalConfirmDeleteHocSinh } from '../components/modals/ModalConfirmDeleteHocSinh';
import { parseExcelFile, ParseExcelResult } from '../utils/excelImport';
import { saveAppState } from '../utils/storage';
import { addToTrashBin, logSecurityEvent, AuthUser } from '../utils/authService';

interface QuanLyHocSinhViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  currentUser?: AuthUser | null;
}

export const QuanLyHocSinhView: React.FC<QuanLyHocSinhViewProps> = ({
  appState,
  setAppState,
  currentUser,
}) => {
  // Filters
  const [filterCampus, setFilterCampus] = useState<string>('ALL');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterDoiVien, setFilterDoiVien] = useState<string>('ALL');
  const [filterDoanVien, setFilterDoanVien] = useState<string>('ALL');
  const [filterBanTru, setFilterBanTru] = useState<string>('ALL');
  const [filterRenLuyen, setFilterRenLuyen] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isModalAddOpen, setIsModalAddOpen] = useState<boolean>(false);
  const [isModalDoanVienStatsOpen, setIsModalDoanVienStatsOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<HocSinh | null>(null);
  const [transferStudent, setTransferStudent] = useState<HocSinh | null>(null);
  const [newClassForTransfer, setNewClassForTransfer] = useState<string>('6A');

  // Multi-selection state for batch deletion
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  // Delete confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [studentsToDelete, setStudentsToDelete] = useState<HocSinh[]>([]);
  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 4500);
  };

  // Excel import modal and file state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isModalImportOpen, setIsModalImportOpen] = useState<boolean>(false);
  const [excelParseResult, setExcelParseResult] = useState<ParseExcelResult | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');

  // Form states for Add / Edit
  const [formMaHs, setFormMaHs] = useState<string>('');
  const [formHoTen, setFormHoTen] = useState<string>('');
  const [formGioiTinh, setFormGioiTinh] = useState<'Nam' | 'Nữ'>('Nam');
  const [formNgaySinh, setFormNgaySinh] = useState<string>('');
  const [formDanToc, setFormDanToc] = useState<string>('Tày');
  const [formLop, setFormLop] = useState<string>('6A');
  const [formIsDoiVien, setFormIsDoiVien] = useState<boolean>(true);
  const [formNgayVaoDoi, setFormNgayVaoDoi] = useState<string>('');
  const [formIsDoanVien, setFormIsDoanVien] = useState<boolean>(false);
  const [formNgayVaoDoan, setFormNgayVaoDoan] = useState<string>('26/03/2026');
  const [formSoTheDoan, setFormSoTheDoan] = useState<string>('');
  const [formChiDoanSinhHoat, setFormChiDoanSinhHoat] = useState<string>('Chi đoàn THCS Đường Hồng');
  const [formIsBanTru, setFormIsBanTru] = useState<boolean>(true);
  const [formRenLuyen, setFormRenLuyen] = useState<HocSinh['hoanThanhRenLuyen']>('Hoàn thành');
  const [formGhiChu, setFormGhiChu] = useState<string>('');

  const listHocSinh = appState.listHocSinh || [];

  // Filtered list with RBAC scope enforcement
  const filteredStudents = listHocSinh.filter((hs) => {
    // 1. RBAC Scope enforcement
    if (currentUser) {
      if (
        currentUser.role === 'MANAGER_PHANHIEU' ||
        (currentUser.role === 'MANAGER' && currentUser.scopeDiemTruong === 'Phân hiệu')
      ) {
        if (hs.diemTruong !== 'Phân hiệu') return false;
      } else if (
        currentUser.role === 'MANAGER_TRUONGCHINH' ||
        (currentUser.role === 'MANAGER' && currentUser.scopeDiemTruong === 'Trường chính')
      ) {
        if (hs.diemTruong !== 'Trường chính') return false;
      } else if (currentUser.role === 'TEACHER_CHIDOI' || currentUser.role === 'TEACHER') {
        if (currentUser.assignedClass && hs.lop.toUpperCase() !== currentUser.assignedClass.toUpperCase()) {
          return false;
        }
      }
    }

    if (filterCampus !== 'ALL' && hs.diemTruong !== filterCampus) return false;
    if (filterClass !== 'ALL' && hs.lop !== filterClass) return false;
    if (filterDoiVien === 'YES' && !hs.isDoiVien) return false;
    if (filterDoiVien === 'NO' && hs.isDoiVien) return false;
    if (filterDoanVien === 'YES' && !hs.isDoanVien) return false;
    if (filterDoanVien === 'NO' && hs.isDoanVien) return false;
    if (filterBanTru === 'YES' && !hs.isBanTru) return false;
    if (filterBanTru === 'NO' && hs.isBanTru) return false;
    if (filterRenLuyen !== 'ALL' && hs.hoanThanhRenLuyen !== filterRenLuyen) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = hs.hoTen.toLowerCase().includes(q);
      const matchCode = hs.maHs.toLowerCase().includes(q);
      const matchEthnic = hs.danToc.toLowerCase().includes(q);
      const matchClass = hs.lop.toLowerCase().includes(q);
      const matchDoan = hs.soTheDoan?.toLowerCase().includes(q) || hs.chiDoanSinhHoat?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchEthnic && !matchClass && !matchDoan) return false;
    }

    return true;
  });

  // Multi-selection computed values
  const displayedIds = filteredStudents.map((s, idx) => String(s.id || s.maHs || idx));
  const isAllDisplayedSelected =
    displayedIds.length > 0 && displayedIds.every((id) => selectedStudentIds.includes(id));
  const isSomeDisplayedSelected =
    displayedIds.some((id) => selectedStudentIds.includes(id)) && !isAllDisplayedSelected;

  const handleToggleSelectAll = () => {
    if (isAllDisplayedSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !displayedIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...displayedIds])));
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // KPI calculations
  const totalStudents = listHocSinh.length;
  const totalDoiVien = listHocSinh.filter((s) => s.isDoiVien).length;
  const totalDoanVien = listHocSinh.filter((s) => s.isDoanVien).length;
  const totalBanTru = listHocSinh.filter((s) => s.isBanTru).length;
  const totalHoanThanh = listHocSinh.filter(
    (s) => s.hoanThanhRenLuyen === 'Hoàn thành' || s.hoanThanhRenLuyen === 'Xuất sắc'
  ).length;

  // Open modal for new student
  const openAddModal = () => {
    setEditingStudent(null);
    setFormMaHs(`DH26${String(listHocSinh.length + 1).padStart(3, '0')}`);
    setFormHoTen('');
    setFormGioiTinh('Nam');
    setFormNgaySinh('15/05/2013');
    setFormDanToc('Tày');
    setFormLop('6A');
    setFormIsDoiVien(true);
    setFormNgayVaoDoi('15/05/2022');
    setFormIsDoanVien(false);
    setFormNgayVaoDoan('26/03/2026');
    setFormSoTheDoan('');
    setFormChiDoanSinhHoat('Chi đoàn THCS Đường Hồng');
    setFormIsBanTru(true);
    setFormRenLuyen('Hoàn thành');
    setFormGhiChu('');
    setIsModalAddOpen(true);
  };

  // Open modal for editing
  const openEditModal = (hs: HocSinh) => {
    setEditingStudent(hs);
    setFormMaHs(hs.maHs);
    setFormHoTen(hs.hoTen);
    setFormGioiTinh(hs.gioiTinh);
    setFormNgaySinh(hs.ngaySinh);
    setFormDanToc(hs.danToc);
    setFormLop(hs.lop);
    setFormIsDoiVien(hs.isDoiVien);
    setFormNgayVaoDoi(hs.ngayVaoDoi || '');
    setFormIsDoanVien(hs.isDoanVien || false);
    setFormNgayVaoDoan(hs.ngayVaoDoan || '26/03/2026');
    setFormSoTheDoan(hs.soTheDoan || '');
    setFormChiDoanSinhHoat(hs.chiDoanSinhHoat || 'Chi đoàn THCS Đường Hồng');
    setFormIsBanTru(hs.isBanTru);
    setFormRenLuyen(hs.hoanThanhRenLuyen);
    setFormGhiChu(hs.ghiChu || '');
    setIsModalAddOpen(true);
  };

  // Save add or edit
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHoTen.trim()) return;

    const classDef = CLASS_DEFINITIONS.find((c) => c.key === formLop);
    const diemTruong: DiemTruongType = classDef ? classDef.diemTruong : 'Trường chính';

    if (editingStudent) {
      // Update
      setAppState((prev) => ({
        ...prev,
        listHocSinh: prev.listHocSinh.map((s) =>
          s.id === editingStudent.id
            ? {
                ...s,
                maHs: formMaHs.trim(),
                hoTen: formHoTen.trim(),
                gioiTinh: formGioiTinh,
                ngaySinh: formNgaySinh.trim(),
                danToc: formDanToc.trim(),
                lop: formLop,
                diemTruong,
                isDoiVien: formIsDoiVien,
                ngayVaoDoi: formIsDoiVien ? formNgayVaoDoi.trim() : s.ngayVaoDoi,
                isDoanVien: formIsDoanVien,
                // If unticked, preserve saved fields in storage without deleting
                ngayVaoDoan: formIsDoanVien ? formNgayVaoDoan.trim() : (formNgayVaoDoan.trim() || s.ngayVaoDoan),
                soTheDoan: formIsDoanVien ? formSoTheDoan.trim() : (formSoTheDoan.trim() || s.soTheDoan),
                chiDoanSinhHoat: formIsDoanVien ? formChiDoanSinhHoat.trim() : (formChiDoanSinhHoat.trim() || s.chiDoanSinhHoat),
                isBanTru: formIsBanTru,
                hoanThanhRenLuyen: formRenLuyen,
                ghiChu: formGhiChu.trim(),
              }
            : s
        ),
      }));
    } else {
      // Create new
      const newStudent: HocSinh = {
        id: `hs-${Date.now()}`,
        maHs: formMaHs.trim() || `DH26${Date.now().toString().slice(-4)}`,
        hoTen: formHoTen.trim(),
        gioiTinh: formGioiTinh,
        ngaySinh: formNgaySinh.trim(),
        danToc: formDanToc.trim(),
        lop: formLop,
        diemTruong,
        isDoiVien: formIsDoiVien,
        ngayVaoDoi: formIsDoiVien ? formNgayVaoDoi.trim() : undefined,
        isDoanVien: formIsDoanVien,
        ngayVaoDoan: formIsDoanVien ? formNgayVaoDoan.trim() : undefined,
        soTheDoan: formIsDoanVien && formSoTheDoan.trim() ? formSoTheDoan.trim() : undefined,
        chiDoanSinhHoat: formIsDoanVien && formChiDoanSinhHoat.trim() ? formChiDoanSinhHoat.trim() : undefined,
        isBanTru: formIsBanTru,
        hoanThanhRenLuyen: formRenLuyen,
        ghiChu: formGhiChu.trim(),
      };

      setAppState((prev) => ({
        ...prev,
        listHocSinh: [newStudent, ...prev.listHocSinh],
      }));
    }

    setIsModalAddOpen(false);
  };

  // Request batch deletion modal
  const handleRequestDeleteBatch = () => {
    const count = selectedStudentIds.length;
    if (count === 0) {
      showToast('Vui lòng chọn ít nhất một học sinh để xóa.', 'info');
      return;
    }

    const targets = listHocSinh.filter((s, idx) => {
      const sId = String(s.id || s.maHs || idx);
      return selectedStudentIds.includes(sId) || (s.id && selectedStudentIds.includes(String(s.id)));
    });

    if (targets.length === 0) {
      showToast('Không tìm thấy học sinh được chọn để xóa.', 'error');
      setSelectedStudentIds([]);
      return;
    }

    setStudentsToDelete(targets);
    setDeleteConfirmOpen(true);
  };

  // Request single student deletion modal
  const handleRequestDeleteSingle = (hs: HocSinh) => {
    setStudentsToDelete([hs]);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete handler executed by modal
  const handleConfirmDelete = () => {
    if (studentsToDelete.length === 0) return;

    const idsToDeleteSet = new Set(
      studentsToDelete.map((s, idx) => String(s.id || s.maHs || idx))
    );
    const rawIdsSet = new Set(studentsToDelete.map((s) => s.id).filter(Boolean));
    const count = studentsToDelete.length;

    // 1. Soft-delete: Move to trash bin for recovery
    studentsToDelete.forEach((s) => {
      addToTrashBin({
        itemType: 'HOC_SINH',
        itemId: s.id || s.maHs || 'hs',
        itemTitle: `${s.hoTen} (${s.lop} - ${s.diemTruong})`,
        itemData: s,
        deletedBy: currentUser?.displayName || 'ADMIN (Thầy Lộc Quốc Cường)',
        reason: 'Xóa danh sách học sinh (xác thực qua mã PIN)',
        canRestore: true,
      });
    });

    // 2. Audit log
    logSecurityEvent(
      { email: currentUser?.email || 'locquoccuong@gmail.com', role: currentUser?.role || 'ADMIN' },
      'XÓA HỌC SINH (CHUYỂN THÙNG RÁC)',
      'HOC_SINH',
      `Đã xóa ${count} học sinh và chuyển an toàn vào Thùng rác dữ liệu (Xác thực PIN 06 số)`,
      'SUCCESS'
    );

    setAppState((prev) => {
      const updatedList = prev.listHocSinh.filter((s, idx) => {
        const sId = String(s.id || s.maHs || idx);
        const match = idsToDeleteSet.has(sId) || (s.id && rawIdsSet.has(s.id));
        return !match;
      });

      const nextState: AppState = {
        ...prev,
        listHocSinh: updatedList,
      };

      // Direct synchronous write to localStorage
      saveAppState(nextState);
      return nextState;
    });

    // Deselect deleted students and reset modal state
    setSelectedStudentIds((prev) =>
      prev.filter((id) => !idsToDeleteSet.has(id) && !rawIdsSet.has(id))
    );
    setDeleteConfirmOpen(false);
    setStudentsToDelete([]);

    showToast(`Đã chuyển ${count} học sinh vào Thùng rác dữ liệu! Thầy có thể khôi phục lại bất kỳ lúc nào.`, 'success');
  };

  // Transfer class
  const handleTransferClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferStudent || !newClassForTransfer) return;

    const classDef = CLASS_DEFINITIONS.find((c) => c.key === newClassForTransfer);
    const diemTruong: DiemTruongType = classDef ? classDef.diemTruong : 'Trường chính';

    setAppState((prev) => ({
      ...prev,
      listHocSinh: prev.listHocSinh.map((s) =>
        s.id === transferStudent.id
          ? {
              ...s,
              lop: newClassForTransfer,
              diemTruong,
              ghiChu: `${s.ghiChu ? s.ghiChu + '; ' : ''}Chuyển từ lớp ${s.lop} sang lớp ${newClassForTransfer}`,
            }
          : s
      ),
    }));

    setTransferStudent(null);
  };

  // Export students to CSV
  const handleExportCSV = () => {
    let csv =
      '\uFEFFSTT,Mã Học Sinh,Họ Và Tên,Giới Tính,Ngày Sinh,Dân Tộc,Chi Đội,Điểm Trường,Đội Viên,Ngày Vào Đội,Đoàn Viên,Ngày Vào Đoàn,Số Thẻ Đoàn,Chi Đoàn Sinh Hoạt,Bán Trú,Rèn Luyện Đội Viên,Ghi Chú\n';

    filteredStudents.forEach((s, idx) => {
      csv += `"${idx + 1}","${s.maHs}","${s.hoTen}","${s.gioiTinh}","${s.ngaySinh}","${s.danToc}","${s.lop}","${s.diemTruong}","${
        s.isDoiVien ? 'Đã kết nạp' : 'Chưa kết nạp'
      }","${s.ngayVaoDoi || ''}","${s.isDoanVien ? 'Đoàn viên' : 'Chưa kết nạp'}","${s.ngayVaoDoan || ''}","${s.soTheDoan || ''}","${s.chiDoanSinhHoat || ''}","${s.isBanTru ? 'Bán trú nội trú' : 'Đi về'}","${s.hoanThanhRenLuyen}","${s.ghiChu || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Danh_Sach_Hoc_Sinh_Doi_Vien_THCS_Duong_Hong_${Date.now()}.csv`;
    link.click();
  };

  // Import from Excel/CSV with SheetJS and interactive preview modal
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelFile(buffer, appState.listHocSinh);
      if (result.totalRows === 0) {
        alert('Tệp Excel không chứa dòng dữ liệu học sinh nào!');
        return;
      }

      setExcelParseResult(result);
      setImportFileName(file.name);
      setIsModalImportOpen(true);
    } catch (err: any) {
      alert('Lỗi đọc tệp Excel/CSV: ' + (err.message || 'Không thể phân tích tệp'));
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-700 font-extrabold uppercase tracking-wide">
            <Users className="w-5 h-5 text-yellow-500" />
            <span>Hệ Thống Quản Lý Học Sinh & Đội Viên TNTP Hồ Chí Minh</span>
          </div>
          <h2 className="font-black text-xl text-slate-800 mt-1">
            Quản Lý Hồ Sơ Đội Viên 17 Chi Đội THCS Đường Hồng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý chi tiết từng học sinh: thông tin cá nhân, dân tộc, chi đội, nề nếp bán trú, kết nạp Đội và rèn luyện đội viên.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelected}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
            title="Nhập danh sách học sinh từ file Excel (.xlsx) hoặc CSV"
          >
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Nhập từ Excel/CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition"
            title="Xuất bảng danh sách ra tệp CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất CSV</span>
          </button>

          {selectedStudentIds.length > 0 && (
            <button
              onClick={handleRequestDeleteBatch}
              className="bg-red-700 hover:bg-red-800 text-white font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition cursor-pointer"
              title={`Xóa ${selectedStudentIds.length} học sinh đang được chọn`}
            >
              <Trash2 className="w-4 h-4" />
              <span>XÓA ({selectedStudentIds.length}) ĐÃ CHỌN</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="bg-red-700 hover:bg-red-800 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Thêm Học Sinh Mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Tổng Học Sinh</div>
          <div className="text-xl font-black text-slate-800 mt-1">
            {totalStudents} <span className="text-[11px] text-slate-500 font-semibold">em / 655 dự kiến</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Toàn bộ 17 Chi đội THCS
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Đội Viên TNTP</div>
          <div className="text-xl font-black text-red-700 mt-1">
            {totalDoiVien}{' '}
            <span className="text-[11px] text-red-600 font-bold">
              ({totalStudents > 0 ? Math.round((totalDoiVien / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Đeo khăn quàng đỏ sinh hoạt Đội
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs relative">
          <div className="flex justify-between items-center">
            <div className="text-[11px] font-bold text-blue-700 uppercase">Đoàn Viên TNCS</div>
            <button
              onClick={() => setIsModalDoanVienStatsOpen(true)}
              className="text-[10px] text-blue-800 hover:underline font-bold bg-blue-100 px-1.5 py-0.5 rounded"
            >
              Chi tiết
            </button>
          </div>
          <div className="text-xl font-black text-blue-800 mt-1">
            {totalDoanVien}{' '}
            <span className="text-[11px] text-blue-600 font-bold">
              ({totalStudents > 0 ? Math.round((totalDoanVien / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[10px] text-blue-600/80 mt-1">
            Học sinh đủ 15 tuổi kết nạp Đoàn
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Bán Trú Nội Trú</div>
          <div className="text-xl font-black text-emerald-700 mt-1">
            {totalBanTru}{' '}
            <span className="text-[11px] text-emerald-600 font-bold">
              ({totalStudents > 0 ? Math.round((totalBanTru / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Ăn ở tại 2 điểm trường
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Rèn Luyện Đội</div>
          <div className="text-xl font-black text-purple-700 mt-1">
            {totalHoanThanh}{' '}
            <span className="text-[11px] text-purple-600 font-bold">
              ({totalStudents > 0 ? Math.round((totalHoanThanh / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Hoàn thành / Xuất sắc
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-slate-600 font-bold">
            <Filter className="w-4 h-4 text-red-700" />
            <span>Bộ lọc:</span>
          </div>

          {/* Campus */}
          <select
            value={filterCampus}
            onChange={(e) => setFilterCampus(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium"
          >
            <option value="ALL">Tất cả Điểm trường</option>
            <option value="Trường chính">Trường chính (8 lớp)</option>
            <option value="Phân hiệu">Phân hiệu (9 lớp)</option>
          </select>

          {/* Class */}
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium"
          >
            <option value="ALL">Tất cả 17 Chi đội</option>
            <optgroup label="Trường chính">
              {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Trường chính').map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Phân hiệu">
              {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Phân hiệu').map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Doi vien */}
          <select
            value={filterDoiVien}
            onChange={(e) => setFilterDoiVien(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium"
          >
            <option value="ALL">Đội viên: Tất cả</option>
            <option value="YES">Đã kết nạp Đội viên</option>
            <option value="NO">Chưa kết nạp Đội viên</option>
          </select>

          {/* Doan vien */}
          <select
            value={filterDoanVien}
            onChange={(e) => setFilterDoanVien(e.target.value)}
            className="border border-blue-300 rounded-lg px-2.5 py-1.5 bg-blue-50/50 font-bold text-blue-900"
          >
            <option value="ALL">Đoàn viên: Tất cả</option>
            <option value="YES">Là Đoàn viên TNCS</option>
            <option value="NO">Chưa kết nạp Đoàn</option>
          </select>

          {/* Ban tru */}
          <select
            value={filterBanTru}
            onChange={(e) => setFilterBanTru(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium"
          >
            <option value="ALL">Bán trú: Tất cả</option>
            <option value="YES">Học sinh Bán trú nội trú</option>
            <option value="NO">Học sinh Đi về</option>
          </select>

          {/* Ren luyen */}
          <select
            value={filterRenLuyen}
            onChange={(e) => setFilterRenLuyen(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium"
          >
            <option value="ALL">Rèn luyện: Tất cả</option>
            <option value="Xuất sắc">Xuất sắc</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đang rèn luyện">Đang rèn luyện</option>
            <option value="Chưa xét">Chưa xét</option>
          </select>

          {/* Search box */}
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm họ tên, mã HS, dân tộc, chi đội..."
              className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-600"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Scope Notice Banner */}
      {currentUser && currentUser.role !== 'ADMIN' && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-center justify-between text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-extrabold uppercase">Phân quyền đang áp dụng:</span>
            <span>
              Thầy/Cô đang quản lý phạm vi <b>{currentUser.assignedScope}</b>. Dữ liệu ngoài phạm vi được bảo vệ an toàn.
            </span>
          </div>
          <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
            {currentUser.role.replace('MANAGER_', '').replace('TEACHER_', '')}
          </span>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-900 text-white flex justify-between items-center text-xs">
          <span className="font-bold flex items-center space-x-2">
            <School className="w-4 h-4 text-yellow-400" />
            <span>DANH SÁCH HỌC SINH & ĐỘI VIÊN ({filteredStudents.length} em)</span>
          </span>
          <span className="text-[11px] text-slate-300">
            Trường PTDTBT THCS Đường Hồng • Năm học 2026-2027
          </span>
        </div>

        {/* Selection Action Banner */}
        {selectedStudentIds.length > 0 && (
          <div className="bg-red-50 border-b border-red-200 p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-red-900 bg-red-100 px-3 py-1 rounded-lg border border-red-300 flex items-center space-x-1.5">
                <CheckSquare className="w-4 h-4 text-red-700" />
                <span>Đã chọn: <b className="text-red-700">{selectedStudentIds.length}</b> học sinh</span>
              </span>
              <span className="text-slate-500 text-[11px]">
                (Dùng để xóa nhanh dữ liệu học sinh nhập thử hoặc cần loại bỏ)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedStudentIds([])}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-bold text-slate-700 transition cursor-pointer text-xs"
              >
                Bỏ chọn tất cả
              </button>

              <button
                type="button"
                onClick={handleRequestDeleteBatch}
                className="px-4 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black shadow-sm flex items-center space-x-1.5 transition cursor-pointer text-xs"
                title={`Xác nhận xóa ${selectedStudentIds.length} học sinh đã chọn`}
              >
                <Trash2 className="w-4 h-4" />
                <span>XÓA HỌC SINH ĐÃ CHỌN ({selectedStudentIds.length})</span>
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 text-[11px]">
                <th className="p-3 w-10 text-center no-print">
                  <input
                    type="checkbox"
                    checked={isAllDisplayedSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeDisplayedSelected;
                    }}
                    onChange={handleToggleSelectAll}
                    disabled={filteredStudents.length === 0}
                    className="w-4 h-4 rounded text-red-700 focus:ring-red-600 cursor-pointer"
                    title={
                      isAllDisplayedSelected
                        ? 'Bỏ chọn tất cả học sinh đang hiển thị'
                        : 'Chọn tất cả học sinh đang hiển thị'
                    }
                  />
                </th>
                <th className="p-3 w-12 text-center">STT</th>
                <th className="p-3">Mã HS</th>
                <th className="p-3">Họ và Tên</th>
                <th className="p-3 text-center">Giới Tính</th>
                <th className="p-3">Ngày Sinh</th>
                <th className="p-3">Dân Tộc</th>
                <th className="p-3">Chi Đội</th>
                <th className="p-3 text-center">Đoàn - Đội</th>
                <th className="p-3 text-center">Bán Trú</th>
                <th className="p-3 text-center">Rèn Luyện Đội</th>
                <th className="p-3">Ghi Chú</th>
                <th className="p-3 text-center no-print">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-slate-400 italic">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((hs, idx) => {
                  const sId = String(hs.id || hs.maHs || idx);
                  const isSelected =
                    selectedStudentIds.includes(sId) ||
                    (hs.id ? selectedStudentIds.includes(String(hs.id)) : false);
                  return (
                    <tr
                      key={sId}
                      className={`hover:bg-slate-50 transition ${
                        isSelected ? 'bg-red-50/60' : ''
                      }`}
                    >
                      <td className="p-3 text-center no-print">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStudent(sId)}
                          className="w-4 h-4 rounded text-red-700 focus:ring-red-600 cursor-pointer"
                          title={`Chọn học sinh ${hs.hoTen}`}
                        />
                      </td>
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-slate-600">{hs.maHs}</td>
                      <td className="p-3 font-bold text-slate-900 text-sm">{hs.hoTen}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            hs.gioiTinh === 'Nữ'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {hs.gioiTinh}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{hs.ngaySinh}</td>
                      <td className="p-3 font-semibold text-slate-700">{hs.danToc}</td>
                      <td className="p-3">
                        <span className="font-black text-red-700">{hs.lop}</span>
                        <span className="text-[10px] text-slate-400 block">{hs.diemTruong}</span>
                      </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {hs.isDoiVien ? (
                          <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                            Đội viên TNTP
                          </span>
                        ) : (
                          <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-medium px-2 py-0.5 rounded-full">
                            Chưa vào Đội
                          </span>
                        )}
                        {hs.isDoanVien && (
                          <span
                            title={`Ngày vào: ${hs.ngayVaoDoan || '--'}${hs.soTheDoan ? ' | Thẻ: ' + hs.soTheDoan : ''}${hs.chiDoanSinhHoat ? ' | ' + hs.chiDoanSinhHoat : ''}`}
                            className="inline-block bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-300 shadow-2xs cursor-help"
                          >
                            ★ Đoàn viên TNCS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {hs.isBanTru ? (
                        <span className="inline-block bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                          Nội trú
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Đi về</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          hs.hoanThanhRenLuyen === 'Xuất sắc'
                            ? 'bg-emerald-100 text-emerald-800'
                            : hs.hoanThanhRenLuyen === 'Hoàn thành'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {hs.hoanThanhRenLuyen}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px] max-w-[150px] truncate">
                      {hs.ghiChu || '--'}
                    </td>
                    <td className="p-3 text-center no-print">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => {
                            setTransferStudent(hs);
                            setNewClassForTransfer(hs.lop);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="Chuyển chi đội / lớp"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(hs)}
                          className="p-1 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRequestDeleteSingle(hs)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT STUDENT */}
      {isModalAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            <div className="bg-red-800 px-5 py-3.5 text-white flex justify-between items-center">
              <h3 className="font-black text-sm uppercase tracking-wide flex items-center space-x-2">
                <Users className="w-5 h-5 text-yellow-300" />
                <span>{editingStudent ? 'Cập Nhật Hồ Sơ Học Sinh' : 'Thêm Học Sinh Mới'}</span>
              </h3>
              <button
                onClick={() => setIsModalAddOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Học Sinh *</label>
                  <input
                    type="text"
                    required
                    value={formMaHs}
                    onChange={(e) => setFormMaHs(e.target.value)}
                    className="w-full border rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chi Đội (17 Lớp) *</label>
                  <select
                    value={formLop}
                    onChange={(e) => setFormLop(e.target.value)}
                    className="w-full border rounded-lg p-2 font-bold"
                  >
                    <optgroup label="Trường chính">
                      {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Trường chính').map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Phân hiệu">
                      {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Phân hiệu').map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ Và Tên Học Sinh *</label>
                <input
                  type="text"
                  required
                  value={formHoTen}
                  onChange={(e) => setFormHoTen(e.target.value)}
                  placeholder="Ví dụ: Hoàng Thị Mơ"
                  className="w-full border rounded-lg p-2 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới Tính</label>
                  <select
                    value={formGioiTinh}
                    onChange={(e) => setFormGioiTinh(e.target.value as any)}
                    className="w-full border rounded-lg p-2 font-medium"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày Sinh</label>
                  <input
                    type="text"
                    value={formNgaySinh}
                    onChange={(e) => setFormNgaySinh(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dân Tộc</label>
                  <input
                    type="text"
                    value={formDanToc}
                    onChange={(e) => setFormDanToc(e.target.value)}
                    placeholder="Tày, Mông, Dao..."
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border rounded-xl">
                <div>
                  <label className="flex items-center space-x-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsDoiVien}
                      onChange={(e) => setFormIsDoiVien(e.target.checked)}
                      className="rounded text-red-700 w-4 h-4 cursor-pointer"
                    />
                    <span>Là Đội Viên TNTP</span>
                  </label>
                  {formIsDoiVien && (
                    <input
                      type="text"
                      value={formNgayVaoDoi}
                      onChange={(e) => setFormNgayVaoDoi(e.target.value)}
                      placeholder="Ngày kết nạp Đội (DD/MM/YYYY)"
                      className="mt-1.5 w-full border rounded-lg p-1.5 text-[11px] bg-white"
                    />
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsBanTru}
                      onChange={(e) => setFormIsBanTru(e.target.checked)}
                      className="rounded text-emerald-700 w-4 h-4 cursor-pointer"
                    />
                    <span>Học Sinh Bán Trú Nội Trú</span>
                  </label>
                  <div className="mt-1.5 text-[10px] text-slate-500">
                    Ăn, ở tại khu nội trú nhà trường
                  </div>
                </div>
              </div>

              {/* Quản lý Đoàn viên TNCS Hồ Chí Minh */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2.5">
                <label className="flex items-center space-x-2 font-bold text-blue-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsDoanVien}
                    onChange={(e) => setFormIsDoanVien(e.target.checked)}
                    className="rounded text-blue-700 w-4 h-4 cursor-pointer"
                  />
                  <span>Là Đoàn viên TNCS Hồ Chí Minh</span>
                </label>
                <p className="text-[10px] text-slate-500">
                  Dành cho học sinh đủ 15 tuổi kết nạp Đoàn (học sinh có thể vừa là Đội viên vừa là Đoàn viên)
                </p>

                {formIsDoanVien && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-blue-200/60 animate-fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Ngày kết nạp Đoàn *
                      </label>
                      <input
                        type="text"
                        value={formNgayVaoDoan}
                        onChange={(e) => setFormNgayVaoDoan(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="w-full border border-blue-300 rounded-lg p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Số thẻ Đoàn viên <span className="text-slate-400 font-normal">(không bắt buộc)</span>
                      </label>
                      <input
                        type="text"
                        value={formSoTheDoan}
                        onChange={(e) => setFormSoTheDoan(e.target.value)}
                        placeholder="Ví dụ: ĐV-260901"
                        className="w-full border border-blue-300 rounded-lg p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Chi đoàn sinh hoạt <span className="text-slate-400 font-normal">(không bắt buộc)</span>
                      </label>
                      <input
                        type="text"
                        value={formChiDoanSinhHoat}
                        onChange={(e) => setFormChiDoanSinhHoat(e.target.value)}
                        placeholder="Ví dụ: Chi đoàn THCS Đường Hồng"
                        className="w-full border border-blue-300 rounded-lg p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Đánh Giá Chương Trình Rèn Luyện Đội Viên
                </label>
                <select
                  value={formRenLuyen}
                  onChange={(e) => setFormRenLuyen(e.target.value as any)}
                  className="w-full border rounded-lg p-2 font-bold"
                >
                  <option value="Xuất sắc">Xuất sắc</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Đang rèn luyện">Đang rèn luyện</option>
                  <option value="Chưa xét">Chưa xét</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú Thêm</label>
                <input
                  type="text"
                  value={formGhiChu}
                  onChange={(e) => setFormGhiChu(e.target.value)}
                  placeholder="Ghi chú hoàn cảnh khó khăn, thành tích..."
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalAddOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-black rounded-xl shadow-md"
                >
                  {editingStudent ? 'Lưu Thay Đổi' : 'Thêm Học Sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER CLASS */}
      {transferStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="bg-blue-800 px-5 py-3.5 text-white flex justify-between items-center">
              <h3 className="font-black text-sm uppercase tracking-wide flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-yellow-300" />
                <span>Chuyển Chi Đội Học Sinh</span>
              </h3>
              <button
                onClick={() => setTransferStudent(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferClass} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                <div>
                  Học sinh: <b className="text-slate-900">{transferStudent.hoTen}</b>
                </div>
                <div>
                  Mã HS: <span className="font-mono">{transferStudent.maHs}</span>
                </div>
                <div>
                  Chi đội hiện tại: <b className="text-red-700">{transferStudent.lop}</b> ({transferStudent.diemTruong})
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn Chi Đội Mới Chuyển Đến *
                </label>
                <select
                  value={newClassForTransfer}
                  onChange={(e) => setNewClassForTransfer(e.target.value)}
                  className="w-full border rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-blue-600"
                >
                  <optgroup label="Trường chính">
                    {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Trường chính').map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name} (Trường chính)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Phân hiệu">
                    {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Phân hiệu').map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name} (Phân hiệu)
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setTransferStudent(null)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl shadow-md"
                >
                  Xác Nhận Chuyển Lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW EXCEL / CSV IMPORT */}
      <ModalImportExcelHocSinh
        isOpen={isModalImportOpen}
        onClose={() => setIsModalImportOpen(false)}
        parseResult={excelParseResult}
        fileName={importFileName}
        appState={appState}
        setAppState={setAppState}
        onOpenSelectFile={() => {
          setIsModalImportOpen(false);
          setTimeout(() => fileInputRef.current?.click(), 100);
        }}
      />

      {/* MODAL: CONFIRM DELETE HOC SINH */}
      <ModalConfirmDeleteHocSinh
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setStudentsToDelete([]);
        }}
        onConfirm={handleConfirmDelete}
        studentsToDelete={studentsToDelete}
      />

      {/* MODAL: DOAN VIEN DETAILED STATS */}
      {isModalDoanVienStatsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
            <div className="bg-blue-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-300" />
                  <span>BÁO CÁO THỐNG KÊ ĐOÀN VIÊN TNCS HỒ CHÍ MINH</span>
                </h3>
                <p className="text-[11px] text-blue-200 mt-0.5">
                  Liên đội PTDTBT THCS Đường Hồng • Năm học 2026-2027
                </p>
              </div>
              <button
                onClick={() => setIsModalDoanVienStatsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-blue-800 uppercase">Toàn Liên Đội</div>
                  <div className="text-2xl font-black text-blue-950 mt-1">{totalDoanVien} <span className="text-xs text-blue-700 font-bold">đoàn viên</span></div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {totalStudents > 0 ? Math.round((totalDoanVien / totalStudents) * 100) : 0}% trên tổng {totalStudents} học sinh
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-slate-600 uppercase">Trường Chính (8 lớp)</div>
                  <div className="text-2xl font-black text-red-700 mt-1">
                    {listHocSinh.filter((s) => s.isDoanVien && s.diemTruong === 'Trường chính').length}{' '}
                    <span className="text-xs text-slate-500 font-bold">em</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Khối 9 & BCH Đội
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-slate-600 uppercase">Phân Hiệu (9 lớp)</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    {listHocSinh.filter((s) => s.isDoanVien && s.diemTruong === 'Phân hiệu').length}{' '}
                    <span className="text-xs text-slate-500 font-bold">em</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Học sinh nội trú vùng sâu
                  </div>
                </div>
              </div>

              {/* By Grade breakdown */}
              <div>
                <h4 className="font-extrabold text-slate-800 mb-2 flex items-center space-x-1.5 uppercase text-[11px]">
                  <span>1. Thống kê theo Khối lớp</span>
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {[9, 8, 7, 6].map((grade) => {
                    const gradeStudents = listHocSinh.filter((s) => {
                      const classDef = CLASS_DEFINITIONS.find((c) => c.key === s.lop);
                      return classDef?.grade === grade;
                    });
                    const gradeDoanVien = gradeStudents.filter((s) => s.isDoanVien).length;
                    return (
                      <div
                        key={grade}
                        className={`p-2.5 rounded-xl border text-center ${
                          grade === 9 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="font-bold text-slate-700">Khối {grade}</div>
                        <div className="text-lg font-black text-slate-900 mt-0.5">
                          {gradeDoanVien} <span className="text-[10px] text-slate-500 font-normal">/ {gradeStudents.length}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {gradeStudents.length > 0 ? Math.round((gradeDoanVien / gradeStudents.length) * 100) : 0}% Đoàn viên
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Breakdown by 17 Chi doi table */}
              <div>
                <h4 className="font-extrabold text-slate-800 mb-2 flex items-center space-x-1.5 uppercase text-[11px]">
                  <span>2. Thống kê theo 17 Chi đội</span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 w-10 text-center">STT</th>
                        <th className="p-2">Chi đội</th>
                        <th className="p-2">Điểm trường</th>
                        <th className="p-2 text-center">Sĩ số</th>
                        <th className="p-2 text-center text-blue-900">Số Đoàn viên</th>
                        <th className="p-2 text-center">Tỷ lệ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {CLASS_DEFINITIONS.map((c, idx) => {
                        const classStudents = listHocSinh.filter((s) => s.lop === c.key);
                        const doanCount = classStudents.filter((s) => s.isDoanVien).length;
                        const pct = classStudents.length > 0 ? Math.round((doanCount / classStudents.length) * 100) : 0;
                        return (
                          <tr key={c.key} className={doanCount > 0 ? 'bg-blue-50/30' : ''}>
                            <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-black text-slate-800">{c.name}</td>
                            <td className="p-2 text-slate-600">{c.diemTruong}</td>
                            <td className="p-2 text-center font-semibold">{classStudents.length}</td>
                            <td className="p-2 text-center font-black text-blue-800">
                              {doanCount > 0 ? `${doanCount} em` : '--'}
                            </td>
                            <td className="p-2 text-center">
                              {doanCount > 0 ? (
                                <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold text-[10px]">
                                  {pct}%
                                </span>
                              ) : (
                                <span className="text-slate-400">0%</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* List of current Đoàn viên */}
              <div>
                <h4 className="font-extrabold text-slate-800 mb-2 flex items-center space-x-1.5 uppercase text-[11px]">
                  <span>3. Danh sách Đoàn viên hiện có ({totalDoanVien} em)</span>
                </h4>
                {totalDoanVien === 0 ? (
                  <div className="p-4 bg-slate-50 border rounded-xl text-center text-slate-400 italic">
                    Chưa có học sinh nào được đánh dấu là Đoàn viên.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="p-2 w-10 text-center">STT</th>
                          <th className="p-2">Họ và Tên</th>
                          <th className="p-2">Chi đội</th>
                          <th className="p-2">Ngày kết nạp</th>
                          <th className="p-2">Số thẻ Đoàn</th>
                          <th className="p-2">Chi đoàn sinh hoạt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {listHocSinh
                          .filter((s) => s.isDoanVien)
                          .map((s, idx) => (
                            <tr key={s.id || s.maHs} className="hover:bg-slate-50">
                              <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                              <td className="p-2 font-bold text-slate-900">{s.hoTen}</td>
                              <td className="p-2 font-black text-red-700">{s.lop}</td>
                              <td className="p-2 text-slate-600">{s.ngayVaoDoan || '--'}</td>
                              <td className="p-2 font-mono text-slate-700">{s.soTheDoan || 'Chưa cấp'}</td>
                              <td className="p-2 text-slate-600">{s.chiDoanSinhHoat || 'Chi đoàn THCS Đường Hồng'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setIsModalDoanVienStatsOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Đóng Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle shadow-2xl rounded-2xl p-4 flex items-center space-x-3 text-xs font-bold text-white max-w-md border border-white/20 bg-slate-900">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          )}
          <div className="flex-1 text-slate-100">{toastMessage.text}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
