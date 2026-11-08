import React, { useState } from 'react';
import {
  X,
  FolderOpen,
  FileText,
  Paperclip,
  Download,
  Trash2,
  CloudUpload,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  School,
  ExternalLink,
  FolderTree,
  CalendarDays,
  Eye,
} from 'lucide-react';
import { AppState, HoSoGroup, HoSoItem } from '../../types';
import { CLASS_DEFINITIONS } from '../../data/initialData';
import { saveFileToStorage, downloadFileFromStorage, getFileBlobUrl } from '../../utils/fileStorage';

interface ModalHoSoGroupProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number | null;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onOpenEditChiDoi: (classKey: string) => void;
  onOpenPlanDetail?: (planId: number) => void;
  onOpenKhoHoSo?: (classKey?: string) => void;
}

export const ModalHoSoGroup: React.FC<ModalHoSoGroupProps> = ({
  isOpen,
  onClose,
  groupId,
  appState,
  setAppState,
  onOpenEditChiDoi,
  onOpenPlanDetail,
  onOpenKhoHoSo,
}) => {
  const [tieuDe, setTieuDe] = useState<string>('');
  const [noiDung, setNoiDung] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const group = appState.hoSoGroups.find((g) => g.id === groupId);

  if (!isOpen || !group) return null;

  // Linked plans and evidence from the Plan/Schedule module
  const linkedPlans = appState.listLichCongTac.filter((p) => {
    const isPlanLinked =
      p.linkedHoSoGroupIds?.includes(group.id) ||
      p.detail?.linkedHoSoGroupIds?.includes(group.id);
    const hasEvidenceLinked = p.detail?.minhChungList?.some(
      (m) => m.linkedHoSoGroupId === group.id
    );
    return isPlanLinked || hasEvidenceLinked;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tieuDe.trim()) return;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())} ngày ${pad(
      now.getDate()
    )}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    try {
      setIsUploading(true);
      let fileId: string | undefined = undefined;
      let fileName: string | null = null;
      let fileSize = '';

      if (selectedFile) {
        const saved = await saveFileToStorage(selectedFile);
        fileId = saved.fileId;
        fileName = saved.fileName;
        fileSize = saved.fileSize;
      }

      const newItem: HoSoItem = {
        id: Date.now(),
        tieuDe: tieuDe.trim(),
        noiDung: noiDung.trim(),
        thoiGian: timeStr,
        fileName,
        fileSize,
        fileId,
      };

      setAppState((prev) => ({
        ...prev,
        hoSoGroups: prev.hoSoGroups.map((g) => {
          if (g.id === group.id) {
            return {
              ...g,
              items: [newItem, ...(g.items || [])],
            };
          }
          return g;
        }),
      }));

      setTieuDe('');
      setNoiDung('');
      setSelectedFile(null);
    } catch (err: any) {
      alert('Lỗi lưu tài liệu vào hồ sơ: ' + (err?.message || 'Có lỗi xảy ra'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = (itemId: number) => {
    if (window.confirm('Bạn có chắc muốn xóa văn bản/tài liệu này khỏi hồ sơ?')) {
      setAppState((prev) => ({
        ...prev,
        hoSoGroups: prev.hoSoGroups.map((g) => {
          if (g.id === group.id) {
            return {
              ...g,
              items: (g.items || []).filter((it) => it.id !== itemId),
            };
          }
          return g;
        }),
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-5 py-4 text-white flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wide flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-yellow-300" />
              <span>Nhóm {group.id}: {group.name}</span>
            </h3>
            <p className="text-[11px] text-emerald-100 mt-0.5 line-clamp-1">{group.desc}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg text-white transition text-lg font-bold cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
          {/* Linked Plans & Evidence Section */}
          {linkedPlans.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-black text-amber-950 uppercase tracking-wide flex items-center space-x-1.5 text-[11px]">
                  <FolderTree className="w-4 h-4 text-amber-700" />
                  <span>Kế Hoạch & Minh Chứng Đồng Bộ Từ Module Kế Hoạch ({linkedPlans.length})</span>
                </span>
                <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                  Không nhân bản tệp • Dùng chung liên kết
                </span>
              </div>

              <div className="space-y-2.5">
                {linkedPlans.map((lp) => {
                  const evidencesInThisGroup = (lp.detail?.minhChungList || []).filter(
                    (m) => m.linkedHoSoGroupId === group.id
                  );

                  return (
                    <div
                      key={lp.id}
                      className="bg-white border border-amber-200 rounded-xl p-3 shadow-2xs space-y-2"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded">
                              {lp.loai}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              lp.trangThai === 'Hoàn thành'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}>
                              {lp.trangThai}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-xs mt-1">
                            {lp.tieuDe}
                          </h5>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Thời gian: {lp.thoiGian} • Phụ trách: {lp.nguoiPhuTrach}
                          </div>
                        </div>

                        {onOpenPlanDetail && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenPlanDetail(lp.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-[10px] flex items-center space-x-1 cursor-pointer flex-shrink-0"
                          >
                            <span>Mở kế hoạch</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Attached main file of this plan */}
                      {lp.detail?.mainFile && (
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                            <span className="font-bold text-slate-800 truncate">
                              Tệp kế hoạch chính: {lp.detail.mainFile.fileName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({lp.detail.mainFile.fileSize})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              downloadFileFromStorage(
                                lp.detail!.mainFile!.fileId,
                                lp.detail!.mainFile!.fileName
                              )
                            }
                            className="text-blue-700 hover:text-blue-900 font-bold text-[11px] underline flex items-center space-x-1 ml-2 flex-shrink-0 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Tải về</span>
                          </button>
                        </div>
                      )}

                      {/* Evidence items specifically linked to this group */}
                      {evidencesInThisGroup.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-slate-600 block">
                            Minh chứng cụ thể gán vào Nhóm {group.id}:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {evidencesInThisGroup.map((ev) => (
                              <div
                                key={ev.id}
                                className="p-2 bg-amber-50/50 rounded-lg border border-amber-200 flex justify-between items-center text-[11px]"
                              >
                                <div className="truncate mr-2">
                                  <span className="font-bold text-slate-900 block truncate">
                                    {ev.tenTaiLieu}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {ev.fileName} ({ev.fileSize})
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => downloadFileFromStorage(ev.fileId, ev.fileName)}
                                  className="p-1 text-amber-800 hover:text-amber-950 rounded cursor-pointer"
                                  title="Tải về"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special for Group 2: Synced 17 Chi đội table preview */}
          {group.id === 2 && (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-blue-950 font-bold">
                <span className="flex items-center space-x-1.5">
                  <School className="w-4 h-4 text-blue-700" />
                  <span>Danh Sách 17 Chi Đội & Kho Hồ Sơ Điện Tử:</span>
                </span>
                {onOpenKhoHoSo && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenKhoHoSo();
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-black text-xs rounded-xl shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <FolderTree className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Mở Kho Hồ Sơ 17 Chi Đội (8 Thư Mục)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {CLASS_DEFINITIONS.map((c) => {
                  const info = appState.classesData[c.key];
                  const fileCount = (appState.listHoSoChiDoi || []).filter((i) => i.classKey === c.key).length;
                  return (
                    <div
                      key={c.key}
                      className="p-2.5 bg-white rounded-xl border border-blue-100 hover:border-blue-400 shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-black text-blue-900 flex justify-between items-center">
                          <span>{c.name}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-full">
                            {fileCount} tệp
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          GV: {info?.gvcn || 'Chưa cập nhật'}
                        </div>
                      </div>

                      <div className="flex space-x-1 mt-2 pt-1.5 border-t border-slate-100">
                        {onOpenKhoHoSo && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenKhoHoSo(c.key);
                              onClose();
                            }}
                            className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200 text-center cursor-pointer"
                            title="Mở kho 8 thư mục hồ sơ của lớp này"
                          >
                            Hồ sơ
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onOpenEditChiDoi(c.key);
                            onClose();
                          }}
                          className="flex-1 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 text-center cursor-pointer"
                          title="Sửa thông tin GVCN / sĩ số"
                        >
                          Sĩ số
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stored Items List in this group */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center font-black text-slate-700 uppercase tracking-wide text-[11px]">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Danh Mục Văn Bản & Hồ Sơ Lưu Trực Tiếp</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                {group.items?.length || 0} văn bản
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
              {!group.items || group.items.length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic text-[11px]">
                  Chưa có văn bản lưu trực tiếp trong nhóm hồ sơ này.
                </div>
              ) : (
                group.items.map((it, idx) => (
                  <div
                    key={it.id || idx}
                    className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-black text-slate-900 text-xs">
                        {idx + 1}. {it.tieuDe}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(it.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                        title="Xóa tài liệu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {it.noiDung && (
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {it.noiDung}
                      </p>
                    )}

                    <div className="flex flex-wrap justify-between items-center pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>{it.thoiGian}</span>
                      {it.fileId ? (
                        <button
                          type="button"
                          onClick={() => downloadFileFromStorage(it.fileId!, it.fileName || 'Tai_lieu')}
                          className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 hover:underline cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Tải về: {it.fileName} ({it.fileSize || 'Tệp đính kèm'})</span>
                        </button>
                      ) : it.fileData ? (
                        <a
                          href={it.fileData}
                          download={it.fileName || 'Tai_lieu_eDoi'}
                          className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 hover:underline"
                        >
                          <Download className="w-3 h-3" />
                          <span>Tải về: {it.fileName} ({it.fileSize || 'Tệp đính kèm'})</span>
                        </a>
                      ) : (
                        <span className="italic text-slate-300">Không có tệp đính kèm</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form to Add New Document to this group */}
          <form
            onSubmit={handleSaveEntry}
            className="border-t border-slate-200 pt-3 space-y-3"
          >
            <div className="font-black text-xs text-emerald-800 uppercase flex items-center space-x-1.5">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Thêm Văn Bản / Minh Chứng Mới Vào Nhóm {group.id}</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tiêu Đề Tài Liệu / Kế Hoạch *
              </label>
              <input
                type="text"
                required
                value={tieuDe}
                onChange={(e) => setTieuDe(e.target.value)}
                placeholder="Ví dụ: Kế hoạch hoặc biên bản hoạt động..."
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nội Dung Tóm Tắt / Ghi Chú
              </label>
              <textarea
                rows={2}
                value={noiDung}
                onChange={(e) => setNoiDung(e.target.value)}
                placeholder="Ghi chú nội dung trọng tâm..."
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
                <span>Đính Kèm Tệp Thực Tế (Word, PDF, Excel, Hình ảnh)</span>
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-slate-50 text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{isUploading ? 'Đang lưu tệp...' : 'Lưu Vào Nhóm Hồ Sơ'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
