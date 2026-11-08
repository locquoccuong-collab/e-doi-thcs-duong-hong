import React, { useState } from 'react';
import {
  CalendarDays,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  FileText,
  Paperclip,
  FolderTree,
  Eye,
  Award,
  Search,
  Filter,
} from 'lucide-react';
import { AppState, LichCongTac } from '../types';
import { ModalChiTietKeHoach } from '../components/modals/ModalChiTietKeHoach';

interface LichCongTacViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onOpenModalLich: () => void;
  onOpenHoSoGroup?: (groupId: number) => void;
}

export const LichCongTacView: React.FC<LichCongTacViewProps> = ({
  appState,
  setAppState,
  onOpenModalLich,
  onOpenHoSoGroup,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const filteredList = appState.listLichCongTac.filter((l) => {
    if (filterType !== 'ALL' && l.loai !== filterType) return false;
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'Hoàn thành' && l.trangThai !== 'Hoàn thành') return false;
      if (filterStatus === 'Đang thực hiện' && l.trangThai !== 'Đang thực hiện') return false;
      if (
        filterStatus === 'Chưa thực hiện' &&
        l.trangThai !== 'Chưa thực hiện' &&
        l.trangThai !== 'Chờ thực hiện'
      )
        return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = l.tieuDe.toLowerCase().includes(q);
      const matchPerson = l.nguoiPhuTrach.toLowerCase().includes(q);
      const matchTime = l.thoiGian.toLowerCase().includes(q);
      if (!matchTitle && !matchPerson && !matchTime) return false;
    }
    return true;
  });

  const toggleTrangThai = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setAppState((prev) => ({
      ...prev,
      listLichCongTac: prev.listLichCongTac.map((l) => {
        if (l.id === id) {
          const nextStatus =
            l.trangThai === 'Hoàn thành'
              ? 'Chưa thực hiện'
              : l.trangThai === 'Chưa thực hiện' || l.trangThai === 'Chờ thực hiện'
              ? 'Đang thực hiện'
              : 'Hoàn thành';
          return { ...l, trangThai: nextStatus };
        }
        return l;
      }),
    }));
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc muốn xóa kế hoạch / lịch công tác này?')) {
      setAppState((prev) => ({
        ...prev,
        listLichCongTac: prev.listLichCongTac.filter((l) => l.id !== id),
      }));
    }
  };

  // Stats computation
  const totalPlans = appState.listLichCongTac.length;
  const completedPlans = appState.listLichCongTac.filter(
    (p) => p.trangThai === 'Hoàn thành'
  ).length;
  const inProgressPlans = appState.listLichCongTac.filter(
    (p) => p.trangThai === 'Đang thực hiện'
  ).length;
  const plansWithEvidence = appState.listLichCongTac.filter(
    (p) =>
      p.detail?.mainFile ||
      (p.detail?.minhChungList && p.detail.minhChungList.length > 0)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-700 font-extrabold uppercase tracking-wide">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <span>Kế Hoạch & Lịch Công Tác Đội Năm Học 2026-2027</span>
          </div>
          <h2 className="font-black text-xl text-slate-800 mt-1">
            Quản Lý Kế Hoạch, Minh Chứng & Đồng Bộ Hồ Sơ Số Hóa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem trước tệp Word (.docx), PDF trực tiếp; quản lý ảnh minh chứng, biên bản và kết nối 8 nhóm hồ sơ Đội.
          </p>
        </div>

        <button
          onClick={onOpenModalLich}
          className="bg-blue-700 hover:bg-blue-800 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Thêm Kế Hoạch / Tải Tệp Lên</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Tổng số kế hoạch</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalPlans}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Năm học, tháng, tuần & chuyên đề</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Đang triển khai</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{inProgressPlans}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cần theo dõi tiến độ thực hiện</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Đã hoàn thành</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completedPlans}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0}% chỉ tiêu kế hoạch
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Đã có minh chứng số</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{plansWithEvidence}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Đính kèm Word/PDF & ảnh hoạt động</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm kế hoạch, người phụ trách, thời gian..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 font-medium"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <span className="font-bold text-slate-500 mr-1">Trạng thái:</span>
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'Đang thực hiện', label: 'Đang làm' },
              { key: 'Hoàn thành', label: 'Đã xong' },
              { key: 'Chưa thực hiện', label: 'Chưa làm' },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setFilterStatus(st.key)}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  filterStatus === st.key
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="font-bold text-slate-500 mr-1">Phân loại:</span>
          {[
            'ALL',
            'Kế hoạch năm học',
            'Kế hoạch tháng',
            'Kế hoạch tuần',
            'Hoạt động theo chủ điểm',
            'Nhiệm vụ đột xuất',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterType === cat
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-white border text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả kế hoạch' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center text-slate-400 italic text-xs">
            Không tìm thấy kế hoạch hoặc hoạt động nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          filteredList.map((item) => {
            const isCompleted = item.trangThai === 'Hoàn thành';
            const isInProgress = item.trangThai === 'Đang thực hiện';
            const hasMainFile = !!item.detail?.mainFile;
            const evidenceCount = item.detail?.minhChungList?.length || 0;
            const linkedGroups = item.linkedHoSoGroupIds || item.detail?.linkedHoSoGroupIds || [];

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPlanId(item.id)}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md hover:border-blue-400 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer group"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {item.loai}
                    </span>

                    {/* Status Badge with Quick Toggle */}
                    <button
                      type="button"
                      onClick={(e) => toggleTrangThai(item.id, e)}
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border transition flex items-center space-x-1 cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isInProgress
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                      title="Bấm để chuyển trạng thái nhanh"
                    >
                      {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      <span>{item.trangThai}</span>
                    </button>

                    {hasMainFile && (
                      <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-red-600" />
                        <span>Tệp: {item.detail!.mainFile!.fileType.toUpperCase()}</span>
                      </span>
                    )}

                    {evidenceCount > 0 && (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <Paperclip className="w-3 h-3 text-emerald-600" />
                        <span>{evidenceCount} minh chứng</span>
                      </span>
                    )}

                    {linkedGroups.length > 0 && (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <FolderTree className="w-3 h-3 text-amber-600" />
                        <span>{linkedGroups.length} nhóm hồ sơ</span>
                      </span>
                    )}
                  </div>

                  <h3
                    className={`font-black text-sm text-slate-900 group-hover:text-blue-900 transition leading-snug ${
                      isCompleted ? 'text-slate-500' : ''
                    }`}
                  >
                    {item.tieuDe}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Thời gian: <b className="text-slate-700">{item.thoiGian}</b>
                      </span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Phụ trách: <b className="text-slate-700">{item.nguoiPhuTrach}</b>
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanId(item.id)}
                    className="px-3.5 py-1.5 bg-blue-50 group-hover:bg-blue-700 text-blue-700 group-hover:text-white font-bold text-xs rounded-xl border border-blue-200 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem & Minh Chứng</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Xóa kế hoạch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PLAN & EVIDENCE DETAILS MODAL */}
      <ModalChiTietKeHoach
        isOpen={selectedPlanId !== null}
        onClose={() => setSelectedPlanId(null)}
        planId={selectedPlanId}
        appState={appState}
        setAppState={setAppState}
        onOpenHoSoGroup={onOpenHoSoGroup}
      />
    </div>
  );
};
