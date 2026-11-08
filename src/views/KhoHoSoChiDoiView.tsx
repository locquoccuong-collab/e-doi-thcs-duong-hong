import React, { useState, useMemo, useRef } from 'react';
import {
  FolderTree,
  FolderOpen,
  FileText,
  UploadCloud,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Trash2,
  RefreshCw,
  Eye,
  History,
  FileSpreadsheet,
  FileCheck2,
  Plus,
  X,
  ChevronRight,
  Calendar,
  ShieldCheck,
  School,
  Mountain,
  UserCheck,
  MessageSquare,
  Check,
  ExternalLink,
  ChevronDown,
  Layers,
  FileCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  AppState,
  HoSoChiDoiItem,
  ThuMucChiDoiId,
  TrangThaiHoSoChiDoi,
  NhanXetTptHoSo,
  HoSoChiDoiVersion,
} from '../types';
import { CLASS_DEFINITIONS, THU_MUC_CHI_DOI_DEFS, ThuMucChiDoiDef } from '../data/initialData';
import {
  saveFileToStorage,
  downloadFileFromStorage,
  deleteFileFromStorage,
} from '../utils/fileStorage';

const MONTH_COLS = [9, 10, 11, 12, 1, 2, 3, 4, 5];

const NHAN_XET_MAU = [
  'Hồ sơ đầy đủ',
  'Hồ sơ cần bổ sung',
  'Hồ sơ cần chỉnh sửa',
  'Nội dung cần hoàn thiện',
];

import { AuthUser } from '../utils/authService';

interface KhoHoSoChiDoiViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  defaultClassKey?: string | null;
  onBackToChiDoi?: () => void;
  currentUser?: AuthUser | null;
}

type TabMode = 'chi_doi' | 'bang_theo_doi_thang' | 'kho_toan_truong';

