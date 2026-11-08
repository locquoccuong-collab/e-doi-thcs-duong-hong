import React from 'react';
import { Flag, Edit3, School, Users, CheckCircle, ShieldAlert, Mountain, UserCheck, Award, Info, AlertCircle, FolderTree, FolderOpen } from 'lucide-react';
import { AppState, DiemTruongType } from '../types';
import { CLASS_DEFINITIONS } from '../data/initialData';

import { AuthUser } from '../utils/authService';

interface ChiDoiViewProps {
  appState: AppState;
  onOpenEditChiDoi: (classKey: string) => void;
  onOpenHoSoChiDoi?: (classKey: string) => void;
  onOpenKhoHoSo?: () => void;
  currentUser?: AuthUser | null;
}

export const ChiDoiView: React.FC<ChiDoiViewProps> = ({
  appState,
  onOpenEditChiDoi,
  onOpenHoSoChiDoi,
  onOpenKhoHoSo,
  currentUser,
}) => {
  const tcClasses = CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Trường chính');
  const phClasses = CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Phân hiệu');

  let tongSiSoThucTe = 0;
  let tongDoiVien = 0;
  let tongThanhNien = 0;
  let tongChuaKetNap = 0;
  let soLopDaNhapSiSo = 0;
  let soLopDaCoGVCN = 0;

  CLASS_DEFINITIONS.forEach((c) => {
    const classObj = appState.classesData[c.key] || c;
    const classStudents = (appState.listHocSinh || []).filter((s) => s.lop === c.key);

    const siso =
      classObj.siso !== null && classObj.siso !== undefined
        ? Number(classObj.siso)
        : classStudents.length > 0
        ? classStudents.length
        : 0;

    const doiVien =
      classObj.soDoiVien !== null && classObj.soDoiVien !== undefined
        ? Number(classObj.soDoiVien)
        : classStudents.length > 0
        ? classStudents.filter((s) => s.isDoiVien).length
        : 0;

    const thanhNien =
      classObj.soThanhNien !== null && classObj.soThanhNien !== undefined
        ? Number(classObj.soThanhNien)
        : 0;

    const chuaKN = Math.max(0, siso - doiVien);

    if (classObj.siso && classObj.siso > 0) {
      soLopDaNhapSiSo++;
    }
    if (classObj.gvcn && classObj.gvcn.trim() !== '') {
      soLopDaCoGVCN++;
    }

    tongSiSoThucTe += siso;
    tongDoiVien += doiVien;
    tongThanhNien += thanhNien;
    tongChuaKetNap += chuaKN;
  });

  const tyLeDoiVienToanTruong =
    tongSiSoThucTe > 0 ? Math.round((tongDoiVien / tongSiSoThucTe) * 100) : 0;
  const tyLeThanhNienToanTruong =
    tongSiSoThucTe > 0 ? Math.round((tongThanhNien / tongSiSoThucTe) * 100) : 0;

  const renderClassCard = (c: typeof CLASS_DEFINITIONS[0]) => {
    const classObj = appState.classesData[c.key] || c;
    const classStudents = (appState.listHocSinh || []).filter((s) => s.lop === c.key);

    const siso =
      classObj.siso !== null && classObj.siso !== undefined
        ? Number(classObj.siso)
        : classStudents.length > 0
        ? classStudents.length
        : null;

    const doiVien =
      classObj.soDoiVien !== null && classObj.soDoiVien !== undefined
        ? Number(classObj.soDoiVien)
        : classStudents.length > 0
        ? classStudents.filter((s) => s.isDoiVien).length
        : null;

    const thanhNien =
      classObj.soThanhNien !== null && classObj.soThanhNien !== undefined
        ? Number(classObj.soThanhNien)
        : 0;

    const effectiveSiso = siso !== null ? siso : 0;
    const effectiveDoiVien = doiVien !== null ? doiVien : 0;
    const effectiveThanhNien = thanhNien !== null ? thanhNien : 0;

    // Formulas as requested:
    // Học sinh chưa kết nạp Đội = Sĩ số thực tế - Số lượng Đội viên
    // Tỷ lệ Đội viên = Đội viên / sĩ số thực tế × 100%
    // Tỷ lệ Thanh niên = Thanh niên / sĩ số thực tế × 100%
    const chuaKetNap = siso !== null && doiVien !== null ? Math.max(0, siso - doiVien) : null;
    const tyLeDoiVien = effectiveSiso > 0 ? Math.round((effectiveDoiVien / effectiveSiso) * 100) : 0;
    const tyLeThanhNien = effectiveSiso > 0 ? Math.round((effectiveThanhNien / effectiveSiso) * 100) : 0;

    return (
      <div
        key={c.key}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 hover:shadow-md hover:border-red-300 transition flex flex-col justify-between group"
      >
        <div>
          {/* Card Top Title & Campus */}
          <div className="flex justify-between items-start mb-2.5">
            <div>
              <span className="font-black text-base text-red-700 block leading-tight">{c.name}</span>
              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Khối {c.grade} • THCS Đường Hồng</span>
            </div>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                c.diemTruong === 'Trường chính'
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-blue-100 text-blue-900 border border-blue-200'
              }`}
            >
              {c.diemTruong}
            </span>
          </div>

          {/* Quick Metrics Bar on Card */}
          <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 text-center mb-3">
            <div className="p-1">
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Sĩ số</span>
              <span className="font-black text-slate-800 text-xs">
                {siso !== null ? siso : '--'}
              </span>
            </div>
            <div className="p-1 bg-red-50/80 rounded border border-red-100">
              <span className="text-[9px] font-bold text-red-700 block uppercase">Đội viên</span>
              <span className="font-black text-red-700 text-xs">
                {doiVien !== null ? doiVien : '--'}
              </span>
              {siso !== null && doiVien !== null && (
                <span className="text-[9px] text-red-600 font-extrabold block">
                  {tyLeDoiVien}%
                </span>
              )}
            </div>
            <div className="p-1 bg-blue-50/80 rounded border border-blue-100">
              <span className="text-[9px] font-bold text-blue-700 block uppercase">Thanh niên</span>
              <span className="font-black text-blue-700 text-xs">
                {thanhNien}
              </span>
              {siso !== null && effectiveSiso > 0 && (
                <span className="text-[9px] text-blue-600 font-extrabold block">
                  {tyLeThanhNien}%
                </span>
              )}
            </div>
          </div>

          {/* Detailed Info List */}
          <div className="space-y-1.5 text-xs text-slate-600 my-2">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400">GVCN:</span>
              <b className="text-slate-800 text-right truncate max-w-[150px]">
                {classObj.gvcn || <span className="text-amber-600 font-normal italic">Chưa cập nhật</span>}
              </b>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400">Chưa kết nạp Đội:</span>
              <span className="font-bold text-slate-700">
                {chuaKetNap !== null ? (
                  chuaKetNap > 0 ? (
                    <span className="text-amber-700 font-black">{chuaKetNap} em</span>
                  ) : (
                    <span className="text-emerald-700 font-bold">0 em (Đạt 100%)</span>
                  )
                ) : (
                  <span className="text-slate-400 italic">--</span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400">Chi đội trưởng:</span>
              <b className="text-slate-800 text-right truncate max-w-[140px]">
                {classObj.chiDoiTruong || <span className="text-slate-400 font-normal italic">Chưa bầu</span>}
              </b>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400">Chi đội phó:</span>
              <b className="text-slate-800 text-right truncate max-w-[140px]">
                {classObj.chiDoiPho || <span className="text-slate-400 font-normal italic">Chưa bầu</span>}
              </b>
            </div>

            {classObj.phongHoc && (
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-400">Phòng học:</span>
                <span className="text-slate-700 font-medium truncate max-w-[150px]">{classObj.phongHoc}</span>
              </div>
            )}

            {classObj.ghiChu && (
              <div className="py-1 text-[11px] text-slate-500 italic truncate" title={classObj.ghiChu}>
                Ghi chú: {classObj.ghiChu}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          <button
            onClick={() => onOpenEditChiDoi(c.key)}
            className="w-full bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs py-2 rounded-xl border border-slate-200 hover:border-red-300 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Cập nhật GVCN</span>
          </button>

          <button
            onClick={() => onOpenHoSoChiDoi && onOpenHoSoChiDoi(c.key)}
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-900 font-bold text-xs py-2 rounded-xl border border-emerald-200 hover:border-emerald-300 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
            title="Mở kho 8 thư mục hồ sơ điện tử của Chi đội này"
          >
            <FolderOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>Hồ sơ (8 thư mục)</span>
            {appState.listHoSoChiDoi && (
              <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {appState.listHoSoChiDoi.filter((i) => i.classKey === c.key).length}
              </span>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-700 font-extrabold uppercase tracking-wide">
            <Flag className="w-5 h-5 text-yellow-500" />
            <span>Cơ Cấu Tổ Chức Đội — 17 Chi Đội THCS Đường Hồng</span>
          </div>
          <h2 className="font-black text-xl text-slate-800 mt-1">
            Quản Lý Chi Đội, Sĩ Số Đội Viên & Thanh Niên
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý độc lập số lượng Đội viên và Thanh niên cho 17 Chi đội (8 Trường chính + 9 Phân hiệu), tính tỷ lệ kết nạp và học sinh chưa vào Đội.
          </p>
        </div>

        {onOpenKhoHoSo && (
          <button
            onClick={onOpenKhoHoSo}
            className="px-4 py-2.5 bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-800 hover:to-rose-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center space-x-2 cursor-pointer flex-shrink-0"
          >
            <FolderTree className="w-4 h-4 text-yellow-300" />
            <span>Kho Hồ Sơ 17 Chi Đội (8 Thư Mục)</span>
          </button>
        )}
      </div>

      {/* Stats summary KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Sĩ số thực tế toàn trường</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {tongSiSoThucTe}{' '}
            <span className="text-xs font-semibold text-slate-400">/ {appState.schoolConfig.projectedStudents} dự kiến</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {soLopDaNhapSiSo}/17 Chi đội đã cập nhật số liệu
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-red-700 uppercase">Tổng số Đội viên</div>
          <div className="text-2xl font-black text-red-700 mt-1">
            {tongDoiVien}{' '}
            <span className="text-xs font-extrabold text-red-600">({tyLeDoiVienToanTruong}%)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Tỷ lệ Đội viên trên tổng sĩ số thực tế
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase">Tổng số Thanh niên</div>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {tongThanhNien}{' '}
            <span className="text-xs font-extrabold text-blue-600">({tyLeThanhNienToanTruong}%)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Chỉ tiêu thanh niên độc lập (khối 9 & 14-15 tuổi)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase">Chưa kết nạp Đội</div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {tongChuaKetNap}{' '}
            <span className="text-xs font-semibold text-slate-400">em</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Công thức: Sĩ số thực tế - Số Đội viên
          </div>
        </div>
      </div>

      {/* Informative Note */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <b>Hướng dẫn nghiệp vụ TPT Đội:</b> Bấm vào nút <b>"Cập nhật GVCN / Sĩ số"</b> ở từng Chi đội để nhập trực tiếp sĩ số thực tế, số lượng Đội viên và Thanh niên. Các trường số liệu được lưu trữ độc lập, bền vững và tính toán tỷ lệ tự động ngay khi lưu.
        </div>
      </div>

      {/* Campus 1: Trường chính (8 classes) */}
      <div className="space-y-3">
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-xs">
          <span className="flex items-center space-x-2">
            <School className="w-4 h-4 text-yellow-400" />
            <span>Trường Chính — 8 Chi Đội (Khối 6, 7, 8, 9)</span>
          </span>
          <span className="text-[10px] bg-red-700 text-white px-2 py-0.5 rounded-full font-bold">
            8 Lớp
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tcClasses.map((c) => renderClassCard(c))}
        </div>
      </div>

      {/* Campus 2: Phân hiệu (9 classes) */}
      <div className="space-y-3 pt-2">
        <div className="bg-blue-900 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-xs">
          <span className="flex items-center space-x-2">
            <Mountain className="w-4 h-4 text-sky-300" />
            <span>Phân Hiệu (Vùng Cao) — 9 Chi Đội (Bao Gồm 8C, 9E)</span>
          </span>
          <span className="text-[10px] bg-sky-700 text-white px-2 py-0.5 rounded-full font-bold">
            9 Lớp
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {phClasses.map((c) => renderClassCard(c))}
        </div>
      </div>
    </div>
  );
};
