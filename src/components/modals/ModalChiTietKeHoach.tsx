import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CalendarDays,
  FileText,
  FileSpreadsheet,
  Upload,
  Download,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderOpen,
  Image as ImageIcon,
  Paperclip,
  Eye,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  ListChecks,
  Award,
  Sparkles,
  RefreshCw,
  FolderTree,
} from 'lucide-react';
import {
  AppState,
  LichCongTac,
  KeHoachDetail,
  TaiLieuMinhChung,
  LoaiMinhChung,
  HoSoItem,
} from '../../types';
import {
  saveFileToStorage,
  getFileFromStorage,
  getFileBlobUrl,
  downloadFileFromStorage,
  deleteFileFromStorage,
  formatFileSize,
} from '../../utils/fileStorage';
import { parseDocxBuffer } from '../../utils/docReader';

interface ModalChiTietKeHoachProps {
  isOpen: boolean;
  onClose: () => void;
  planId: number | null;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onOpenHoSoGroup?: (groupId: number) => void;
}

type TabType =
  | 'thong-tin'
  | 'noi-dung'
  | 'lich-trinh'
  | 'minh-chung'
  | 'ho-so-so-hoa'
  | 'danh-gia';

export const ModalChiTietKeHoach: React.FC<ModalChiTietKeHoachProps> = ({
  isOpen,
  onClose,
  planId,
  appState,
  setAppState,
  onOpenHoSoGroup,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('thong-tin');
  const [isEditingInfo, setIsEditingInfo] = useState<boolean>(false);

  // Form states for general info
  const [editLoai, setEditLoai] = useState<LichCongTac['loai']>('Kế hoạch tháng');
  const [editTieuDe, setEditTieuDe] = useState<string>('');
  const [editThoiGian, setEditThoiGian] = useState<string>('');
  const [editNguoiPhuTrach, setEditNguoiPhuTrach] = useState<string>('');
  const [editTrangThai, setEditTrangThai] = useState<LichCongTac['trangThai']>('Đang thực hiện');
  const [editMucTieu, setEditMucTieu] = useState<string>('');
  const [editDiaDiem, setEditDiaDiem] = useState<string>('Toàn trường (2 điểm trường)');
  const [editKinhPhi, setEditKinhPhi] = useState<string>('');
  const [editNoiDungVanBan, setEditNoiDungVanBan] = useState<string>('');

  // Main file state
  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingMainFile, setIsUploadingMainFile] = useState<boolean>(false);
  const [mainFileBlobUrl, setMainFileBlobUrl] = useState<string | null>(null);

  // Evidence upload state
  const evidenceFileInputRef = useRef<HTMLInputElement | null>(null);
  const [evidenceFilter, setEvidenceFilter] = useState<string>('ALL');
  const [uploadEvidenceLoai, setUploadEvidenceLoai] =
    useState<LoaiMinhChung>('Tài liệu minh chứng');
  const [uploadEvidenceTen, setUploadEvidenceTen] = useState<string>('');
  const [uploadEvidenceGhiChu, setUploadEvidenceGhiChu] = useState<string>('');
  const [uploadEvidenceLinkedGroup, setUploadEvidenceLinkedGroup] = useState<number>(0);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState<boolean>(false);

  // Preview lightbox for evidence
  const [previewFile, setPreviewFile] = useState<{
    title: string;
    url: string;
    type: 'image' | 'pdf' | 'docx' | 'excel' | 'other';
    fileName: string;
    fileId: string;
  } | null>(null);

  // Evaluation form state
  const [evalHsCount, setEvalHsCount] = useState<number>(655);
  const [evalXepLoai, setEvalXepLoai] = useState<
    'Xuất sắc' | 'Tốt' | 'Đạt yêu cầu' | 'Chưa đạt'
  >('Xuất sắc');
  const [evalNhanXet, setEvalNhanXet] = useState<string>('');
  const [evalGhiChu, setEvalGhiChu] = useState<string>('');

  // Milestone form state
  const [newMilestoneThoiGian, setNewMilestoneThoiGian] = useState<string>('');
  const [newMilestoneNoiDung, setNewMilestoneNoiDung] = useState<string>('');
  const [newMilestoneNguoi, setNewMilestoneNguoi] = useState<string>('');

  const plan = appState.listLichCongTac.find((p) => p.id === planId);

  // Initialize data when plan changes
  useEffect(() => {
    if (plan) {
      setEditLoai(plan.loai);
      setEditTieuDe(plan.tieuDe);
      setEditThoiGian(plan.thoiGian);
      setEditNguoiPhuTrach(plan.nguoiPhuTrach);
      setEditTrangThai(plan.trangThai);

      const d = plan.detail || {};
      setEditMucTieu(d.mucTieu || '');
      setEditDiaDiem(d.diaDiem || 'Toàn trường (2 điểm trường)');
      setEditKinhPhi(d.kinhPhiDuTru || 'Từ nguồn kinh phí hoạt động Đội');
      setEditNoiDungVanBan(d.noiDungVanBan || '');

      const ev = d.ketQuaDanhGia || {};
      setEvalHsCount(ev.soLuongHsThamGia ?? 655);
      setEvalXepLoai(ev.xepLoai || 'Xuất sắc');
      setEvalNhanXet(ev.danhGiaChung || '');
      setEvalGhiChu(ev.ghiChu || '');

      // Load main file blob URL if available
      if (d.mainFile?.fileId) {
        getFileBlobUrl(d.mainFile.fileId).then((url) => {
          setMainFileBlobUrl(url);
        });
      } else {
        setMainFileBlobUrl(null);
      }
    }
  }, [plan]);

  if (!isOpen || !plan) return null;

  const detail: KeHoachDetail = plan.detail || {};
  const minhChungList: TaiLieuMinhChung[] = detail.minhChungList || [];
  const linkedHoSoGroupIds: number[] =
    plan.linkedHoSoGroupIds || detail.linkedHoSoGroupIds || [];

  // Helper to update current plan inside AppState
  const updateCurrentPlan = (updater: (prevPlan: LichCongTac) => LichCongTac) => {
    setAppState((prev) => ({
      ...prev,
      listLichCongTac: prev.listLichCongTac.map((p) =>
        p.id === plan.id ? updater(p) : p
      ),
    }));
  };

  // Save General Info
  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentPlan((p) => ({
      ...p,
      loai: editLoai,
      tieuDe: editTieuDe.trim() || p.tieuDe,
      thoiGian: editThoiGian.trim() || p.thoiGian,
      nguoiPhuTrach: editNguoiPhuTrach.trim() || p.nguoiPhuTrach,
      trangThai: editTrangThai,
      detail: {
        ...(p.detail || {}),
        mucTieu: editMucTieu.trim(),
        diaDiem: editDiaDiem.trim(),
        kinhPhiDuTru: editKinhPhi.trim(),
        noiDungVanBan: editNoiDungVanBan.trim(),
      },
    }));
    setIsEditingInfo(false);
  };

  // Upload or replace Main Plan File (.docx, .pdf)
  const handleMainFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMainFile(true);
      const isDocx =
        file.name.toLowerCase().endsWith('.docx') ||
        file.type.includes('wordprocessingml');
      const isPdf =
        file.name.toLowerCase().endsWith('.pdf') || file.type.includes('pdf');

      let extractedHtml = '';
      let extractedText = '';

      if (isDocx) {
        const buffer = await file.arrayBuffer();
        const docResult = await parseDocxBuffer(buffer);
        extractedHtml = docResult.html;
        extractedText = docResult.text;
      }

      // Save file into IndexedDB
      const savedInfo = await saveFileToStorage(file, file.name);
      const blobUrl = await getFileBlobUrl(savedInfo.fileId);
      setMainFileBlobUrl(blobUrl);

      const now = new Date();
      const dateStr = `${now.getHours()}:${String(now.getMinutes()).padStart(
        2,
        '0'
      )} ngày ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

      updateCurrentPlan((p) => {
        const updatedDetail: KeHoachDetail = {
          ...(p.detail || {}),
          mainFile: {
            fileId: savedInfo.fileId,
            fileName: savedInfo.fileName,
            fileType: isDocx ? 'docx' : isPdf ? 'pdf' : 'other',
            fileSize: savedInfo.fileSize,
            uploadDate: dateStr,
          },
          noiDungHtml: extractedHtml || p.detail?.noiDungHtml,
          noiDungVanBan:
            extractedText || editNoiDungVanBan || p.detail?.noiDungVanBan,
        };
        return {
          ...p,
          detail: updatedDetail,
        };
      });

      if (extractedText && !editNoiDungVanBan) {
        setEditNoiDungVanBan(extractedText);
      }

      setActiveTab('noi-dung');
    } catch (err: any) {
      alert('Lỗi tải tệp kế hoạch: ' + (err?.message || 'Không thể xử lý tệp'));
    } finally {
      setIsUploadingMainFile(false);
      if (e.target) e.target.value = '';
    }
  };

  // Delete Main File
  const handleDeleteMainFile = async () => {
    if (
      !window.confirm(
        'Bạn có chắc muốn xóa tệp kế hoạch chính này khỏi hệ thống lưu trữ?'
      )
    )
      return;
    if (detail.mainFile?.fileId) {
      await deleteFileFromStorage(detail.mainFile.fileId);
    }
    setMainFileBlobUrl(null);
    updateCurrentPlan((p) => ({
      ...p,
      detail: {
        ...(p.detail || {}),
        mainFile: undefined,
      },
    }));
  };

  // Upload Evidence File(s)
  const handleEvidenceFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingEvidence(true);
      const newItems: TaiLieuMinhChung[] = [];
      const now = new Date();
      const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const saved = await saveFileToStorage(file);

        let fileType: TaiLieuMinhChung['fileType'] = 'other';
        if (saved.isPdf) fileType = 'pdf';
        else if (saved.isDocx) fileType = 'docx';
        else if (saved.isImage) fileType = 'image';
        else if (saved.isExcel) fileType = 'excel';

        const item: TaiLieuMinhChung = {
          id: `mc_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
          loai: uploadEvidenceLoai,
          tenTaiLieu:
            uploadEvidenceTen.trim() ||
            file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
          fileId: saved.fileId,
          fileName: saved.fileName,
          fileType,
          fileSize: saved.fileSize,
          ngayTao: dateStr,
          ghiChu: uploadEvidenceGhiChu.trim(),
          linkedHoSoGroupId:
            uploadEvidenceLinkedGroup > 0 ? uploadEvidenceLinkedGroup : undefined,
        };

        newItems.push(item);

        // If simultaneously linking into one of the 8 digital record groups:
        if (uploadEvidenceLinkedGroup > 0) {
          const targetGroupId = uploadEvidenceLinkedGroup;
          const hoSoItem: HoSoItem = {
            id: Date.now() + i,
            tieuDe: `[Minh chứng: ${plan.tieuDe}] ${item.tenTaiLieu}`,
            noiDung: `Tài liệu minh chứng thuộc ${plan.loai}: "${plan.tieuDe}". ${
              item.ghiChu ? 'Ghi chú: ' + item.ghiChu : ''
            }`,
            thoiGian: `${now.getHours()}:${String(now.getMinutes()).padStart(
              2,
              '0'
            )} ngày ${dateStr}`,
            fileName: saved.fileName,
            fileSize: saved.fileSize,
            fileId: saved.fileId,
            keHoachId: plan.id,
            isFromKeHoach: true,
          };

          setAppState((prev) => ({
            ...prev,
            hoSoGroups: prev.hoSoGroups.map((g) => {
              if (g.id === targetGroupId) {
                return {
                  ...g,
                  items: [hoSoItem, ...(g.items || [])],
                };
              }
              return g;
            }),
          }));
        }
      }

      // Update plan's minhChungList
      updateCurrentPlan((p) => {
        const curList = p.detail?.minhChungList || [];
        const existingLinked = p.linkedHoSoGroupIds || [];
        const newLinked =
          uploadEvidenceLinkedGroup > 0 &&
          !existingLinked.includes(uploadEvidenceLinkedGroup)
            ? [...existingLinked, uploadEvidenceLinkedGroup]
            : existingLinked;

        return {
          ...p,
          linkedHoSoGroupIds: newLinked,
          detail: {
            ...(p.detail || {}),
            minhChungList: [...newItems, ...curList],
            linkedHoSoGroupIds: newLinked,
          },
        };
      });

      setUploadEvidenceTen('');
      setUploadEvidenceGhiChu('');
    } catch (err: any) {
      alert('Lỗi tải tài liệu minh chứng: ' + (err?.message || 'Không thể lưu tệp'));
    } finally {
      setIsUploadingEvidence(false);
      if (e.target) e.target.value = '';
    }
  };

  // Delete an evidence item
  const handleDeleteEvidenceItem = async (item: TaiLieuMinhChung) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa tài liệu minh chứng "${item.tenTaiLieu}"?`
      )
    )
      return;

    await deleteFileFromStorage(item.fileId);

    updateCurrentPlan((p) => ({
      ...p,
      detail: {
        ...(p.detail || {}),
        minhChungList: (p.detail?.minhChungList || []).filter(
          (m) => m.id !== item.id
        ),
      },
    }));

    // Also remove from linked digital record group if it was auto-linked
    if (item.linkedHoSoGroupId) {
      setAppState((prev) => ({
        ...prev,
        hoSoGroups: prev.hoSoGroups.map((g) => {
          if (g.id === item.linkedHoSoGroupId) {
            return {
              ...g,
              items: (g.items || []).filter((h) => h.fileId !== item.fileId),
            };
          }
          return g;
        }),
      }));
    }
  };

  // Toggle link with one of 8 digital record groups
  const handleToggleLinkHoSoGroup = (groupId: number) => {
    const isCurrentlyLinked = linkedHoSoGroupIds.includes(groupId);
    const updatedIds = isCurrentlyLinked
      ? linkedHoSoGroupIds.filter((id) => id !== groupId)
      : [...linkedHoSoGroupIds, groupId];

    updateCurrentPlan((p) => ({
      ...p,
      linkedHoSoGroupIds: updatedIds,
      detail: {
        ...(p.detail || {}),
        linkedHoSoGroupIds: updatedIds,
      },
    }));
  };

  // Preview an evidence file
  const handleOpenPreview = async (item: TaiLieuMinhChung) => {
    const url = await getFileBlobUrl(item.fileId);
    if (!url) {
      alert('Không thể mở tệp xem trước từ bộ nhớ lưu trữ!');
      return;
    }
    setPreviewFile({
      title: item.tenTaiLieu,
      url,
      type: item.fileType,
      fileName: item.fileName,
      fileId: item.fileId,
    });
  };

  // Save Milestone
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneNoiDung.trim()) return;

    const newMs = {
      id: `ms_${Date.now()}`,
      giaiDoan: `Bước ${((detail.lichThucHienChiTiet?.length || 0) + 1)}`,
      thoiGian: newMilestoneThoiGian.trim() || 'Trong tuần',
      noiDung: newMilestoneNoiDung.trim(),
      nguoiThucHien: newMilestoneNguoi.trim() || plan.nguoiPhuTrach,
      daHoanThanh: false,
    };

    updateCurrentPlan((p) => ({
      ...p,
      detail: {
        ...(p.detail || {}),
        lichThucHienChiTiet: [
          ...(p.detail?.lichThucHienChiTiet || []),
          newMs,
        ],
      },
    }));

    setNewMilestoneNoiDung('');
    setNewMilestoneThoiGian('');
    setNewMilestoneNguoi('');
  };

  const handleToggleMilestone = (msId: string) => {
    updateCurrentPlan((p) => ({
      ...p,
      detail: {
        ...(p.detail || {}),
        lichThucHienChiTiet: (p.detail?.lichThucHienChiTiet || []).map((ms) =>
          ms.id === msId ? { ...ms, daHoanThanh: !ms.daHoanThanh } : ms
        ),
      },
    }));
  };

  const handleDeleteMilestone = (msId: string) => {
    updateCurrentPlan((p) => ({
      ...p,
      detail: {
        ...(p.detail || {}),
        lichThucHienChiTiet: (p.detail?.lichThucHienChiTiet || []).filter(
          (ms) => ms.id !== msId
        ),
      },
    }));
  };

  // Save Evaluation
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

    updateCurrentPlan((p) => ({
      ...p,
      trangThai: 'Hoàn thành',
      detail: {
        ...(p.detail || {}),
        ketQuaDanhGia: {
          soLuongHsThamGia: Number(evalHsCount),
          xepLoai: evalXepLoai,
          danhGiaChung: evalNhanXet.trim(),
          ghiChu: evalGhiChu.trim(),
          ngayDanhGia: dateStr,
          nguoiDanhGia: plan.nguoiPhuTrach,
        },
      },
    }));
    setEditTrangThai('Hoàn thành');
    alert('Đã cập nhật kết quả và đánh giá kế hoạch thành công!');
  };

  // Quick toggle status in header
  const handleQuickChangeStatus = (newStatus: LichCongTac['trangThai']) => {
    setEditTrangThai(newStatus);
    updateCurrentPlan((p) => ({
      ...p,
      trangThai: newStatus,
    }));
  };

  // Delete entire plan
  const handleDeleteEntirePlan = () => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn kế hoạch "${plan.tieuDe}"?`
      )
    ) {
      setAppState((prev) => ({
        ...prev,
        listLichCongTac: prev.listLichCongTac.filter((p) => p.id !== plan.id),
      }));
      onClose();
    }
  };

  // Filtered evidence list
  const filteredMinhChung = minhChungList.filter((m) => {
    if (evidenceFilter === 'ALL') return true;
    return m.loai === evidenceFilter;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[94vh] border border-slate-200 animate-scale-up">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-5 py-4 text-white flex justify-between items-start gap-4 flex-shrink-0">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-yellow-400 text-blue-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {plan.loai}
              </span>

              {/* Status Selector */}
              <div className="flex items-center space-x-1 bg-white/10 rounded-full p-0.5 text-[11px] font-bold">
                {(['Chưa thực hiện', 'Đang thực hiện', 'Hoàn thành'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleQuickChangeStatus(st)}
                      className={`px-2.5 py-0.5 rounded-full transition cursor-pointer ${
                        plan.trangThai === st
                          ? st === 'Hoàn thành'
                            ? 'bg-emerald-500 text-white shadow-xs font-black'
                            : st === 'Đang thực hiện'
                            ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                            : 'bg-slate-300 text-slate-900 shadow-xs font-black'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>

              {detail.mainFile && (
                <span className="bg-blue-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <FileText className="w-3 h-3" />
                  <span>{detail.mainFile.fileType.toUpperCase()} gốc</span>
                </span>
              )}

              {minhChungList.length > 0 && (
                <span className="bg-emerald-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Paperclip className="w-3 h-3" />
                  <span>{minhChungList.length} minh chứng</span>
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-black text-white leading-snug truncate">
              {plan.tieuDe}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-blue-200">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Thời gian: {plan.thoiGian}</span>
              </span>
              <span>•</span>
              <span>Phụ trách: <b>{plan.nguoiPhuTrach}</b></span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {detail.mainFile && (
              <button
                onClick={() =>
                  downloadFileFromStorage(
                    detail.mainFile!.fileId,
                    detail.mainFile!.fileName
                  )
                }
                className="p-2 hover:bg-white/20 rounded-xl text-blue-200 hover:text-white transition cursor-pointer"
                title="Tải tệp kế hoạch gốc (.docx / .pdf)"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleDeleteEntirePlan}
              className="p-2 hover:bg-red-600/80 rounded-xl text-red-300 hover:text-white transition cursor-pointer"
              title="Xóa kế hoạch này"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl text-white transition text-lg font-bold"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 6 Tab Navigation Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 flex overflow-x-auto no-scrollbar gap-1 text-xs font-bold text-slate-600 flex-shrink-0">
          <button
            onClick={() => setActiveTab('thong-tin')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'thong-tin'
                ? 'border-blue-700 text-blue-800 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span>1. Thông tin kế hoạch</span>
          </button>

          <button
            onClick={() => setActiveTab('noi-dung')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'noi-dung'
                ? 'border-blue-700 text-blue-800 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>2. Nội dung & Xem tệp</span>
            {detail.mainFile && (
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('lich-trinh')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'lich-trinh'
                ? 'border-blue-700 text-blue-800 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ListChecks className="w-4 h-4 text-blue-600" />
            <span>3. Lịch thực hiện ({detail.lichThucHienChiTiet?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('minh-chung')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'minh-chung'
                ? 'border-blue-700 text-blue-800 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Paperclip className="w-4 h-4 text-emerald-600" />
            <span>4. Tài liệu minh chứng ({minhChungList.length})</span>
            {minhChungList.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {minhChungList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ho-so-so-hoa')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'ho-so-so-hoa'
                ? 'border-blue-700 text-blue-800 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-4 h-4 text-amber-600" />
            <span>5. Hồ sơ số hóa liên kết ({linkedHoSoGroupIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('danh-gia')}
            className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'danh-gia'
                ? 'border-blue-700 text-blue-800 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-purple-600" />
            <span>6. Kết quả & Đánh giá</span>
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* TAB 1: THÔNG TIN KẾ HOẠCH */}
          {activeTab === 'thong-tin' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              <div className="flex justify-between items-center bg-blue-50/80 p-3.5 px-4 rounded-xl border border-blue-200">
                <div>
                  <h4 className="font-black text-slate-800 text-sm">
                    Thông tin định danh kế hoạch công tác Đội
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Quản lý thời gian, phạm vi triển khai, phụ trách và mục tiêu hoạt động.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(!isEditingInfo)}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold flex items-center space-x-1.5 transition cursor-pointer text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingInfo ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}</span>
                </button>
              </div>

              {isEditingInfo ? (
                <form onSubmit={handleSaveInfo} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Phân loại kế hoạch *</label>
                      <select
                        value={editLoai}
                        onChange={(e) => setEditLoai(e.target.value as any)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-bold"
                      >
                        <option value="Kế hoạch năm học">Kế hoạch năm học</option>
                        <option value="Kế hoạch tháng">Kế hoạch tháng</option>
                        <option value="Kế hoạch tuần">Kế hoạch tuần</option>
                        <option value="Hoạt động theo chủ điểm">Hoạt động theo chủ điểm</option>
                        <option value="Nhiệm vụ đột xuất">Nhiệm vụ đột xuất</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Trạng thái thực hiện</label>
                      <select
                        value={editTrangThai}
                        onChange={(e) => setEditTrangThai(e.target.value as any)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-bold"
                      >
                        <option value="Chưa thực hiện">Chưa thực hiện</option>
                        <option value="Đang thực hiện">Đang thực hiện</option>
                        <option value="Hoàn thành">Đã hoàn thành</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tiêu đề kế hoạch *</label>
                    <input
                      type="text"
                      required
                      value={editTieuDe}
                      onChange={(e) => setEditTieuDe(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-bold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Thời gian thực hiện *</label>
                      <input
                        type="text"
                        required
                        value={editThoiGian}
                        onChange={(e) => setEditThoiGian(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Người / Bộ phận phụ trách *</label>
                      <input
                        type="text"
                        required
                        value={editNguoiPhuTrach}
                        onChange={(e) => setEditNguoiPhuTrach(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Địa điểm triển khai</label>
                      <input
                        type="text"
                        value={editDiaDiem}
                        onChange={(e) => setEditDiaDiem(e.target.value)}
                        placeholder="VD: Toàn trường, Trường chính, Phân hiệu..."
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Dự trù kinh phí</label>
                      <input
                        type="text"
                        value={editKinhPhi}
                        onChange={(e) => setEditKinhPhi(e.target.value)}
                        placeholder="VD: 1.500.000 VNĐ / Quỹ Đội..."
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mục tiêu & Yêu cầu trọng tâm</label>
                    <textarea
                      rows={3}
                      value={editMucTieu}
                      onChange={(e) => setEditMucTieu(e.target.value)}
                      placeholder="Mục tiêu giáo dục, chỉ tiêu số lượng học sinh tham gia, yêu cầu an toàn vùng cao..."
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl shadow-md"
                    >
                      Lưu Thay Đổi
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Phân loại kế hoạch</span>
                      <span className="font-extrabold text-blue-900 text-sm mt-0.5 block">{plan.loai}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Trạng thái</span>
                      <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-black ${
                        plan.trangThai === 'Hoàn thành'
                          ? 'bg-emerald-100 text-emerald-800'
                          : plan.trangThai === 'Đang thực hiện'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {plan.trangThai}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Thời gian thực hiện</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{plan.thoiGian}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Người phụ trách</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{plan.nguoiPhuTrach}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Địa bàn triển khai</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">
                        {detail.diaDiem || 'Toàn trường (Trường chính & Phân hiệu)'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Kinh phí dự trù</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">
                        {detail.kinhPhiDuTru || 'Theo dự trù ngân sách Đội'}
                      </span>
                    </div>
                  </div>

                  {detail.mucTieu && (
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                      <span className="text-[10px] uppercase font-black text-blue-900 block mb-1">Mục tiêu & Yêu cầu</span>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{detail.mucTieu}</p>
                    </div>
                  )}

                  {/* Quick Summary of Connected Digital Records */}
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-amber-950 uppercase flex items-center space-x-1.5">
                        <FolderTree className="w-4 h-4 text-amber-700" />
                        <span>Hồ sơ số hóa liên kết ({linkedHoSoGroupIds.length} nhóm)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('ho-so-so-hoa')}
                        className="text-amber-800 hover:text-amber-900 font-bold text-[11px] underline"
                      >
                        Quản lý liên kết &rarr;
                      </button>
                    </div>
                    {linkedHoSoGroupIds.length === 0 ? (
                      <p className="text-slate-500 text-[11px] italic">
                        Kế hoạch chưa liên kết với nhóm hồ sơ số hóa nào. Nhấn tab 5 để liên kết.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {linkedHoSoGroupIds.map((gId) => {
                          const grp = appState.hoSoGroups.find((g) => g.id === gId);
                          return (
                            <span
                              key={gId}
                              className="bg-white border border-amber-300 text-amber-900 font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center space-x-1 shadow-2xs"
                            >
                              <span>Nhóm {gId}:</span>
                              <span className="font-medium text-slate-700">{grp?.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NỘI DUNG KẾ HOẠCH & XEM TỆP WORD/PDF */}
          {activeTab === 'noi-dung' && (
            <div className="space-y-4">
              {/* Main File Management Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <input
                  type="file"
                  ref={mainFileInputRef}
                  accept=".docx,.pdf"
                  onChange={handleMainFileSelected}
                  className="hidden"
                />

                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                    detail.mainFile?.fileType === 'pdf'
                      ? 'bg-red-100 text-red-700'
                      : detail.mainFile?.fileType === 'docx'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {detail.mainFile?.fileType === 'pdf' ? (
                      'PDF'
                    ) : detail.mainFile?.fileType === 'docx' ? (
                      'DOCX'
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      {detail.mainFile ? detail.mainFile.fileName : 'Chưa có tệp kế hoạch đính kèm'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {detail.mainFile
                        ? `Kích thước: ${detail.mainFile.fileSize} • Tải lên: ${detail.mainFile.uploadDate}`
                        : 'Hỗ trợ tải lên tệp Word (.docx) hoặc PDF để xem trực tiếp trong ứng dụng'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploadingMainFile}
                    onClick={() => mainFileInputRef.current?.click()}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{detail.mainFile ? 'Thay thế tệp Word/PDF' : 'Tải lên Word (.docx) / PDF'}</span>
                  </button>

                  {detail.mainFile && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          downloadFileFromStorage(
                            detail.mainFile!.fileId,
                            detail.mainFile!.fileName
                          )
                        }
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-300 flex items-center space-x-1 transition cursor-pointer"
                        title="Tải về máy tính"
                      >
                        <Download className="w-4 h-4" />
                        <span>Tải về</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteMainFile}
                        className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-3 py-2 rounded-xl border border-red-200 flex items-center space-x-1 transition cursor-pointer"
                        title="Xóa tệp chính"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa tệp</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* In-app Document Viewer */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3 bg-slate-900 text-white flex justify-between items-center text-xs">
                  <span className="font-bold flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-yellow-400" />
                    <span>TRÌNH XEM NỘI DUNG KẾ HOẠCH TRỰC TIẾP</span>
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {detail.mainFile?.fileType === 'pdf'
                      ? 'Xem trực tiếp định dạng PDF'
                      : detail.mainFile?.fileType === 'docx'
                      ? 'Trích xuất trực quan từ tệp Word (.docx)'
                      : 'Nội dung văn bản soạn thảo'}
                  </span>
                </div>

                {detail.mainFile?.fileType === 'pdf' && mainFileBlobUrl ? (
                  <div className="p-4 bg-slate-100">
                    <iframe
                      src={mainFileBlobUrl}
                      title="Xem trước PDF"
                      className="w-full h-[580px] rounded-xl border border-slate-300 shadow-inner bg-white"
                    />
                    <div className="mt-2 text-center">
                      <a
                        href={mainFileBlobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 hover:underline font-bold text-xs inline-flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở tệp PDF trong tab mới nếu khung xem bị giới hạn</span>
                      </a>
                    </div>
                  </div>
                ) : detail.noiDungHtml ? (
                  <div className="p-6 md:p-8 bg-white max-h-[600px] overflow-y-auto custom-scrollbar font-serif text-sm leading-relaxed text-slate-800 space-y-3 prose max-w-none">
                    <div
                      dangerouslySetInnerHTML={{ __html: detail.noiDungHtml }}
                      className="word-content-preview"
                    />
                  </div>
                ) : (
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-700">
                        Soạn thảo / Xem văn bản kế hoạch:
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = `KẾ HOẠCH HOẠT ĐỘNG CÔNG TÁC ĐỘI\nLiên đội Trường PTDTBT THCS Đường Hồng\n\nI. MỤC ĐÍCH - YÊU CẦU\n1. Tuyên truyền, giáo dục truyền thống Đội TNTP Hồ Chí Minh cho học sinh.\n2. Phát huy tính chủ động, rèn luyện nề nếp bán trú và chuyên cần vùng cao.\n\nII. NỘI DUNG TRIỂN KHAI\n1. Tổ chức sinh hoạt chuyên đề theo chủ điểm.\n2. Phân công Đội cờ đỏ kiểm tra nề nếp 2 điểm trường.\n3. Tổng kết, khen thưởng các Chi đội đạt điểm cao.`;
                          setEditNoiDungVanBan(sample);
                        }}
                        className="text-[11px] text-blue-700 font-bold hover:underline"
                      >
                        + Chèn mẫu kế hoạch Đội
                      </button>
                    </div>

                    <textarea
                      rows={12}
                      value={editNoiDungVanBan}
                      onChange={(e) => setEditNoiDungVanBan(e.target.value)}
                      placeholder="Nhập nội dung kế hoạch chi tiết, thể lệ, mục đích yêu cầu, tiến độ thực hiện tại đây..."
                      className="w-full border border-slate-300 rounded-xl p-3.5 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          updateCurrentPlan((p) => ({
                            ...p,
                            detail: {
                              ...(p.detail || {}),
                              noiDungVanBan: editNoiDungVanBan.trim(),
                            },
                          }));
                          alert('Đã lưu nội dung văn bản kế hoạch!');
                        }}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs"
                      >
                        Lưu Nội Dung Văn Bản
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LỊCH THỰC HIỆN CHI TIẾT */}
          {activeTab === 'lich-trinh' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* Add Milestone Form */}
              <form onSubmit={handleAddMilestone} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-800 text-xs uppercase flex items-center space-x-1.5">
                  <PlusCircle className="w-4 h-4 text-blue-700" />
                  <span>Thêm Mốc Thực Hiện / Phân Công Nhiệm Vụ</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    required
                    value={newMilestoneNoiDung}
                    onChange={(e) => setNewMilestoneNoiDung(e.target.value)}
                    placeholder="Nội dung công việc (VD: Họp BCH Liên đội...)"
                    className="border border-slate-300 rounded-lg p-2 bg-white col-span-1 sm:col-span-2 font-medium"
                  />
                  <input
                    type="text"
                    value={newMilestoneThoiGian}
                    onChange={(e) => setNewMilestoneThoiGian(e.target.value)}
                    placeholder="Thời gian (VD: Thứ Hai 14h...)"
                    className="border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>

                <div className="flex justify-between items-center gap-2">
                  <input
                    type="text"
                    value={newMilestoneNguoi}
                    onChange={(e) => setNewMilestoneNguoi(e.target.value)}
                    placeholder="Người thực hiện (VD: Đội cờ đỏ, GVCN 17 lớp...)"
                    className="border border-slate-300 rounded-lg p-2 bg-white flex-1 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-xs whitespace-nowrap cursor-pointer"
                  >
                    + Thêm mốc
                  </button>
                </div>
              </form>

              {/* Milestones List */}
              <div className="space-y-2">
                {(!detail.lichThucHienChiTiet || detail.lichThucHienChiTiet.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 italic bg-white rounded-xl border border-dashed">
                    Chưa có mốc thời gian chi tiết nào. Thêm các bước chuẩn bị, triển khai và tổng kết ở form phía trên.
                  </div>
                ) : (
                  detail.lichThucHienChiTiet.map((ms, idx) => (
                    <div
                      key={ms.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                        ms.daHoanThanh
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleMilestone(ms.id)}
                          className="flex-shrink-0 cursor-pointer"
                          title="Bấm để đánh dấu hoàn thành"
                        >
                          <CheckCircle2
                            className={`w-5 h-5 ${
                              ms.daHoanThanh
                                ? 'text-emerald-600 fill-emerald-100'
                                : 'text-slate-300 hover:text-emerald-500'
                            }`}
                          />
                        </button>

                        <div className="truncate">
                          <span className="text-[10px] font-bold text-slate-400 mr-2">
                            {idx + 1}.
                          </span>
                          <span
                            className={`font-bold text-slate-900 ${
                              ms.daHoanThanh ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {ms.noiDung}
                          </span>
                          <div className="text-[11px] text-slate-500 flex items-center space-x-3 mt-0.5">
                            <span>Thời gian: <b>{ms.thoiGian}</b></span>
                            <span>•</span>
                            <span>Thực hiện: <b>{ms.nguoiThucHien}</b></span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMilestone(ms.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Xóa mốc này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TÀI LIỆU MINH CHỨNG */}
          {activeTab === 'minh-chung' && (
            <div className="space-y-4">
              {/* Evidence Upload Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <input
                  type="file"
                  multiple
                  ref={evidenceFileInputRef}
                  onChange={handleEvidenceFileSelected}
                  className="hidden"
                />

                <div className="flex justify-between items-center">
                  <h4 className="font-black text-slate-800 text-xs uppercase flex items-center space-x-1.5">
                    <Paperclip className="w-4 h-4 text-emerald-700" />
                    <span>Đính Kèm Tài Liệu Minh Chứng Mới</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Hỗ trợ tệp hình ảnh, PDF, Word, Excel (cho phép chọn nhiều tệp)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Khu vực phân loại minh chứng *
                    </label>
                    <select
                      value={uploadEvidenceLoai}
                      onChange={(e) => setUploadEvidenceLoai(e.target.value as LoaiMinhChung)}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white font-bold"
                    >
                      <option value="Tài liệu minh chứng">Tài liệu minh chứng</option>
                      <option value="Hình ảnh hoạt động">Hình ảnh hoạt động</option>
                      <option value="Biên bản">Biên bản</option>
                      <option value="Báo cáo kết quả">Báo cáo kết quả</option>
                      <option value="Danh sách học sinh tham gia">Danh sách học sinh tham gia</option>
                      <option value="Tài liệu bổ sung">Tài liệu bổ sung</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tên / Tiêu đề tài liệu
                    </label>
                    <input
                      type="text"
                      value={uploadEvidenceTen}
                      onChange={(e) => setUploadEvidenceTen(e.target.value)}
                      placeholder="Để trống nếu lấy theo tên tệp..."
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Đồng thời liên kết vào Hồ sơ số hóa
                    </label>
                    <select
                      value={uploadEvidenceLinkedGroup}
                      onChange={(e) => setUploadEvidenceLinkedGroup(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white font-medium"
                    >
                      <option value={0}>Không liên kết trực tiếp</option>
                      {appState.hoSoGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          Nhóm {g.id}: {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={uploadEvidenceGhiChu}
                    onChange={(e) => setUploadEvidenceGhiChu(e.target.value)}
                    placeholder="Ghi chú thêm về tài liệu (ví dụ: Chữ ký GVCN, ảnh chụp cổng trường, danh sách nộp quà...)"
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={isUploadingEvidence}
                    onClick={() => evidenceFileInputRef.current?.click()}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Chọn tệp & Tải lên minh chứng</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs by Evidence Category */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                <span className="font-bold text-slate-500 mr-1">Bộ lọc:</span>
                {[
                  'ALL',
                  'Tài liệu minh chứng',
                  'Hình ảnh hoạt động',
                  'Biên bản',
                  'Báo cáo kết quả',
                  'Danh sách học sinh tham gia',
                  'Tài liệu bổ sung',
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEvidenceFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      evidenceFilter === cat
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white border text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'ALL' ? `Tất cả (${minhChungList.length})` : cat}
                  </button>
                ))}
              </div>

              {/* Evidence Grid */}
              {filteredMinhChung.length === 0 ? (
                <div className="bg-white rounded-2xl border p-10 text-center text-slate-400 italic">
                  Chưa có tài liệu minh chứng nào trong mục này. Bấm nút phía trên để tải lên.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredMinhChung.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            item.loai === 'Hình ảnh hoạt động'
                              ? 'bg-purple-100 text-purple-800'
                              : item.loai === 'Biên bản'
                              ? 'bg-amber-100 text-amber-800'
                              : item.loai === 'Báo cáo kết quả'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.loai}
                          </span>

                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.fileSize}
                          </span>
                        </div>

                        <h5 className="font-bold text-slate-900 text-xs line-clamp-2">
                          {item.tenTaiLieu}
                        </h5>

                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          Tệp: {item.fileName}
                        </div>

                        {item.ghiChu && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg line-clamp-2">
                            {item.ghiChu}
                          </p>
                        )}

                        {item.linkedHoSoGroupId && (
                          <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold flex items-center space-x-1">
                            <FolderTree className="w-3 h-3" />
                            <span>Đã liên kết Nhóm {item.linkedHoSoGroupId}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 mt-3 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400">
                          {item.ngayTao}
                        </span>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(item)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Xem trước"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadFileFromStorage(item.fileId, item.fileName)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Tải về máy tính"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteEvidenceItem(item)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Xóa tài liệu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: HỒ SƠ SỐ HÓA LIÊN KẾT */}
          {activeTab === 'ho-so-so-hoa' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs text-amber-950">
                <FolderTree className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <b className="text-amber-900">Liên kết số hóa theo Hướng dẫn 283-HD/HĐĐTW:</b>
                  <p className="mt-0.5 leading-relaxed">
                    Tích chọn các nhóm hồ sơ để kế hoạch này và các tài liệu minh chứng tự động xuất hiện trong nhóm hồ sơ số hóa tương ứng mà không tạo thêm tệp trùng lặp.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {appState.hoSoGroups.map((g) => {
                  const isLinked = linkedHoSoGroupIds.includes(g.id);
                  const linkedFilesCount = minhChungList.filter(
                    (m) => m.linkedHoSoGroupId === g.id
                  ).length;

                  return (
                    <div
                      key={g.id}
                      onClick={() => handleToggleLinkHoSoGroup(g.id)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        isLinked
                          ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                                isLinked
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {g.id}
                            </span>
                            <h5 className="font-bold text-slate-900 text-xs">
                              {g.name}
                            </h5>
                          </div>

                          <input
                            type="checkbox"
                            checked={isLinked}
                            onChange={() => {}} // handled by parent div
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                        </div>

                        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                          {g.desc}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 mt-2 flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-500">
                          {isLinked
                            ? `✓ Đã liên kết (${linkedFilesCount} minh chứng gán trực tiếp)`
                            : 'Chưa liên kết'}
                        </span>

                        {onOpenHoSoGroup && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenHoSoGroup(g.id);
                              onClose();
                            }}
                            className="text-amber-800 hover:text-amber-950 font-bold underline flex items-center space-x-0.5 cursor-pointer"
                          >
                            <span>Mở nhóm này</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: KẾT QUẢ VÀ ĐÁNH GIÁ */}
          {activeTab === 'danh-gia' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <form onSubmit={handleSaveEvaluation} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b">
                  <Award className="w-5 h-5 text-purple-600" />
                  <h4 className="font-black text-slate-800 text-sm uppercase">
                    Cập Nhật Kết Quả Hoàn Thành & Đánh Giá Chất Lượng
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Số lượng học sinh / đội viên tham gia
                    </label>
                    <input
                      type="number"
                      value={evalHsCount}
                      onChange={(e) => setEvalHsCount(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Toàn trường hiện có 655 học sinh tại 2 điểm trường
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Xếp loại đánh giá kết quả *
                    </label>
                    <select
                      value={evalXepLoai}
                      onChange={(e) => setEvalXepLoai(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 font-bold"
                    >
                      <option value="Xuất sắc">Xuất sắc</option>
                      <option value="Tốt">Tốt</option>
                      <option value="Đạt yêu cầu">Đạt yêu cầu</option>
                      <option value="Chưa đạt">Chưa đạt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Đánh giá chung / Kết quả đạt được *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={evalNhanXet}
                    onChange={(e) => setEvalNhanXet(e.target.value)}
                    placeholder="Đạt chỉ tiêu đề ra, 100% học sinh tham gia nghiêm túc, đảm bảo an toàn tuyệt đối khu bán trú..."
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tồn tại / Bài học kinh nghiệm & Ghi chú TPT
                  </label>
                  <textarea
                    rows={2}
                    value={evalGhiChu}
                    onChange={(e) => setEvalGhiChu(e.target.value)}
                    placeholder="Cần chuẩn bị âm thanh sớm hơn tại sân Phân hiệu..."
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>

                <div className="pt-3 border-t flex justify-end space-x-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lưu Đánh Giá & Đánh Dấu "Đã Hoàn Thành"</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-between items-center text-xs flex-shrink-0">
          <span className="text-slate-500 font-medium">
            Mã kế hoạch: <b className="font-mono">{plan.id}</b> • Hệ thống e-Đội THCS Đường Hồng
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Lightbox / Preview modal for Evidence File */}
      {previewFile && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-60 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="p-3.5 px-4 bg-slate-900 text-white flex justify-between items-center text-xs">
              <span className="font-bold truncate max-w-md">{previewFile.title}</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => downloadFileFromStorage(previewFile.fileId, previewFile.fileName)}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
                  title="Tải về máy tính"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-1 hover:bg-white/20 rounded-lg text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100">
              {previewFile.type === 'image' ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.title}
                  className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-lg"
                />
              ) : previewFile.type === 'pdf' ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.title}
                  className="w-full h-[75vh] rounded-xl border bg-white"
                />
              ) : (
                <div className="p-10 text-center space-y-3">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto" />
                  <p className="text-slate-700 font-bold text-sm">
                    {previewFile.fileName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Định dạng này có thể tải về để xem bằng ứng dụng trên máy tính.
                  </p>
                  <button
                    onClick={() => downloadFileFromStorage(previewFile.fileId, previewFile.fileName)}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs"
                  >
                    Tải về tệp này
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
