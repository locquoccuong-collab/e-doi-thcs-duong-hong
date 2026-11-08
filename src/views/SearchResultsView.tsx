import React from 'react';
import { Search, AlertTriangle, ShieldCheck, Bell, Flag, FolderTree, X } from 'lucide-react';
import { AppState, TabKey } from '../types';

interface SearchResultsViewProps {
  appState: AppState;
  query: string;
  onClearSearch: () => void;
  onSelectTab: (tab: TabKey) => void;
  onOpenHoSoGroup: (groupId: number) => void;
  onOpenEditChiDoi: (classKey: string) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  appState,
  query,
  onClearSearch,
  onSelectTab,
  onOpenHoSoGroup,
  onOpenEditChiDoi,
}) => {
  const q = query.trim().toLowerCase();

  // Search in SuViec
  const matchedSuViec = appState.listSuViec.filter((s) => {
    return (
      s.hocSinh.toLowerCase().includes(q) ||
      s.lop.toLowerCase().includes(q) ||
      s.tieuChi.toLowerCase().includes(q) ||
      s.moTa.toLowerCase().includes(q) ||
      s.nguoiGhi.toLowerCase().includes(q)
    );
  });

  // Search in CoDo
  const matchedCoDo = appState.listCoDo.filter((c) => {
    return (
      c.hoTen.toLowerCase().includes(q) ||
      c.lop.toLowerCase().includes(q) ||
      c.diemTruong.toLowerCase().includes(q) ||
      c.viTri.toLowerCase().includes(q) ||
      c.caTruc.toLowerCase().includes(q)
    );
  });

  // Search in ThongBao
  const matchedThongBao = appState.listThongBao.filter((t) => {
    return (
      t.tieuDe.toLowerCase().includes(q) ||
      t.noiDung.toLowerCase().includes(q) ||
      t.doiTuong.toLowerCase().includes(q)
    );
  });

  // Search in Classes
  const matchedClasses = Object.values(appState.classesData).filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.key.toLowerCase().includes(q) ||
      c.diemTruong.toLowerCase().includes(q) ||
      (c.gvcn && c.gvcn.toLowerCase().includes(q)) ||
      (c.chiDoiTruong && c.chiDoiTruong.toLowerCase().includes(q))
    );
  });

  // Search in HoSo
  const matchedHoSo: { group: typeof appState.hoSoGroups[0]; item: typeof appState.hoSoGroups[0]['items'][0] }[] = [];
  appState.hoSoGroups.forEach((g) => {
    if (g.items) {
      g.items.forEach((item) => {
        if (
          item.tieuDe.toLowerCase().includes(q) ||
          (item.noiDung && item.noiDung.toLowerCase().includes(q)) ||
          (item.fileName && item.fileName.toLowerCase().includes(q))
        ) {
          matchedHoSo.push({ group: g, item });
        }
      });
    }
  });

  const totalResults =
    matchedSuViec.length +
    matchedCoDo.length +
    matchedThongBao.length +
    matchedClasses.length +
    matchedHoSo.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-700 font-extrabold uppercase tracking-wide">
            <Search className="w-5 h-5 text-yellow-500" />
            <span>Kết Quả Tìm Kiếm Toàn Cục</span>
          </div>
          <h2 className="font-black text-xl text-slate-800 mt-1">
            Từ khóa: <span className="text-red-700">"{query}"</span> — {totalResults} kết quả
          </h2>
        </div>

        <button
          onClick={onClearSearch}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
        >
          <X className="w-4 h-4" />
          <span>Xóa tìm kiếm</span>
        </button>
      </div>

      {totalResults === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 italic text-xs">
          Không tìm thấy kết quả nào phù hợp với từ khóa "{query}". Hãy thử tìm kiếm tên học sinh, lớp, tiêu chí hoặc cờ đỏ.
        </div>
      ) : (
        <div className="space-y-5">
          {/* SuViec */}
          {matchedSuViec.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-xs uppercase text-slate-700 flex items-center space-x-2 border-b pb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Sự Việc / Vi Phạm / Tuyên Dương ({matchedSuViec.length})</span>
              </h3>
              <div className="space-y-2">
                {matchedSuViec.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        HS: <b>{s.hocSinh}</b> — Chi đội <b className="text-red-700">{s.lop}</b>
                      </div>
                      <div className="text-slate-600 text-[11px] mt-0.5">
                        {s.tieuChi} {s.moTa ? `(${s.moTa})` : ''}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Tuần {s.tuan} • {s.thoiGian} • Ghi: {s.nguoiGhi}
                      </div>
                    </div>
                    <span
                      className={`font-black text-xs px-2.5 py-1 rounded-full ${
                        s.diem > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {s.diem > 0 ? `+${s.diem}đ` : `${s.diem}đ`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ChiDoi */}
          {matchedClasses.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-xs uppercase text-slate-700 flex items-center space-x-2 border-b pb-2">
                <Flag className="w-4 h-4 text-red-600" />
                <span>Chi Đội Phù Hợp ({matchedClasses.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {matchedClasses.map((c) => (
                  <div
                    key={c.key}
                    onClick={() => onOpenEditChiDoi(c.key)}
                    className="p-3 bg-slate-50 hover:bg-red-50 rounded-xl border border-slate-200 text-xs cursor-pointer transition"
                  >
                    <div className="flex justify-between items-start font-bold">
                      <span className="text-red-700">{c.name}</span>
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">
                        {c.diemTruong}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      GVCN: <b>{c.gvcn || 'Chưa cập nhật'}</b>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Sĩ số: {c.siso ? `${c.siso} em` : 'Chưa có'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CoDo */}
          {matchedCoDo.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-xs uppercase text-slate-700 flex items-center space-x-2 border-b pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Đội Viên Cờ Đỏ Liên Quan ({matchedCoDo.length})</span>
              </h3>
              <div className="space-y-2">
                {matchedCoDo.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {c.hoTen} — Chi đội <b className="text-red-700">{c.lop}</b>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {c.diemTruong} • {c.caTruc} • Vị trí: <b>{c.viTri}</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ThongBao */}
          {matchedThongBao.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-xs uppercase text-slate-700 flex items-center space-x-2 border-b pb-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Thông Báo / Chỉ Đạo ({matchedThongBao.length})</span>
              </h3>
              <div className="space-y-2">
                {matchedThongBao.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1"
                  >
                    <div className="font-bold text-slate-900">{t.tieuDe}</div>
                    <p className="text-slate-600 text-[11px]">{t.noiDung}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      {t.thoiGian} • Gửi: {t.doiTuong}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HoSo */}
          {matchedHoSo.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-xs uppercase text-slate-700 flex items-center space-x-2 border-b pb-2">
                <FolderTree className="w-4 h-4 text-yellow-600" />
                <span>Hồ Sơ Số Hóa Có Tài Liệu Khớp ({matchedHoSo.length})</span>
              </h3>
              <div className="space-y-2">
                {matchedHoSo.map(({ group, item }, i) => (
                  <div
                    key={i}
                    onClick={() => onOpenHoSoGroup(group.id)}
                    className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center cursor-pointer transition"
                  >
                    <div>
                      <div className="font-bold text-emerald-900">{item.tieuDe}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Thuộc nhóm: <b>{group.name}</b>
                      </div>
                      {item.fileName && (
                        <div className="text-[10px] text-emerald-700 mt-0.5">
                          Tệp đính kèm: {item.fileName}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 underline">
                      Mở hồ sơ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