export const KhoHoSoChiDoiView: React.FC<KhoHoSoChiDoiViewProps> = ({
  appState,
  setAppState,
  defaultClassKey,
  onBackToChiDoi,
  currentUser,
}) => {
  // Mode tabs
  const [tabMode, setTabMode] = useState<TabMode>('chi_doi');

  // Initial class based on user scope
  const initialClassKey =
    defaultClassKey ||
    currentUser?.assignedClass ||
    (currentUser?.scopeDiemTruong === 'Phân hiệu' ? '8C' : '9A');

  // Role selector: TPT / BGH vs GVCN
  const [userRole, setUserRole] = useState<'tpt' | 'gvcn'>(
    currentUser?.role === 'ADMIN' ? 'tpt' : 'gvcn'
  );

  // Selected Class in 'chi_doi' mode
  const [selectedClassKey, setSelectedClassKey] = useState<string>(initialClassKey);

  // Selected Folder in 'chi_doi' mode (null = all 8 folders)
  const [activeFolderId, setActiveFolderId] = useState<ThuMucChiDoiId | 'all'>('all');

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTrangThai, setFilterTrangThai] = useState<string>('all');
  const [filterDiemTruong, setFilterDiemTruong] = useState<'all' | 'Trường chính' | 'Phân hiệu'>(
    currentUser?.scopeDiemTruong === 'Phân hiệu'
      ? 'Phân hiệu'
      : currentUser?.scopeDiemTruong === 'Trường chính'
      ? 'Trường chính'
      : 'all'
  );

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [replaceTargetItem, setReplaceTargetItem] = useState<HoSoChiDoiItem | null>(null);
  const [reviewTargetItem, setReviewTargetItem] = useState<HoSoChiDoiItem | null>(null);
  const [historyTargetItem, setHistoryTargetItem] = useState<HoSoChiDoiItem | null>(null);

  // Upload Form State
  const [uploadFolderId, setUploadFolderId] = useState<ThuMucChiDoiId>('01_ke_hoach_nam_hoc');
  const [uploadTenHoSo, setUploadTenHoSo] = useState<string>('');
  const [uploadThoiGian, setUploadThoiGian] = useState<string>('Tháng 11/2026');
  const [uploadThangBaoCao, setUploadThangBaoCao] = useState<number>(11);
  const [uploadGvGui, setUploadGvGui] = useState<string>('');
  const [uploadGhiChu, setUploadGhiChu] = useState<string>('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Replacement Form State
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceNote, setReplaceNote] = useState<string>('');
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Review Form State (TPT)
  const [reviewTrangThai, setReviewTrangThai] = useState<TrangThaiHoSoChiDoi>('Đã kiểm tra');
  const [reviewNhanXet, setReviewNhanXet] = useState<string>('Hồ sơ đầy đủ');
  const [reviewGhiChu, setReviewGhiChu] = useState<string>('');

  // All electronic portfolio items
  const allHoSoList = useMemo(() => appState.listHoSoChiDoi || [], [appState.listHoSoChiDoi]);

  // Selected class info
  const selectedClassDef = useMemo(
    () => CLASS_DEFINITIONS.find((c) => c.key === selectedClassKey) || CLASS_DEFINITIONS[0],
    [selectedClassKey]
  );
  const selectedClassData = useMemo(
    () => appState.classesData[selectedClassKey] || selectedClassDef,
    [appState.classesData, selectedClassKey, selectedClassDef]
  );

  // Class items
  const classItems = useMemo(
    () => allHoSoList.filter((item) => item.classKey === selectedClassKey),
    [allHoSoList, selectedClassKey]
  );

  // Stats for selected class
  const classStats = useMemo(() => {
    const totalFiles = classItems.length;
    const completedCount = classItems.filter(
      (item) => item.trangThai === 'Đã kiểm tra' || item.trangThai === 'Đã gửi'
    ).length;
    const needRevisionCount = classItems.filter(
      (item) => item.trangThai === 'Cần bổ sung'
    ).length;
    // Standard target: at least 1 plan year, 1 plan month, reports...
    // Let's compute missing standard folders out of the 8 folders
    const representedFolderIds = new Set(classItems.map((i) => i.thuMucId));
    const missingFoldersCount = THU_MUC_CHI_DOI_DEFS.filter(
      (f) => !representedFolderIds.has(f.id)
    ).length;

    return {
      totalFiles,
      completedCount,
      needRevisionCount,
      missingFoldersCount,
    };
  }, [classItems]);

  // Handle Drag & Drop in Upload Modal
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setUploadErrorMessage('');
    const validExts = ['doc', 'docx', 'xls', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png'];
    const maxBytes = 50 * 1024 * 1024; // 50MB

    const accepted: File[] = [];
    for (const f of files) {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      if (!validExts.includes(ext)) {
        setUploadErrorMessage(
          `Tệp "${f.name}" không đúng định dạng cho phép (DOC, DOCX, XLS, XLSX, PDF, JPG, PNG).`
        );
        return;
      }
      if (f.size > maxBytes) {
        setUploadErrorMessage(
          `Tệp "${f.name}" có dung lượng quá lớn (${(f.size / (1024 * 1024)).toFixed(
            1
          )} MB). Giới hạn tối đa là 50 MB/tệp.`
        );
        return;
      }
      accepted.push(f);
    }
    setUploadFiles((prev) => [...prev, ...accepted]);
    if (!uploadTenHoSo && accepted.length === 1) {
      // Auto-suggest name from file
      const raw = accepted[0].name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      setUploadTenHoSo(raw);
    }
  };

  // Open upload modal with preselected folder
  const handleOpenUpload = (targetFolderId?: ThuMucChiDoiId) => {
    setUploadFolderId(targetFolderId || (activeFolderId !== 'all' ? activeFolderId : '01_ke_hoach_nam_hoc'));
    setUploadTenHoSo('');
    setUploadThoiGian('Tháng 11/2026');
    setUploadThangBaoCao(11);
    setUploadGvGui(selectedClassData.gvcn || `GVCN Chi đội ${selectedClassKey}`);
    setUploadGhiChu('');
    setUploadFiles([]);
    setUploadErrorMessage('');
    setUploadModalOpen(true);
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFiles.length === 0) {
      setUploadErrorMessage('Vui lòng chọn ít nhất một tệp đính kèm.');
      return;
    }
    if (!uploadTenHoSo.trim() && uploadFiles.length === 1) {
      setUploadErrorMessage('Vui lòng nhập tên hồ sơ.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())} ngày ${pad(
        now.getDate()
      )}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

      const newItems: HoSoChiDoiItem[] = [];

      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        const saved = await saveFileToStorage(file);
        const ext = file.name.split('.').pop()?.toLowerCase() || 'other';

        let detectedType: HoSoChiDoiItem['fileType'] = 'other';
        if (['doc', 'docx', 'xls', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
          detectedType = ext as HoSoChiDoiItem['fileType'];
        }

        const title =
          uploadFiles.length === 1
            ? uploadTenHoSo.trim()
            : `${uploadTenHoSo.trim() || 'Hồ sơ'} (${i + 1}/${uploadFiles.length}) - ${file.name}`;

        const item: HoSoChiDoiItem = {
          id: `hs_${selectedClassKey}_${uploadFolderId}_${Date.now()}_${i}`,
          classKey: selectedClassKey,
          thuMucId: uploadFolderId,
          tenHoSo: title,
          thoiGianThucHien: uploadThoiGian,
          thangBaoCao: uploadFolderId === '03_bao_cao_thang' ? uploadThangBaoCao : undefined,
          namHoc: appState.schoolConfig.schoolYear || '2026-2027',
          gvGui: uploadGvGui || selectedClassData.gvcn || `GVCN ${selectedClassKey}`,
          thoiGianGui: timeStr,
          fileId: saved.fileId,
          fileName: saved.fileName,
          fileSize: saved.fileSize,
          fileType: detectedType,
          trangThai: 'Đã gửi',
          ghiChu: uploadGhiChu.trim() || undefined,
          version: 1,
          history: [],
        };
        newItems.push(item);
      }

      setAppState((prev) => ({
        ...prev,
        listHoSoChiDoi: [...(prev.listHoSoChiDoi || []), ...newItems],
      }));

      setUploadModalOpen(false);
      setUploadFiles([]);
    } catch (err: any) {
      setUploadErrorMessage('Có lỗi xảy ra khi lưu tệp vào bộ nhớ: ' + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit File Replacement
  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceTargetItem || !replaceFile) return;

    setIsSubmitting(true);
    try {
      const saved = await saveFileToStorage(replaceFile);
      const ext = replaceFile.name.split('.').pop()?.toLowerCase() || 'other';
      let detectedType: HoSoChiDoiItem['fileType'] = 'other';
      if (['doc', 'docx', 'xls', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
        detectedType = ext as HoSoChiDoiItem['fileType'];
      }

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())} ngày ${pad(
        now.getDate()
      )}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

      // Push old version to history
      const oldVer: HoSoChiDoiVersion = {
        version: replaceTargetItem.version,
        fileId: replaceTargetItem.fileId,
        fileName: replaceTargetItem.fileName,
        fileSize: replaceTargetItem.fileSize,
        uploadDate: replaceTargetItem.thoiGianGui,
        uploadedBy: replaceTargetItem.gvGui,
        note: replaceNote.trim() || `Thay thế phiên bản v${replaceTargetItem.version}`,
      };

      const updatedItem: HoSoChiDoiItem = {
        ...replaceTargetItem,
        fileId: saved.fileId,
        fileName: saved.fileName,
        fileSize: saved.fileSize,
        fileType: detectedType,
        thoiGianGui: timeStr,
        version: replaceTargetItem.version + 1,
        trangThai: 'Đã cập nhật',
        history: [...(replaceTargetItem.history || []), oldVer],
      };

      setAppState((prev) => ({
        ...prev,
        listHoSoChiDoi: (prev.listHoSoChiDoi || []).map((i) =>
          i.id === replaceTargetItem.id ? updatedItem : i
        ),
      }));

      setReplaceTargetItem(null);
      setReplaceFile(null);
      setReplaceNote('');
    } catch (err: any) {
      alert('Không thể thay thế tệp: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit TPT Review & Feedback
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTargetItem) return;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    const updatedItem: HoSoChiDoiItem = {
      ...reviewTargetItem,
      trangThai: reviewTrangThai,
      nhanXetTpt: reviewNhanXet,
      ngayKiemTra: dateStr,
      nguoiKiemTra: `${appState.schoolConfig.tptName} (TPT Đội)`,
      ghiChu: reviewGhiChu.trim() || reviewTargetItem.ghiChu,
    };

    setAppState((prev) => ({
      ...prev,
      listHoSoChiDoi: (prev.listHoSoChiDoi || []).map((i) =>
        i.id === reviewTargetItem.id ? updatedItem : i
      ),
    }));

    setReviewTargetItem(null);
  };

  // Delete item with confirmation
  const handleDeleteItem = async (item: HoSoChiDoiItem) => {
    const ok = window.confirm(
      `Thầy/Cô có chắc chắn muốn xóa hồ sơ: "${item.tenHoSo}" (${item.fileName}) không?`
    );
    if (!ok) return;

    try {
      await deleteFileFromStorage(item.fileId);
      // Clean up historical files
      if (item.history) {
        for (const h of item.history) {
          await deleteFileFromStorage(h.fileId).catch(() => {});
        }
      }
    } catch {
      // Ignore deletion errors
    }

    setAppState((prev) => ({
      ...prev,
      listHoSoChiDoi: (prev.listHoSoChiDoi || []).filter((i) => i.id !== item.id),
    }));
  };

  // Export full school records to Excel
  const handleExportAllToExcel = () => {
    const rows = allHoSoList.map((item, idx) => {
      const folderDef = THU_MUC_CHI_DOI_DEFS.find((f) => f.id === item.thuMucId);
      const classDef = CLASS_DEFINITIONS.find((c) => c.key === item.classKey);
      return {
        'STT': idx + 1,
        'Chi đội': `Chi đội ${item.classKey}`,
        'Điểm trường': classDef?.diemTruong || '',
        'Khối': classDef?.grade || '',
        'Thư mục': `${folderDef?.code}. ${folderDef?.name}`,
        'Tên hồ sơ': item.tenHoSo,
        'Tên tệp gốc': item.fileName,
        'Định dạng': item.fileType.toUpperCase(),
        'Dung lượng': item.fileSize,
        'Phiên bản': `v${item.version}`,
        'Thời gian thực hiện': item.thoiGianThucHien,
        'Tháng báo cáo': item.thangBaoCao ? `Tháng ${item.thangBaoCao}` : '',
        'Người nộp / GVCN': item.gvGui,
        'Thời gian nộp': item.thoiGianGui,
        'Trạng thái': item.trangThai,
        'Nhận xét của TPT': item.nhanXetTpt || '',
        'Người kiểm tra': item.nguoiKiemTra || '',
        'Ngày kiểm tra': item.ngayKiemTra || '',
        'Ghi chú': item.ghiChu || '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ho_So_17_Chi_Doi');
    XLSX.writeFile(
      wb,
      `eDoi_KhoHoSo_17ChiDoi_${appState.schoolConfig.schoolYear || '2026-2027'}.xlsx`
    );
  };

  // Filtered files in 'chi_doi' view
  const displayClassFiles = useMemo(() => {
    let list = classItems;
    if (activeFolderId !== 'all') {
      list = list.filter((item) => item.thuMucId === activeFolderId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.tenHoSo.toLowerCase().includes(q) ||
          i.fileName.toLowerCase().includes(q) ||
          i.gvGui.toLowerCase().includes(q)
      );
    }
    if (filterTrangThai !== 'all') {
      list = list.filter((i) => i.trangThai === filterTrangThai);
    }
    return list;
  }, [classItems, activeFolderId, searchQuery, filterTrangThai]);

  // Matrix data for Monthly Reports (17 classes x 9 months)
  const monthlyReportsMatrix = useMemo(() => {
    return CLASS_DEFINITIONS.map((c) => {
      const classData = appState.classesData[c.key] || c;
      const classMonthlyReports = allHoSoList.filter(
        (item) => item.classKey === c.key && item.thuMucId === '03_bao_cao_thang'
      );

      const monthsMap: Record<number, HoSoChiDoiItem | undefined> = {};
      MONTH_COLS.forEach((m) => {
        monthsMap[m] = classMonthlyReports.find((r) => r.thangBaoCao === m);
      });

      const submittedCount = Object.values(monthsMap).filter(Boolean).length;
      const checkedCount = Object.values(monthsMap).filter(
        (r) => r?.trangThai === 'Đã kiểm tra'
      ).length;

      return {
        classDef: c,
        classData,
        monthsMap,
        submittedCount,
        checkedCount,
      };
    });
  }, [allHoSoList, appState.classesData]);

  // Filtered master records for 'kho_toan_truong'
  const filteredMasterRecords = useMemo(() => {
    let list = allHoSoList;
    if (filterDiemTruong !== 'all') {
      const validKeys = new Set(
        CLASS_DEFINITIONS.filter((c) => c.diemTruong === filterDiemTruong).map((c) => c.key)
      );
      list = list.filter((i) => validKeys.has(i.classKey));
    }
    if (filterTrangThai !== 'all') {
      list = list.filter((i) => i.trangThai === filterTrangThai);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.tenHoSo.toLowerCase().includes(q) ||
          i.fileName.toLowerCase().includes(q) ||
          i.classKey.toLowerCase().includes(q) ||
          i.gvGui.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allHoSoList, filterDiemTruong, filterTrangThai, searchQuery]);

  const getStatusBadge = (status: TrangThaiHoSoChiDoi) => {
    switch (status) {
      case 'Đã kiểm tra':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Đã gửi':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Đã cập nhật':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Cần bổ sung':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Chưa gửi':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getFileTypeIcon = (ext: string) => {
    const e = ext.toLowerCase();
    if (e.includes('xls')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
    }
    if (e.includes('doc')) {
      return <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />;
    }
    if (e.includes('pdf')) {
      return <FileText className="w-4 h-4 text-red-600 flex-shrink-0" />;
    }
    if (e.includes('jpg') || e.includes('png') || e.includes('jpeg')) {
      return <Eye className="w-4 h-4 text-purple-600 flex-shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-slate-600 flex-shrink-0" />;
  };

  return (
    <div className="space-y-5">
      {/* Top Banner / Role & Global Navigation */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-red-700 font-extrabold uppercase tracking-wide">
              <FolderTree className="w-5 h-5 text-red-600" />
              <span>Nhóm 2 • Kho Hồ Sơ Điện Tử 17 Chi Đội THCS Đường Hồng</span>
            </div>
            <h2 className="font-black text-xl text-slate-800 mt-1">
              Quản Lý Hệ Thống 8 Thư Mục Hồ Sơ & Báo Cáo Chi Đội
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Số hóa toàn diện kế hoạch, báo cáo định kỳ 9 tháng, biên bản đại hội và minh chứng hoạt động của 17 Chi đội
            </p>
          </div>

          {/* Action Toolbar & Role Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Role Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setUserRole('tpt')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  userRole === 'tpt'
                    ? 'bg-red-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TPT / Ban Giám Hiệu</span>
              </button>
              <button
                onClick={() => setUserRole('gvcn')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  userRole === 'gvcn'
                    ? 'bg-red-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>GV Phụ Trách Chi Đội</span>
              </button>
            </div>

            {/* Back Button if opened from ChiDoiView */}
            {onBackToChiDoi && (
              <button
                onClick={onBackToChiDoi}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại 17 Chi đội</span>
              </button>
            )}

            {/* Export all to Excel */}
            <button
              onClick={handleExportAllToExcel}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
              title="Xuất toàn bộ danh mục hồ sơ 17 Chi đội sang định dạng Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Excel Kho Hồ Sơ</span>
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex border-b border-slate-200 mt-5 space-x-1 overflow-x-auto">
          <button
            onClick={() => setTabMode('chi_doi')}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              tabMode === 'chi_doi'
                ? 'border-red-700 text-red-700 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-red-600" />
            <span>1. Hồ Sơ Từng Chi Đội (8 Thư Mục)</span>
          </button>

          <button
            onClick={() => setTabMode('bang_theo_doi_thang')}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              tabMode === 'bang_theo_doi_thang'
                ? 'border-red-700 text-red-700 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>2. Bảng Theo Dõi Báo Cáo Tháng (17 Chi Đội x 9 Tháng)</span>
          </button>

          <button
            onClick={() => setTabMode('kho_toan_truong')}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              tabMode === 'kho_toan_truong'
                ? 'border-red-700 text-red-700 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>3. Kho Hồ Sơ Toàn Trường (Tra Cứu Nhanh & Lọc Tệp)</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          MODE 1: HỒ SƠ TỪNG CHI ĐỘI (8 THƯ MỤC CHUẨN)
      ======================================================== */}
      {tabMode === 'chi_doi' && (
        <div className="space-y-5">
          {/* Class Selector Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center space-x-3 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs font-black text-slate-700 uppercase whitespace-nowrap flex items-center space-x-1.5">
                <School className="w-4 h-4 text-red-600" />
                <span>Chọn Chi đội:</span>
              </span>
              <div className="flex space-x-1.5 overflow-x-auto custom-scrollbar py-0.5">
                {CLASS_DEFINITIONS.map((c) => {
                  const isSel = c.key === selectedClassKey;
                  const count = allHoSoList.filter((i) => i.classKey === c.key).length;
                  return (
                    <button
                      key={c.key}
                      onClick={() => {
                        setSelectedClassKey(c.key);
                        setActiveFolderId('all');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                        isSel
                          ? 'bg-red-700 text-white shadow-2xs scale-102'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          isSel ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <button
                onClick={() => handleOpenUpload()}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>TẢI HỒ SƠ MỚI</span>
              </button>
            </div>
          </div>

          {/* Selected Class Profile Header Card */}
          <div className="bg-gradient-to-r from-red-800 via-rose-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-red-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-red-950 px-2 py-0.5 rounded-full shadow-2xs">
                    {selectedClassDef.diemTruong}
                  </span>
                  <span className="text-xs text-rose-200">Khối {selectedClassDef.grade} • THCS Đường Hồng</span>
                </div>
                <h3 className="text-2xl font-black mt-1 flex items-center space-x-2">
                  <span>Kho Hồ Sơ Điện Tử Chi Đội {selectedClassDef.name}</span>
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-rose-100 mt-1">
                  <span>
                    GV phụ trách: <b className="text-white">{selectedClassData.gvcn || 'Chưa cập nhật GVCN'}</b>
                  </span>
                  <span>•</span>
                  <span>
                    Sĩ số: <b className="text-white">{selectedClassData.siso || '--'}</b> học sinh
                  </span>
                  <span>•</span>
                  <span>
                    Chi đội trưởng: <b className="text-white">{selectedClassData.chiDoiTruong || '--'}</b>
                  </span>
                </div>
              </div>

              {/* Stat Counters on the Class Banner */}
              <div className="grid grid-cols-3 gap-2.5 w-full md:w-auto">
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15 text-center min-w-[95px]">
                  <div className="text-[10px] text-rose-200 font-bold uppercase">Tổng tệp</div>
                  <div className="text-xl font-black text-white mt-0.5">{classStats.totalFiles}</div>
                  <div className="text-[10px] text-rose-300">đã lưu</div>
                </div>

                <div className="bg-emerald-500/20 backdrop-blur-xs p-3 rounded-xl border border-emerald-400/30 text-center min-w-[95px]">
                  <div className="text-[10px] text-emerald-200 font-bold uppercase">Hoàn thành</div>
                  <div className="text-xl font-black text-emerald-300 mt-0.5">{classStats.completedCount}</div>
                  <div className="text-[10px] text-emerald-200">đã duyệt</div>
                </div>

                <div className="bg-amber-500/20 backdrop-blur-xs p-3 rounded-xl border border-amber-400/30 text-center min-w-[95px]">
                  <div className="text-[10px] text-amber-200 font-bold uppercase">Cần bổ sung</div>
                  <div className="text-xl font-black text-amber-300 mt-0.5">{classStats.needRevisionCount}</div>
                  <div className="text-[10px] text-amber-200">hồ sơ</div>
                </div>
              </div>
            </div>
          </div>

          {/* 8 Standard Folders Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wide">
                <FolderTree className="w-4 h-4 text-red-600" />
                <span>8 Thư Mục Hồ Sơ Chuẩn Hóa Theo Quy Định Đội</span>
              </div>
              {activeFolderId !== 'all' && (
                <button
                  onClick={() => setActiveFolderId('all')}
                  className="text-xs text-red-700 hover:text-red-900 font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <span>Xem tất cả 8 thư mục</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {THU_MUC_CHI_DOI_DEFS.map((f) => {
                const count = classItems.filter((i) => i.thuMucId === f.id).length;
                const isSelected = activeFolderId === f.id;
                const hasApproved = classItems.some(
                  (i) => i.thuMucId === f.id && i.trangThai === 'Đã kiểm tra'
                );

                return (
                  <div
                    key={f.id}
                    onClick={() => setActiveFolderId(isSelected ? 'all' : f.id)}
                    className={`bg-white rounded-2xl border p-4 transition cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                      isSelected
                        ? 'border-red-600 ring-2 ring-red-100 shadow-sm bg-red-50/20'
                        : 'border-slate-200 hover:border-red-300'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition ${
                            isSelected
                              ? 'bg-red-700 text-white'
                              : 'bg-red-100 text-red-800 group-hover:bg-red-700 group-hover:text-white'
                          }`}
                        >
                          {f.code}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                            count > 0
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>{count} tệp</span>
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-red-700 transition line-clamp-2">
                        {f.name}
                      </h4>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 mt-3 flex justify-between items-center text-[11px]">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                        {f.badge}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenUpload(f.id);
                        }}
                        className="text-red-700 hover:text-red-900 font-bold flex items-center space-x-1 cursor-pointer"
                        title="Tải tệp vào thư mục này"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm tệp</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* File Management & Filtering Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-red-600" />
                  <span>
                    Danh Sách Tệp Đã Lưu ({displayClassFiles.length} tệp)
                    {activeFolderId !== 'all' && (
                      <span className="text-red-700 font-bold ml-1">
                        — Thư mục {THU_MUC_CHI_DOI_DEFS.find((f) => f.id === activeFolderId)?.code}
                      </span>
                    )}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tệp lưu thực tế trong bộ nhớ an toàn IndexedDB. Thầy/Cô có thể tải về máy, thay thế tệp mới và xem lịch sử phiên bản.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên hồ sơ, tên tệp..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-600 w-full sm:w-48"
                  />
                </div>

                <select
                  value={filterTrangThai}
                  onChange={(e) => setFilterTrangThai(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Đã kiểm tra">Đã kiểm tra</option>
                  <option value="Đã gửi">Đã gửi</option>
                  <option value="Đã cập nhật">Đã cập nhật</option>
                  <option value="Cần bổ sung">Cần bổ sung</option>
                </select>
              </div>
            </div>

            {/* Files Table / List */}
            {displayClassFiles.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl p-6 space-y-3">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="text-slate-600 font-bold text-sm">
                  Chưa có hồ sơ nào trong thư mục này
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Thầy/Cô bấm nút <b>"TẢI HỒ SƠ MỚI"</b> để tải lên kế hoạch năm học, báo cáo tháng (Tháng 9 - Tháng 5) hoặc biên bản sinh hoạt Chi đội.
                </p>
                <button
                  onClick={() => handleOpenUpload()}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tải tệp lên ngay</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3">Tên hồ sơ / Tệp đính kèm</th>
                      <th className="py-2.5 px-3">Thư mục</th>
                      <th className="py-2.5 px-3">Người gửi & Thời gian</th>
                      <th className="py-2.5 px-3">Phiên bản</th>
                      <th className="py-2.5 px-3">Trạng thái & Nhận xét TPT</th>
                      <th className="py-2.5 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayClassFiles.map((item, idx) => {
                      const folderDef = THU_MUC_CHI_DOI_DEFS.find((f) => f.id === item.thuMucId);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                          <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="font-black text-slate-900 group-hover:text-red-700 transition">
                              {item.tenHoSo}
                            </div>
                            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 mt-0.5">
                              {getFileTypeIcon(item.fileName)}
                              <span className="font-mono text-slate-700">{item.fileName}</span>
                              <span className="text-slate-400">({item.fileSize})</span>
                            </div>
                            {item.ghiChu && (
                              <div className="text-[10px] text-slate-500 italic mt-0.5">
                                Ghi chú: {item.ghiChu}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
                              {folderDef?.code}. {folderDef?.name}
                            </span>
                            {item.thangBaoCao && (
                              <div className="text-[10px] text-blue-700 font-bold mt-0.5">
                                Báo cáo Tháng {item.thangBaoCao}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[11px]">
                            <div className="font-bold text-slate-800">{item.gvGui}</div>
                            <div className="text-slate-400 text-[10px]">{item.thoiGianGui}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-1">
                              <span className="bg-slate-200 text-slate-800 font-black px-1.5 py-0.5 rounded text-[10px]">
                                v{item.version}
                              </span>
                              {item.history && item.history.length > 0 && (
                                <button
                                  onClick={() => setHistoryTargetItem(item)}
                                  className="text-blue-600 hover:text-blue-800 p-0.5 rounded cursor-pointer"
                                  title="Xem lịch sử thay đổi phiên bản"
                                >
                                  <History className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col items-start gap-1">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getStatusBadge(
                                  item.trangThai
                                )}`}
                              >
                                {item.trangThai}
                              </span>
                              {item.nhanXetTpt && (
                                <div className="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 max-w-[200px] truncate" title={item.nhanXetTpt}>
                                  TPT: {item.nhanXetTpt}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {/* Download Button */}
                              <button
                                onClick={() => downloadFileFromStorage(item.fileId, item.fileName)}
                                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                title="Tải tệp về máy"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              {/* Replace File Button */}
                              <button
                                onClick={() => {
                                  setReplaceTargetItem(item);
                                  setReplaceFile(null);
                                  setReplaceNote('');
                                }}
                                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Thay thế tệp mới (cập nhật v2, v3...)"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>

                              {/* TPT Review Button */}
                              {userRole === 'tpt' && (
                                <button
                                  onClick={() => {
                                    setReviewTargetItem(item);
                                    setReviewTrangThai(item.trangThai);
                                    setReviewNhanXet(item.nhanXetTpt || 'Hồ sơ đầy đủ');
                                    setReviewGhiChu(item.ghiChu || '');
                                  }}
                                  className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                  title="Đánh giá & Nhận xét hồ sơ (TPT)"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteItem(item)}
                                className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Xóa hồ sơ này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 2: BẢNG THEO DÕI BÁO CÁO THÁNG (17 CHI ĐỘI X 9 THÁNG)
      ======================================================== */}
      {tabMode === 'bang_theo_doi_thang' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-black text-blue-700 uppercase tracking-wide">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Ma Trận Nộp Báo Cáo Công Tác Đội Hàng Tháng (Tháng 9 → Tháng 5)</span>
              </div>
              <h3 className="font-black text-base text-slate-800 mt-1">
                Theo Dõi Tiến Độ Báo Cáo 17 Chi Đội Năm Học {appState.schoolConfig.schoolYear || '2026-2027'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhấn trực tiếp vào ô báo cáo của từng tháng để tải tệp hoặc kiểm tra tình trạng nộp
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-slate-600 font-medium">Đã gửi / Đã duyệt</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="text-slate-600 font-medium">Cần bổ sung</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" />
                <span className="text-slate-400 font-medium">Chưa nộp</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-black text-[11px] uppercase">
                  <th className="py-2.5 px-3 border-r border-slate-200 w-12 text-center">STT</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 min-w-[130px]">Chi đội</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 min-w-[100px]">Điểm trường</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 min-w-[130px]">GVCN</th>
                  {MONTH_COLS.map((m) => (
                    <th key={m} className="py-2.5 px-2 border-r border-slate-200 text-center min-w-[70px]">
                      Tháng {m}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-center min-w-[80px]">Đã nộp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyReportsMatrix.map((row, idx) => {
                  return (
                    <tr key={row.classDef.key} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-bold border-r border-slate-100">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-100">
                        <button
                          onClick={() => {
                            setSelectedClassKey(row.classDef.key);
                            setActiveFolderId('03_bao_cao_thang');
                            setTabMode('chi_doi');
                          }}
                          className="font-black text-slate-900 hover:text-red-700 text-left transition flex items-center space-x-1 cursor-pointer"
                        >
                          <span>{row.classDef.name}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-100">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            row.classDef.diemTruong === 'Trường chính'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {row.classDef.diemTruong}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-100 text-slate-600 font-medium text-[11px]">
                        {row.classData.gvcn || 'Chưa cập nhật'}
                      </td>

                      {/* 9 Months Columns */}
                      {MONTH_COLS.map((m) => {
                        const report = row.monthsMap[m];
                        if (report) {
                          const isApproved = report.trangThai === 'Đã kiểm tra';
                          const isNeedsFix = report.trangThai === 'Cần bổ sung';
                          return (
                            <td key={m} className="py-2 px-1 text-center border-r border-slate-100">
                              <button
                                onClick={() => downloadFileFromStorage(report.fileId, report.fileName)}
                                className={`w-full py-1.5 px-1 rounded-lg text-[10px] font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                                  isApproved
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                    : isNeedsFix
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300'
                                }`}
                                title={`${report.tenHoSo} (${report.fileName}) - Bấm để tải về`}
                              >
                                <span className="flex items-center space-x-0.5">
                                  <Check className="w-3 h-3" />
                                  <span>T{m}</span>
                                </span>
                                <span className="text-[9px] font-normal truncate max-w-[55px]">
                                  v{report.version}
                                </span>
                              </button>
                            </td>
                          );
                        }

                        return (
                          <td key={m} className="py-2 px-1 text-center border-r border-slate-100">
                            <button
                              onClick={() => {
                                setSelectedClassKey(row.classDef.key);
                                handleOpenUpload('03_bao_cao_thang');
                                setUploadThangBaoCao(m);
                                setUploadThoiGian(`Tháng ${m}/2026`);
                                setUploadTenHoSo(`Báo cáo công tác Đội Tháng ${m} - Chi đội ${row.classDef.key}`);
                              }}
                              className="w-full py-1.5 px-1 rounded-lg text-[10px] text-slate-300 hover:text-slate-600 hover:bg-slate-100 font-bold transition flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-200"
                              title={`Chi đội ${row.classDef.key} chưa gửi báo cáo Tháng ${m}. Bấm để nộp ngay`}
                            >
                              <span>--</span>
                            </button>
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded-full ${
                            row.submittedCount >= 8
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.submittedCount >= 4
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {row.submittedCount}/9
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 3: KHO HỒ SƠ TOÀN TRƯỜNG (TRA CỨU TOÀN DIỆN)
      ======================================================== */}
      {tabMode === 'kho_toan_truong' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-black text-amber-700 uppercase tracking-wide">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Kho Lưu Trữ Hồ Sơ Số Hóa Toàn Trường Dành Cho TPT Đội</span>
              </div>
              <h3 className="font-black text-base text-slate-800 mt-1">
                Tổng Hợp Toàn Bộ Tài Liệu Của 17 Chi Đội ({allHoSoList.length} tệp)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tìm kiếm theo tên lớp, tháng, loại hồ sơ, người nộp và xuất danh sách Excel
              </p>
            </div>

            {/* Multi-criteria filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm lớp, tên tệp, tên GV..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-600 w-52"
                />
              </div>

              <select
                value={filterDiemTruong}
                onChange={(e) => setFilterDiemTruong(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="all">Tất cả điểm trường</option>
                <option value="Trường chính">Trường chính (8 lớp)</option>
                <option value="Phân hiệu">Phân hiệu (9 lớp)</option>
              </select>

              <select
                value={filterTrangThai}
                onChange={(e) => setFilterTrangThai(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đã kiểm tra">Đã kiểm tra</option>
                <option value="Đã gửi">Đã gửi</option>
                <option value="Đã cập nhật">Đã cập nhật</option>
                <option value="Cần bổ sung">Cần bổ sung</option>
              </select>

              <button
                onClick={handleExportAllToExcel}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Xuất Excel</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Chi đội & Điểm trường</th>
                  <th className="py-2.5 px-3">Tên hồ sơ / Tệp</th>
                  <th className="py-2.5 px-3">Thư mục</th>
                  <th className="py-2.5 px-3">Người gửi</th>
                  <th className="py-2.5 px-3">Trạng thái & Nhận xét TPT</th>
                  <th className="py-2.5 px-3 text-right">Tải về</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMasterRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 italic">
                      Không tìm thấy hồ sơ nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredMasterRecords.map((item, idx) => {
                    const classDef = CLASS_DEFINITIONS.find((c) => c.key === item.classKey);
                    const folderDef = THU_MUC_CHI_DOI_DEFS.find((f) => f.id === item.thuMucId);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => {
                              setSelectedClassKey(item.classKey);
                              setTabMode('chi_doi');
                            }}
                            className="font-black text-red-700 hover:underline flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Chi đội {item.classKey}</span>
                          </button>
                          <div className="text-[10px] text-slate-400">{classDef?.diemTruong}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{item.tenHoSo}</div>
                          <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono mt-0.5">
                            {getFileTypeIcon(item.fileName)}
                            <span>{item.fileName}</span>
                            <span className="text-slate-400">({item.fileSize})</span>
                            <span className="bg-slate-200 text-slate-800 text-[9px] px-1 rounded font-sans font-bold">
                              v{item.version}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                            {folderDef?.code}. {folderDef?.name}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px]">
                          <div className="font-medium text-slate-800">{item.gvGui}</div>
                          <div className="text-[10px] text-slate-400">{item.thoiGianGui}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getStatusBadge(
                              item.trangThai
                            )}`}
                          >
                            {item.trangThai}
                          </span>
                          {item.nhanXetTpt && (
                            <div className="text-[10px] text-amber-900 mt-0.5 truncate max-w-[180px]" title={item.nhanXetTpt}>
                              {item.nhanXetTpt}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => downloadFileFromStorage(item.fileId, item.fileName)}
                            className="p-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg transition inline-flex items-center space-x-1 cursor-pointer"
                            title="Tải tệp về máy"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">Tải</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: TẢI HỒ SƠ MỚI (HỖ TRỢ NHIỀU TỆP / KÉO THẢ)
      ======================================================== */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-800 to-rose-900 px-5 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide flex items-center space-x-2">
                  <UploadCloud className="w-5 h-5 text-yellow-300" />
                  <span>Tải Hồ Sơ Mới — Chi Đội {selectedClassKey}</span>
                </h3>
                <p className="text-[11px] text-rose-100 mt-0.5">
                  Lưu vào kho hồ sơ điện tử chính thức của Chi đội
                </p>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUploadSubmit} className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
              {uploadErrorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{uploadErrorMessage}</span>
                </div>
              )}

              {/* Folder Selector */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                  Chọn Thư Mục Lưu Trữ: <span className="text-red-600">*</span>
                </label>
                <select
                  value={uploadFolderId}
                  onChange={(e) => setUploadFolderId(e.target.value as ThuMucChiDoiId)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {THU_MUC_CHI_DOI_DEFS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.code}. {f.name} ({f.badge})
                    </option>
                  ))}
                </select>
              </div>

              {/* Extra field if Month Report */}
              {uploadFolderId === '03_bao_cao_thang' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <label className="block text-xs font-black text-blue-900 uppercase">
                    Báo cáo định kỳ tháng nào? <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
                    {MONTH_COLS.map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => {
                          setUploadThangBaoCao(m);
                          setUploadThoiGian(`Tháng ${m}/2026`);
                          if (!uploadTenHoSo || uploadTenHoSo.startsWith('Báo cáo công tác Đội Tháng')) {
                            setUploadTenHoSo(`Báo cáo công tác Đội Tháng ${m} - Chi đội ${selectedClassKey}`);
                          }
                        }}
                        className={`py-1.5 text-center font-bold text-xs rounded-lg transition cursor-pointer ${
                          uploadThangBaoCao === m
                            ? 'bg-blue-700 text-white shadow-2xs'
                            : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        T{m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Hồ Sơ / Tiêu Đề: <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadTenHoSo}
                    onChange={(e) => setUploadTenHoSo(e.target.value)}
                    placeholder="VD: Kế hoạch năm học 2026-2027..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời Gian Thực Hiện:
                  </label>
                  <input
                    type="text"
                    value={uploadThoiGian}
                    onChange={(e) => setUploadThoiGian(e.target.value)}
                    placeholder="VD: Tháng 11/2026 hoặc Cả năm..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Sender & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Người Nộp / GV Phụ Trách:
                  </label>
                  <input
                    type="text"
                    value={uploadGvGui}
                    onChange={(e) => setUploadGvGui(e.target.value)}
                    placeholder="VD: GVCN Chi đội..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ghi Chú Bổ Sung:
                  </label>
                  <input
                    type="text"
                    value={uploadGhiChu}
                    onChange={(e) => setUploadGhiChu(e.target.value)}
                    placeholder="Ghi chú thêm về nội dung tệp..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Drag & Drop File Zone */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                  Đính Kèm Tệp Văn Bản / Minh Chứng: <span className="text-red-600">*</span>
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                    isDragging
                      ? 'border-red-600 bg-red-50/60 scale-101'
                      : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-red-400'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFilesSelected(Array.from(e.target.files));
                      }
                    }}
                    multiple
                    accept=".doc,.docx,.xls,.xlsx,.pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <UploadCloud className="w-10 h-10 text-red-600 mx-auto mb-2 animate-bounce-subtle" />
                  <div className="font-black text-slate-800 text-xs">
                    Kéo thả tệp vào đây, hoặc <span className="text-red-700 underline">bấm để duyệt tệp</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Hỗ trợ định dạng: <b>DOC, DOCX, XLS, XLSX, PDF, JPG, PNG</b> (Dung lượng &lt; 50MB/tệp)
                  </div>
                </div>

                {/* Selected Files List */}
                {uploadFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="font-bold text-slate-700 text-xs">
                      Tệp đã chọn ({uploadFiles.length}):
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                      {uploadFiles.map((f, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-slate-100 p-2 rounded-xl text-xs"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            {getFileTypeIcon(f.name)}
                            <span className="font-mono text-slate-800 truncate">{f.name}</span>
                            <span className="text-slate-400 text-[10px]">
                              ({(f.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setUploadFiles((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-black rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Đang lưu vào bộ nhớ...</span>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>LƯU HỒ SƠ VÀO KHO</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: THAY THẾ TỆP (LƯU LỊCH SỬ PHIÊN BẢN V2, V3)
      ======================================================== */}
      {replaceTargetItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
            <div className="bg-gradient-to-r from-blue-800 to-indigo-900 px-5 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-yellow-300" />
                  <span>Thay Thế Tệp & Nâng Cấp Phiên Bản</span>
                </h3>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  Tệp cũ sẽ được chuyển vào lịch sử phiên bản để tra cứu
                </p>
              </div>
              <button
                onClick={() => setReplaceTargetItem(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1">
                <div className="font-black text-blue-950 text-xs">
                  {replaceTargetItem.tenHoSo}
                </div>
                <div className="text-[11px] text-blue-800">
                  Tệp hiện tại: <b className="font-mono">{replaceTargetItem.fileName}</b> ({replaceTargetItem.fileSize}) — Phiên bản: <b>v{replaceTargetItem.version}</b>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                  Chọn Tệp Mới Thay Thế (sẽ tạo phiên bản v{replaceTargetItem.version + 1}): <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  ref={replaceInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReplaceFile(e.target.files[0]);
                    }
                  }}
                  accept=".doc,.docx,.xls,.xlsx,.pdf,.jpg,.jpeg,.png"
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lý Do Cập Nhật / Ghi Chú Thay Đổi:
                </label>
                <input
                  type="text"
                  value={replaceNote}
                  onChange={(e) => setReplaceNote(e.target.value)}
                  placeholder="VD: Bổ sung số liệu theo yêu cầu TPT..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReplaceTargetItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!replaceFile || isSubmitting}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <span>Đang thay thế...</span> : <span>LƯU PHIÊN BẢN MỚI</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: ĐÁNH GIÁ & NHẬN XÉT CỦA TỔNG PHỤ TRÁCH ĐỘI
      ======================================================== */}
      {reviewTargetItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
            <div className="bg-gradient-to-r from-amber-700 to-red-800 px-5 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-yellow-300" />
                  <span>Kiểm Tra & Nhận Xét Hồ Sơ (TPT Đội)</span>
                </h3>
                <p className="text-[11px] text-amber-100 mt-0.5">
                  Phản hồi kết quả đánh giá cho Giáo viên phụ trách Chi đội
                </p>
              </div>
              <button
                onClick={() => setReviewTargetItem(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
                <div className="font-black text-amber-950 text-xs">
                  {reviewTargetItem.tenHoSo}
                </div>
                <div className="text-[11px] text-amber-900">
                  Chi đội: <b>Chi đội {reviewTargetItem.classKey}</b> • Người gửi: <b>{reviewTargetItem.gvGui}</b>
                </div>
              </div>

              {/* Status Picker */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                  Đánh Dấu Trạng Thái Hồ Sơ:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Đã kiểm tra', 'Đã gửi', 'Cần bổ sung', 'Đã cập nhật'] as TrangThaiHoSoChiDoi[]).map(
                    (st) => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setReviewTrangThai(st)}
                        className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          reviewTrangThai === st
                            ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Sample Comments Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhận Xét Mẫu Của TPT:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {NHAN_XET_MAU.map((cmt) => (
                    <button
                      type="button"
                      key={cmt}
                      onClick={() => setReviewNhanXet(cmt)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        reviewNhanXet === cmt
                          ? 'bg-red-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cmt}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={reviewNhanXet}
                  onChange={(e) => setReviewNhanXet(e.target.value)}
                  placeholder="Nhập nhận xét cụ thể hoặc chọn mẫu..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              {/* Additional Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi Chú Nghiệp Vụ Cho GVCN:
                </label>
                <textarea
                  value={reviewGhiChu}
                  onChange={(e) => setReviewGhiChu(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú chi tiết phần cần bổ sung hoặc hạn nộp lại..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReviewTargetItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-black rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>LƯU ĐÁNH GIÁ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: LỊCH SỬ PHIÊN BẢN (HISTORY)
      ======================================================== */}
      {historyTargetItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide flex items-center space-x-2">
                  <History className="w-4 h-4 text-yellow-300" />
                  <span>Lịch Sử Phiên Bản — {historyTargetItem.tenHoSo}</span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Danh sách các phiên bản đã tải lên trước đó
                </p>
              </div>
              <button
                onClick={() => setHistoryTargetItem(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Current version */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-black text-emerald-900">
                    Phiên bản hiện tại (v{historyTargetItem.version})
                  </span>
                  <button
                    onClick={() =>
                      downloadFileFromStorage(historyTargetItem.fileId, historyTargetItem.fileName)
                    }
                    className="p-1 text-emerald-800 hover:text-emerald-950 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về</span>
                  </button>
                </div>
                <div className="font-mono text-slate-700 text-[11px]">
                  {historyTargetItem.fileName} ({historyTargetItem.fileSize})
                </div>
                <div className="text-[10px] text-slate-500">
                  Thời gian: {historyTargetItem.thoiGianGui} • Người tải: {historyTargetItem.gvGui}
                </div>
              </div>

              {/* Past history */}
              <div className="font-bold text-slate-700 text-xs mt-3">Các phiên bản trước:</div>
              {!historyTargetItem.history || historyTargetItem.history.length === 0 ? (
                <div className="text-slate-400 italic text-[11px]">
                  Chưa có lịch sử thay đổi phiên bản trước đó.
                </div>
              ) : (
                historyTargetItem.history.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Phiên bản v{h.version}</span>
                      <button
                        onClick={() => downloadFileFromStorage(h.fileId, h.fileName)}
                        className="p-1 text-blue-700 hover:text-blue-900 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải tệp này</span>
                      </button>
                    </div>
                    <div className="font-mono text-slate-700 text-[11px]">
                      {h.fileName} ({h.fileSize})
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Tải lên lúc: {h.uploadDate} • Bởi: {h.uploadedBy}
                      {h.note && ` — Ghi chú: ${h.note}`}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setHistoryTargetItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
