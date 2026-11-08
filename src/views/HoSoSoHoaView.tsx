import React from 'react';
import {
  FolderTree,
  FolderOpen,
  FileText,
  Paperclip,
  PlusCircle,
  Download,
  Info,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AppState, HoSoGroup } from '../types';

interface HoSoSoHoaViewProps {
  appState: AppState;
  onOpenHoSoGroup: (groupId: number) => void;
  onOpenKhoHoSo?: () => void;
}

export const HoSoSoHoaView: React.FC<HoSoSoHoaViewProps> = ({
  appState,
  onOpenHoSoGroup,
  onOpenKhoHoSo,
}) => {
  const totalFiles = appState.hoSoGroups.reduce(
    (acc, g) => acc + (g.items ? g.items.length : 0),
    0
  );
  const totalHoSoChiDoi = (appState.listHoSoChiDoi || []).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 text-xs text-emerald-700 font-extrabold uppercase tracking-wide">
          <FolderTree className="w-5 h-5 text-emerald-600" />
          <span>Hệ Thống 8 Nhóm Hồ Sơ Số Hóa Đội TNTP Hồ Chí Minh</span>
        </div>
        <h2 className="font-black text-xl text-slate-800 mt-1">
          Số Hóa, Tinh Gọn & Khử Trùng Lặp Hồ Sơ Nghiệp Vụ Liên Đội
        </h2>

        <div className="mt-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 leading-relaxed flex items-start space-x-3">
          <Info className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <b className="text-emerald-900">Lưu ý nghiệp vụ số hóa:</b> Thực hiện tinh thần chỉ đạo tại{' '}
            <b>Hướng dẫn số 283-HD/HĐĐTW ngày 17/9/2026</b> của Hội đồng Đội Trung ương về việc số hóa hồ sơ, tinh gọn thủ tục sổ sách hành chính Đội trong nhà trường.
            Ứng dụng thiết kế sẵn <b>8 nhóm hồ sơ chuẩn hóa</b> giúp TPT và Liên đội lưu trữ nhật ký, biên bản và <b>đính kèm tệp văn bản / PDF / hình ảnh thực tế</b> để tải về và tra cứu mọi lúc mọi nơi.
          </div>
        </div>
      </div>

      {/* Grid of 8 Record Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {appState.hoSoGroups.map((g) => {
          const count = g.items ? g.items.length : 0;
          return (
            <div
              key={g.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md hover:border-emerald-500 transition group"
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-base shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition">
                    {g.id}
                  </div>
                  <span className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-emerald-600" />
                    <span>{count} tài liệu</span>
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-emerald-800 transition">
                  {g.name}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {g.desc}
                </p>

                {g.id === 2 && (
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-[10px] text-blue-900 font-medium">
                    ⚡ Tự động liên kết đồng bộ 17 Chi đội THCS
                  </div>
                )}

                {/* Linked Plans & Evidence badge */}
                {(() => {
                  const linkedPlansCount = appState.listLichCongTac.filter(
                    (p) =>
                      p.linkedHoSoGroupIds?.includes(g.id) ||
                      p.detail?.linkedHoSoGroupIds?.includes(g.id) ||
                      p.detail?.minhChungList?.some((m) => m.linkedHoSoGroupId === g.id)
                  ).length;
                  if (linkedPlansCount === 0) return null;
                  return (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-900 font-bold flex items-center space-x-1.5">
                      <FolderTree className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                      <span>{linkedPlansCount} kế hoạch & minh chứng liên kết</span>
                    </div>
                  );
                })()}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                {g.id === 2 && onOpenKhoHoSo ? (
                  <>
                    <button
                      onClick={onOpenKhoHoSo}
                      className="w-full bg-red-700 hover:bg-red-800 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <FolderTree className="w-4 h-4 text-yellow-300" />
                      <span>Kho Hồ Sơ 17 Chi Đội ({totalHoSoChiDoi} tệp)</span>
                    </button>
                    <button
                      onClick={() => onOpenHoSoGroup(g.id)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Xem danh mục nhóm</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onOpenHoSoGroup(g.id)}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Mở Quản Lý Hồ Sơ</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
