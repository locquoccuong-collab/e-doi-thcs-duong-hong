import React, { useState, useRef } from 'react';
import { X, CalendarDays, PlusCircle, Upload, FileText, FolderTree } from 'lucide-react';
import { AppState, LichCongTac, KeHoachDetail } from '../../types';
import { saveFileToStorage } from '../../utils/fileStorage';
import { parseDocxBuffer } from '../../utils/docReader';

interface ModalLichCongTacProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onOpenPlanDetail?: (planId: number) => void;
}

export const ModalLichCongTac: React.FC<ModalLichCongTacProps> = ({
  isOpen,
  onClose,
  appState,
  setAppState,
  onOpenPlanDetail,
}) => {
  const [loai, setLoai] = useState<LichCongTac['loai']>('Kế hoạch tháng');
  const [tieuDe, setTieuDe] = useState<string>('');
  const [thoiGian, setThoiGian] = useState<string>('Tháng 11/2026');
  const [nguoiPhuTrach, setNguoiPhuTrach] = useState<string>(
    `TPT ${appState.schoolConfig.tptName}`
  );
  const [trangThai, setTrangThai] = useState<LichCongTac['trangThai']>('Đang thực hiện');
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (!tieuDe.trim()) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .trim();
        setTieuDe(cleanName);
      }
    }
  };

  const handleToggleGroup = (groupId: number) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tieuDe.trim()) return;

    try {
      setIsProcessingFile(true);
      let detail: KeHoachDetail = {
        linkedHoSoGroupIds: selectedGroupIds,
      };

      if (uploadedFile) {
        const isDocx =
          uploadedFile.name.toLowerCase().endsWith('.docx') ||
          uploadedFile.type.includes('wordprocessingml');
        const isPdf =
          uploadedFile.name.toLowerCase().endsWith('.pdf') ||
          uploadedFile.type.includes('pdf');

        let extractedHtml = '';
        let extractedText = '';

        if (isDocx) {
          const buffer = await uploadedFile.arrayBuffer();
          const parsed = await parseDocxBuffer(buffer);
          extractedHtml = parsed.html;
          extractedText = parsed.text;
        }

        const saved = await saveFileToStorage(uploadedFile);
        const now = new Date();
        const dateStr = `${now.getHours()}:${String(now.getMinutes()).padStart(
          2,
          '0'
        )} ngày ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

        detail.mainFile = {
          fileId: saved.fileId,
          fileName: saved.fileName,
          fileType: isDocx ? 'docx' : isPdf ? 'pdf' : 'other',
          fileSize: saved.fileSize,
          uploadDate: dateStr,
        };
        detail.noiDungHtml = extractedHtml;
        detail.noiDungVanBan = extractedText;
      }

      // Check deduplication: check if plan with same title exists
      const existingIndex = appState.listLichCongTac.findIndex(
        (p) => p.tieuDe.trim().toLowerCase() === tieuDe.trim().toLowerCase()
      );

      let createdOrUpdatedId = Date.now();

      if (existingIndex >= 0) {
        // Update existing plan without duplication
        createdOrUpdatedId = appState.listLichCongTac[existingIndex].id;
        setAppState((prev) => ({
          ...prev,
          listLichCongTac: prev.listLichCongTac.map((p, idx) => {
            if (idx === existingIndex) {
              return {
                ...p,
                loai,
                thoiGian: thoiGian.trim(),
                nguoiPhuTrach: nguoiPhuTrach.trim(),
                trangThai,
                linkedHoSoGroupIds: selectedGroupIds,
                detail: {
                  ...(p.detail || {}),
                  ...detail,
                  linkedHoSoGroupIds: selectedGroupIds,
                },
              };
            }
            return p;
          }),
        }));
      } else {
        // Create new
        const newItem: LichCongTac = {
          id: createdOrUpdatedId,
          loai,
          tieuDe: tieuDe.trim(),
          thoiGian: thoiGian.trim(),
          nguoiPhuTrach: nguoiPhuTrach.trim(),
          trangThai,
          linkedHoSoGroupIds: selectedGroupIds,
          detail,
        };

        setAppState((prev) => ({
          ...prev,
          listLichCongTac: [newItem, ...prev.listLichCongTac],
        }));
      }

      setTieuDe('');
      setUploadedFile(null);
      setSelectedGroupIds([]);
      onClose();

      if (onOpenPlanDetail) {
        onOpenPlanDetail(createdOrUpdatedId);
      }
    } catch (err: any) {
      alert('Lỗi tạo kế hoạch: ' + (err?.message || 'Có lỗi xảy ra'));
    } finally {
      setIsProcessingFile(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="bg-blue-900 px-5 py-3.5 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-yellow-300" />
            <h3 className="font-black text-sm uppercase tracking-wide">
              Thêm Kế Hoạch & Lịch Công Tác Đội
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg text-white transition text-lg font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Phân Loại Kế Hoạch *
              </label>
              <select
                value={loai}
                onChange={(e) => setLoai(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-blue-600 bg-slate-50"
              >
                <option value="Kế hoạch năm học">Kế hoạch năm học</option>
                <option value="Kế hoạch tháng">Kế hoạch tháng</option>
                <option value="Kế hoạch tuần">Kế hoạch tuần</option>
                <option value="Hoạt động theo chủ điểm">Hoạt động theo chủ điểm</option>
                <option value="Nhiệm vụ đột xuất">Nhiệm vụ đột xuất</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Trạng Thái Thực Hiện *
              </label>
              <select
                value={trangThai}
                onChange={(e) => setTrangThai(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-blue-600 bg-slate-50"
              >
                <option value="Chưa thực hiện">Chưa thực hiện</option>
                <option value="Đang thực hiện">Đang thực hiện</option>
                <option value="Hoàn thành">Đã hoàn thành</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tiêu Đề Kế Hoạch / Hoạt Động *
            </label>
            <input
              type="text"
              required
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder="Ví dụ: Kế hoạch tổ chức Hội thi Rung Chuông Vàng 20/11..."
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 font-bold text-slate-900"
            />
          </div>

          {/* Upload Main Document (.docx / .pdf) */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".docx,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-950 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>Tải lên tệp Word (.docx) hoặc PDF (Tùy chọn)</span>
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-[11px] flex items-center space-x-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadedFile ? 'Thay tệp' : 'Chọn tệp'}</span>
              </button>
            </div>

            {uploadedFile ? (
              <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-200 text-xs">
                <span className="font-mono text-slate-800 font-bold truncate max-w-[260px]">
                  {uploadedFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="text-red-600 hover:text-red-800 text-[11px] font-bold"
                >
                  Bỏ chọn
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                Tự động đọc nội dung văn bản Word (.docx) hoặc nhúng xem trước PDF ngay sau khi lưu.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Thời Gian Thực Hiện *
              </label>
              <input
                type="text"
                required
                value={thoiGian}
                onChange={(e) => setThoiGian(e.target.value)}
                placeholder="Ví dụ: Tuần 8, hoặc Tháng 11/2026..."
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Người / Bộ Phận Phụ Trách *
              </label>
              <input
                type="text"
                required
                value={nguoiPhuTrach}
                onChange={(e) => setNguoiPhuTrach(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>

          {/* Link to 8 Digital Record Groups */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
              <FolderTree className="w-4 h-4 text-amber-600" />
              <span>Liên Kết Với 8 Nhóm Hồ Sơ Số Hóa (Tùy chọn)</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50 custom-scrollbar">
              {appState.hoSoGroups.map((g) => {
                const isSelected = selectedGroupIds.includes(g.id);
                return (
                  <label
                    key={g.id}
                    className={`flex items-center space-x-2 p-1.5 rounded-lg cursor-pointer transition text-[11px] ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'hover:bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleGroup(g.id)}
                      className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="truncate">Nhóm {g.id}: {g.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isProcessingFile}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isProcessingFile ? 'Đang lưu tệp...' : 'Lưu Kế Hoạch & Mở Chi Tiết'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
