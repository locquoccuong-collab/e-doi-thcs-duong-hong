import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Info,
  RefreshCw,
  School,
  Users,
} from 'lucide-react';
import { AppState, HocSinh } from '../../types';
import {
  ParseExcelResult,
  ParsedRowResult,
  downloadExcelTemplate,
} from '../../utils/excelImport';

interface ModalImportExcelHocSinhProps {
  isOpen: boolean;
  onClose: () => void;
  parseResult: ParseExcelResult | null;
  fileName: string;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onOpenSelectFile: () => void;
}

export const ModalImportExcelHocSinh: React.FC<ModalImportExcelHocSinhProps> = ({
  isOpen,
  onClose,
  parseResult,
  fileName,
  appState,
  setAppState,
  onOpenSelectFile,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'VALID' | 'UPDATE' | 'ERROR'>('ALL');
  const [updateExisting, setUpdateExisting] = useState<boolean>(true);
  const [skipErrors, setSkipErrors] = useState<boolean>(true);

  if (!isOpen || !parseResult) return null;

  const { totalRows, validRows, updateRows, errorRows, allRows, sheetName } = parseResult;

  // Filter rows based on active preview tab
  const displayedRows = allRows.filter((r) => {
    if (activeTab === 'VALID') return r.status === 'valid';
    if (activeTab === 'UPDATE') return r.status === 'update';
    if (activeTab === 'ERROR') return r.status === 'error';
    return true;
  });

  // Calculate rows to import
  const rowsToImport = allRows.filter((r) => {
    if (r.status === 'error') return false;
    if (r.status === 'update' && !updateExisting) return false;
    return true;
  });

  const handleConfirmImport = () => {
    if (rowsToImport.length === 0) {
      alert('Không có học sinh nào hợp lệ để nhập vào hệ thống!');
      return;
    }

    const currentList = [...appState.listHocSinh];
    const existingMap = new Map<string, number>(); // maHs -> index in currentList
    currentList.forEach((s, idx) => {
      if (s.maHs) {
        existingMap.set(s.maHs.trim().toUpperCase(), idx);
      }
    });

    let countNew = 0;
    let countUpdated = 0;

    rowsToImport.forEach((row, i) => {
      const maHsKey = row.maHs.trim().toUpperCase();

      if (existingMap.has(maHsKey) && updateExisting) {
        // Update existing student
        const targetIdx = existingMap.get(maHsKey)!;
        const old = currentList[targetIdx];
        currentList[targetIdx] = {
          ...old,
          maHs: row.maHs,
          hoTen: row.hoTen,
          gioiTinh: row.gioiTinh,
          ngaySinh: row.ngaySinh,
          danToc: row.danToc,
          lop: row.lop,
          diemTruong: row.diemTruong,
          isDoiVien: row.isDoiVien,
          ngayVaoDoi: row.isDoiVien ? row.ngayVaoDoi || old.ngayVaoDoi : undefined,
          isBanTru: row.isBanTru,
          hoanThanhRenLuyen: row.hoanThanhRenLuyen,
          isDoanVien: row.isDoanVien !== undefined ? row.isDoanVien : old.isDoanVien,
          ngayVaoDoan: row.ngayVaoDoan || old.ngayVaoDoan,
          soTheDoan: row.soTheDoan || old.soTheDoan,
          chiDoanSinhHoat: row.chiDoanSinhHoat || old.chiDoanSinhHoat,
          ghiChu: row.ghiChu || old.ghiChu,
        };
        countUpdated++;
      } else {
        // Create new student
        const newHs: HocSinh = {
          id: `hs-imp-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          maHs: row.maHs,
          hoTen: row.hoTen,
          gioiTinh: row.gioiTinh,
          ngaySinh: row.ngaySinh,
          danToc: row.danToc,
          lop: row.lop,
          diemTruong: row.diemTruong,
          isDoiVien: row.isDoiVien,
          ngayVaoDoi: row.isDoiVien ? row.ngayVaoDoi : undefined,
          isBanTru: row.isBanTru,
          hoanThanhRenLuyen: row.hoanThanhRenLuyen,
          isDoanVien: row.isDoanVien || false,
          ngayVaoDoan: row.ngayVaoDoan,
          soTheDoan: row.soTheDoan,
          chiDoanSinhHoat: row.chiDoanSinhHoat,
          ghiChu: row.ghiChu,
        };
        currentList.unshift(newHs);
        existingMap.set(maHsKey, 0);
        countNew++;
      }
    });

    // Commit changes to state
    setAppState((prev) => ({
      ...prev,
      listHocSinh: currentList,
    }));

    onClose();

    alert(
      `Nhập thành công!\n- Tổng số học sinh xử lý: ${rowsToImport.length}\n- Thêm mới: ${countNew} em\n- Cập nhật thông tin: ${countUpdated} em\n- Dòng lỗi đã bỏ qua: ${errorRows.length}`
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-scale-up">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-3.5 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide flex items-center space-x-2">
                <span>Xem Trước Dữ Liệu Học Sinh Từ Excel</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-400/30">
                  {fileName}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Trang tính: <span className="font-semibold text-yellow-300">{sheetName}</span> • Kiểm tra tính hợp lệ trước khi lưu vào Liên đội
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg text-slate-300 hover:text-white transition"
            title="Đóng cửa sổ (Không lưu thay đổi)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1 custom-scrollbar">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => setActiveTab('ALL')}
              className={`p-3 rounded-xl border cursor-pointer transition ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                Tổng Dòng Đọc Được
              </div>
              <div className="text-xl font-black mt-0.5">{totalRows}</div>
              <div className="text-[10px] opacity-75">học sinh trong tệp</div>
            </div>

            <div
              onClick={() => setActiveTab('VALID')}
              className={`p-3 rounded-xl border cursor-pointer transition ${
                activeTab === 'VALID'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-900'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                Hợp Lệ (Thêm Mới)
              </div>
              <div className="text-xl font-black mt-0.5">{validRows.length}</div>
              <div className="text-[10px] opacity-75">mã HS mới chưa có</div>
            </div>

            <div
              onClick={() => setActiveTab('UPDATE')}
              className={`p-3 rounded-xl border cursor-pointer transition ${
                activeTab === 'UPDATE'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-900'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                Cập Nhật (Đã Có Mã HS)
              </div>
              <div className="text-xl font-black mt-0.5">{updateRows.length}</div>
              <div className="text-[10px] opacity-75">sẽ cập nhật thông tin</div>
            </div>

            <div
              onClick={() => setActiveTab('ERROR')}
              className={`p-3 rounded-xl border cursor-pointer transition ${
                activeTab === 'ERROR'
                  ? 'bg-red-700 text-white border-red-700 shadow-sm'
                  : errorRows.length > 0
                  ? 'bg-red-50 border-red-300 hover:bg-red-100 text-red-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                Dòng Lỗi Cần Xử Lý
              </div>
              <div className="text-xl font-black mt-0.5">{errorRows.length}</div>
              <div className="text-[10px] opacity-75">
                {errorRows.length > 0 ? 'thiếu tên hoặc sai lớp' : 'không phát hiện lỗi'}
              </div>
            </div>
          </div>

          {/* Import Settings & Actions Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updateExisting}
                  onChange={(e) => setUpdateExisting(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4"
                />
                <span>Cập nhật thông tin học sinh nếu trùng Mã HS ({updateRows.length} em)</span>
              </label>

              {errorRows.length > 0 && (
                <div className="flex items-center space-x-1.5 text-[11px] text-red-700 font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Có {errorRows.length} dòng lỗi sẽ được bỏ qua khi nhập (nhấn tab "Dòng Lỗi" để kiểm tra).
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={downloadExcelTemplate}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition text-[11px]"
                title="Tải mẫu file Excel chuẩn có sẵn cột và dữ liệu mẫu"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tải File Mẫu (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={onOpenSelectFile}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition text-[11px]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Chọn tệp khác</span>
              </button>
            </div>
          </div>

          {/* Filter Pills for Table */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-500">Xem danh sách:</span>
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-2.5 py-1 rounded-md font-bold transition text-[11px] ${
                  activeTab === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border text-slate-700 hover:bg-slate-50'
                }`}
              >
                Tất cả ({allRows.length})
              </button>
              <button
                onClick={() => setActiveTab('VALID')}
                className={`px-2.5 py-1 rounded-md font-bold transition text-[11px] ${
                  activeTab === 'VALID'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white border text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                Thêm mới ({validRows.length})
              </button>
              <button
                onClick={() => setActiveTab('UPDATE')}
                className={`px-2.5 py-1 rounded-md font-bold transition text-[11px] ${
                  activeTab === 'UPDATE'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border text-amber-800 hover:bg-amber-50'
                }`}
              >
                Cập nhật ({updateRows.length})
              </button>
              <button
                onClick={() => setActiveTab('ERROR')}
                className={`px-2.5 py-1 rounded-md font-bold transition text-[11px] ${
                  activeTab === 'ERROR'
                    ? 'bg-red-700 text-white'
                    : 'bg-white border text-red-800 hover:bg-red-50'
                }`}
              >
                Có lỗi ({errorRows.length})
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-semibold">
              Sẵn sàng nhập: <b className="text-emerald-700 font-black">{rowsToImport.length}</b> học sinh
            </div>
          </div>

          {/* Table Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200 shadow-xs z-10">
                  <tr>
                    <th className="p-2.5 w-14 text-center">Dòng</th>
                    <th className="p-2.5">Trạng Thái</th>
                    <th className="p-2.5">Mã HS</th>
                    <th className="p-2.5">Họ và Tên</th>
                    <th className="p-2.5 text-center">Giới Tính</th>
                    <th className="p-2.5">Ngày Sinh</th>
                    <th className="p-2.5">Dân Tộc</th>
                    <th className="p-2.5">Chi Đội</th>
                    <th className="p-2.5">Điểm Trường</th>
                    <th className="p-2.5 text-center">Đội Viên</th>
                    <th className="p-2.5 text-center">Bán Trú</th>
                    <th className="p-2.5">Ghi Chú & Lỗi Kiểm Tra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="p-8 text-center text-slate-400 italic">
                        Không có dòng dữ liệu nào trong mục này.
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((r) => (
                      <tr
                        key={r.rowNum}
                        className={`hover:bg-slate-50 transition ${
                          r.status === 'error'
                            ? 'bg-red-50/50'
                            : r.status === 'update'
                            ? 'bg-amber-50/30'
                            : ''
                        }`}
                      >
                        <td className="p-2.5 text-center font-bold font-mono text-slate-400">
                          {r.rowNum}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          {r.status === 'valid' && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Thêm mới</span>
                            </span>
                          )}
                          {r.status === 'update' && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-700" />
                              <span>Cập nhật</span>
                            </span>
                          )}
                          {r.status === 'error' && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300">
                              <AlertCircle className="w-3 h-3 text-red-700" />
                              <span>Lỗi dữ liệu</span>
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-slate-700">{r.maHs}</td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {r.hoTen || <span className="text-red-600 italic">Thiếu họ tên</span>}
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r.gioiTinh === 'Nữ'
                                ? 'bg-pink-100 text-pink-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {r.gioiTinh}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600 whitespace-nowrap">{r.ngaySinh}</td>
                        <td className="p-2.5 font-medium text-slate-700">{r.danToc}</td>
                        <td className="p-2.5">
                          <span className="font-black text-red-700">{r.lop}</span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r.diemTruong === 'Trường chính'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            {r.diemTruong}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          {r.isDoiVien ? (
                            <span className="text-emerald-700 font-bold">Đội viên</span>
                          ) : (
                            <span className="text-slate-400">Chưa</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          {r.isBanTru ? (
                            <span className="text-amber-800 font-bold">Nội trú</span>
                          ) : (
                            <span className="text-slate-400">Đi về</span>
                          )}
                        </td>
                        <td className="p-2.5">
                          {r.errors.length > 0 && (
                            <div className="text-red-700 font-bold space-y-0.5">
                              {r.errors.map((err, eIdx) => (
                                <div key={eIdx}>✕ {err}</div>
                              ))}
                            </div>
                          )}
                          {r.warnings.length > 0 && (
                            <div className="text-amber-700 font-medium space-y-0.5">
                              {r.warnings.map((warn, wIdx) => (
                                <div key={wIdx}>⚠ {warn}</div>
                              ))}
                            </div>
                          )}
                          {r.errors.length === 0 && r.warnings.length === 0 && (
                            <span className="text-slate-400">{r.ghiChu || '--'}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 flex-shrink-0">
          <div className="text-xs text-slate-500">
            Dữ liệu học sinh hiện tại sẽ được bảo toàn nguyên vẹn cho đến khi bạn xác nhận nhập.
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-white transition text-xs"
            >
              Hủy Bỏ (Không Lưu)
            </button>

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={rowsToImport.length === 0}
              className={`px-5 py-2 font-black rounded-xl shadow-md transition text-xs flex items-center space-x-2 ${
                rowsToImport.length > 0
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Nhập ({rowsToImport.length} Học Sinh)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
