import React, { useState, useMemo } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Lock,
  Printer,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Unlock,
  UserCheck,
  Users,
  AlertTriangle,
  X,
  ChevronRight,
  School,
  Search,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  AppState,
  HocSinh,
  MucDanhGiaRenLuyen,
  TieuChiRenLuyenScores,
  DanhGiaThangDoiVien,
  KyTongKetRenLuyen,
  TongKetRenLuyenRecord,
  DiemTruongType,
} from '../types';
import { CLASS_DEFINITIONS } from '../data/initialData';
import { saveAppState } from '../utils/storage';
import { AuthUser } from '../utils/authService';

interface RenLuyenDoiVienViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  currentUser?: AuthUser | null;
}

const TIEU_CHI_CONFIG = [
  { key: 'daoDucTacPhong', label: '1. Đạo đức, tác phong', desc: 'Lễ phép, kính thầy yêu bạn, trung thực' },
  { key: 'hocTap', label: '2. Học tập', desc: 'Chăm chỉ, tích cực phát biểu, hoa điểm tốt' },
  { key: 'chuyenCan', label: '3. Chuyên cần', desc: 'Đi học đúng giờ, không nghỉ không phép' },
  { key: 'noiQuyKyLuat', label: '4. Chấp hành nội quy, kỷ luật', desc: 'Đồng phục, khăn quàng, trật tự truy bài' },
  { key: 'bacHoDay', label: '5. Thực hiện 5 điều Bác Hồ dạy', desc: 'Yêu Tổ quốc, yêu đồng bào, dũng cảm' },
  { key: 'hoatDongDoi', label: '6. Tham gia hoạt động Đội', desc: 'Nhiệt tình sinh hoạt, phong trào thiếu nhi' },
  { key: 'veSinhLaoDong', label: '7. Vệ sinh, lao động', desc: 'Trực nhật sạch sẽ, chăm sóc bồn hoa nội trú' },
  { key: 'doanKetGiupDo', label: '8. Tinh thần đoàn kết, giúp bạn', desc: 'Giúp bạn vượt khó, tương thân tương ái' },
] as const;

const MUC_OPTIONS: MucDanhGiaRenLuyen[] = ['Tốt', 'Khá', 'Đạt', 'Cần cố gắng'];

const SAMPLE_COMMENTS = [
  {
    uu: 'Ý thức tự giác cao, tích cực tham gia các phong trào Đội và giữ gìn nề nếp',
    han: 'Đôi lúc còn nói chuyện riêng trong giờ sinh hoạt',
    huong: 'Phát huy tinh thần tự quản và làm gương cho các bạn trong tổ',
  },
  {
    uu: 'Đạo đức tốt, chăm ngoan, kính trọng thầy cô, đoàn kết giúp đỡ bạn',
    han: 'Môn Toán còn chậm, cần rèn luyện thêm bài tập',
    huong: 'Tăng cường tự học bán trú và nhờ bạn kèm cặp',
  },
  {
    uu: 'Nhiệt tình với phong trào măng non, hoàn thành xuất sắc nhiệm vụ được giao',
    han: 'Không',
    huong: 'Tiếp tục rèn luyện để kết nạp Đoàn viên TNCS Hồ Chí Minh',
  },
  {
    uu: 'Chuyên cần tốt, ăn ở nội trú ngăn nắp, chấp hành nghiêm nội quy',
    han: 'Cần mạnh dạn hơn khi phát biểu xây dựng bài',
    huong: 'Tích cực tham gia các hoạt động tập thể của chi đội',
  },
];

const KY_CONFIG: {
  key: KyTongKetRenLuyen;
  name: string;
  months: number[];
  desc: string;
}[] = [
  { key: 'Giữa HK1', name: 'Giữa Học kỳ I', months: [9, 10], desc: 'Đánh giá Tháng 9 & Tháng 10' },
  { key: 'Cuối HK1', name: 'Cuối Học kỳ I', months: [9, 10, 11, 12, 1], desc: 'Tổng kết Tháng 9 đến Tháng 1' },
  { key: 'Giữa HK2', name: 'Giữa Học kỳ II', months: [2, 3], desc: 'Đánh giá Tháng 2 & Tháng 3' },
  { key: 'Cuối năm', name: 'Cuối năm học (Cả năm)', months: [9, 10, 11, 12, 1, 2, 3, 4, 5], desc: 'Tổng kết toàn diện 9 tháng học tập' },
];

export const RenLuyenDoiVienView: React.FC<RenLuyenDoiVienViewProps> = ({
  appState,
  setAppState,
  currentUser,
}) => {
  // Main Tab
  const [activeTab, setActiveTab] = useState<'monthly' | 'summary' | 'reports'>('monthly');

  // Initial class based on user scope
  const initialClassKey =
    currentUser?.assignedClass ||
    (currentUser?.scopeDiemTruong === 'Phân hiệu' ? '8C' : '9A');

  // Role Simulator
  const [userRole, setUserRole] = useState<'TPT' | 'GVCN'>(
    currentUser?.role === 'ADMIN' ? 'TPT' : 'GVCN'
  );
  const [assignedClass, setAssignedClass] = useState<string>(initialClassKey);

  // Filters for Monthly
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // default October
  const [selectedYear] = useState<string>('2026-2027');
  const [selectedClass, setSelectedClass] = useState<string>(initialClassKey);
  const [searchStudent, setSearchStudent] = useState<string>('');

  // Filters for Summary
  const [selectedKy, setSelectedKy] = useState<KyTongKetRenLuyen>('Giữa HK1');
  const [summaryClass, setSummaryClass] = useState<string>('9A');

  // Print & Report state
  const [reportType, setReportType] = useState<'individual' | 'class' | 'school'>('class');
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<string>('');
  const [reportKy, setReportKy] = useState<KyTongKetRenLuyen>('Giữa HK1');
  const [reportMonth, setReportMonth] = useState<number>(10);
  const [reportClass, setReportClass] = useState<string>('9A');

  // Quick edit modal / focus student
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Floating feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 4000);
  };

  // Effective class depending on role
  const effectiveClassMonthly = userRole === 'GVCN' ? assignedClass : selectedClass;
  const effectiveClassSummary = userRole === 'GVCN' ? assignedClass : summaryClass;

  // Students in class
  const classStudents = useMemo(() => {
    return appState.listHocSinh.filter((s) => s.lop === effectiveClassMonthly);
  }, [appState.listHocSinh, effectiveClassMonthly]);

  const summaryClassStudents = useMemo(() => {
    return appState.listHocSinh.filter((s) => s.lop === effectiveClassSummary);
  }, [appState.listHocSinh, effectiveClassSummary]);

  // Current records from state
  const renLuyenState = appState.renLuyenState || {
    danhGiaThang: {},
    tongKetKy: {},
    lockedKy: {},
  };

  // Helper: Get or initialize monthly record for student
  const getMonthlyRecord = (hs: HocSinh, month: number): DanhGiaThangDoiVien => {
    const key = `${selectedYear}_T${month}_${hs.id}`;
    if (renLuyenState.danhGiaThang[key]) {
      return renLuyenState.danhGiaThang[key];
    }
    // Default draft
    return {
      id: key,
      namHoc: selectedYear,
      thang: month,
      hocSinhId: hs.id,
      maHs: hs.maHs,
      hoTen: hs.hoTen,
      lop: hs.lop,
      diemTruong: hs.diemTruong,
      tieuChi: {
        daoDucTacPhong: 'Tốt',
        hocTap: 'Khá',
        chuyenCan: 'Tốt',
        noiQuyKyLuat: 'Tốt',
        bacHoDay: 'Tốt',
        hoatDongDoi: 'Tốt',
        veSinhLaoDong: 'Tốt',
        doanKetGiupDo: 'Tốt',
      },
      xepLoaiChung: 'Tốt',
      uuDiem: 'Chăm ngoan, chấp hành tốt nền nếp Đội',
      hanChe: 'Không',
      huongKhacPhuc: 'Tiếp tục phát huy',
      trangThai: 'Đang đánh giá',
      nguoiDanhGia: userRole === 'GVCN' ? `GVCN ${effectiveClassMonthly}` : `TPT ${appState.schoolConfig.tptName}`,
      ngayDanhGia: new Date().toLocaleDateString('vi-VN'),
    };
  };

  // Update a single monthly field
  const handleUpdateMonthlyRecord = (updated: DanhGiaThangDoiVien) => {
    setAppState((prev) => {
      const curRenLuyen = prev.renLuyenState || { danhGiaThang: {}, tongKetKy: {}, lockedKy: {} };
      const nextState: AppState = {
        ...prev,
        renLuyenState: {
          ...curRenLuyen,
          danhGiaThang: {
            ...curRenLuyen.danhGiaThang,
            [updated.id]: updated,
          },
        },
      };
      saveAppState(nextState);
      return nextState;
    });
  };

  // Batch action: Quick evaluate all students in current class to Tốt or Khá
  const handleBatchRateAll = (level: MucDanhGiaRenLuyen) => {
    const newRecords: Record<string, DanhGiaThangDoiVien> = {};
    classStudents.forEach((hs) => {
      const oldRec = getMonthlyRecord(hs, selectedMonth);
      const updated: DanhGiaThangDoiVien = {
        ...oldRec,
        tieuChi: {
          daoDucTacPhong: level,
          hocTap: level,
          chuyenCan: level,
          noiQuyKyLuat: level,
          bacHoDay: level,
          hoatDongDoi: level,
          veSinhLaoDong: level,
          doanKetGiupDo: level,
        },
        xepLoaiChung: level,
        trangThai: 'Đã hoàn thành',
        nguoiDanhGia: userRole === 'GVCN' ? `GVCN ${effectiveClassMonthly}` : `TPT ${appState.schoolConfig.tptName}`,
        ngayDanhGia: new Date().toLocaleDateString('vi-VN'),
      };
      newRecords[updated.id] = updated;
    });

    setAppState((prev) => {
      const curRenLuyen = prev.renLuyenState || { danhGiaThang: {}, tongKetKy: {}, lockedKy: {} };
      const nextState: AppState = {
        ...prev,
        renLuyenState: {
          ...curRenLuyen,
          danhGiaThang: {
            ...curRenLuyen.danhGiaThang,
            ...newRecords,
          },
        },
      };
      saveAppState(nextState);
      return nextState;
    });

    showToast(`Đã thiết lập nhanh toàn bộ học sinh chi đội ${effectiveClassMonthly} đạt mức "${level}"!`);
  };

  // Status transition for Monthly: Send to TPT or Approve
  const handleSetMonthStatus = (status: DanhGiaThangDoiVien['trangThai']) => {
    const newRecords: Record<string, DanhGiaThangDoiVien> = {};
    classStudents.forEach((hs) => {
      const rec = getMonthlyRecord(hs, selectedMonth);
      newRecords[rec.id] = {
        ...rec,
        trangThai: status,
        ...(status === 'Đã xác nhận'
          ? {
              nguoiXacNhan: `TPT ${appState.schoolConfig.tptName}`,
              ngayXacNhan: new Date().toLocaleDateString('vi-VN'),
            }
          : {}),
      };
    });

    setAppState((prev) => {
      const curRenLuyen = prev.renLuyenState || { danhGiaThang: {}, tongKetKy: {}, lockedKy: {} };
      const nextState: AppState = {
        ...prev,
        renLuyenState: {
          ...curRenLuyen,
          danhGiaThang: {
            ...curRenLuyen.danhGiaThang,
            ...newRecords,
          },
        },
      };
      saveAppState(nextState);
      return nextState;
    });

    showToast(
      status === 'Đã gửi'
        ? `Đã gửi bảng rèn luyện Tháng ${selectedMonth} của Chi đội ${effectiveClassMonthly} lên Ban Chỉ huy & TPT Đội!`
        : `TPT Đội đã phê duyệt & xác nhận bảng rèn luyện Tháng ${selectedMonth} của Chi đội ${effectiveClassMonthly}!`
    );
  };

  // Helper: Aggregate summary for a period
  const getSummaryRecord = (hs: HocSinh, ky: KyTongKetRenLuyen): TongKetRenLuyenRecord => {
    const key = `${selectedYear}_${ky}_${hs.id}`;
    if (renLuyenState.tongKetKy[key]) {
      return renLuyenState.tongKetKy[key];
    }

    const kyDef = KY_CONFIG.find((k) => k.key === ky) || KY_CONFIG[0];
    const targetMonths = kyDef.months;
    const included: number[] = [];
    const missing: number[] = [];
    const ratings: MucDanhGiaRenLuyen[] = [];

    targetMonths.forEach((m) => {
      const mKey = `${selectedYear}_T${m}_${hs.id}`;
      const mRec = renLuyenState.danhGiaThang[mKey];
      if (mRec && mRec.trangThai !== 'Đang đánh giá') {
        included.push(m);
        ratings.push(mRec.xepLoaiChung);
      } else {
        missing.push(m);
      }
    });

    // Auto-suggest rating based on available months
    let deXuat: MucDanhGiaRenLuyen = 'Tốt';
    if (ratings.length === 0) {
      deXuat = 'Đạt';
    } else {
      const totCount = ratings.filter((r) => r === 'Tốt').length;
      const canCoGang = ratings.filter((r) => r === 'Cần cố gắng').length;
      if (canCoGang > 0) {
        deXuat = 'Cần cố gắng';
      } else if (totCount >= Math.ceil(ratings.length * 0.7)) {
        deXuat = 'Tốt';
      } else {
        deXuat = 'Khá';
      }
    }

    return {
      id: key,
      namHoc: selectedYear,
      ky,
      hocSinhId: hs.id,
      maHs: hs.maHs,
      hoTen: hs.hoTen,
      lop: hs.lop,
      diemTruong: hs.diemTruong,
      thangIncluded: included,
      thangMissing: missing,
      xepLoaiDeXuat: deXuat,
      xepLoaiChinhThuc: deXuat,
      nhanXetChung:
        deXuat === 'Tốt'
          ? 'Ý thức rèn luyện vững vàng, thực hiện tốt 5 điều Bác Hồ dạy.'
          : 'Có nhiều tiến bộ trong học tập và sinh hoạt Đội.',
      khenThuongDeXuat: deXuat === 'Tốt' ? 'Đề nghị công nhận danh hiệu Cháu ngoan Bác Hồ' : undefined,
      trangThai: 'Đang tổng kết',
      nguoiCapNhat: userRole === 'GVCN' ? `GVCN ${effectiveClassSummary}` : `TPT ${appState.schoolConfig.tptName}`,
      ngayCapNhat: new Date().toLocaleDateString('vi-VN'),
    };
  };

  const handleUpdateSummaryRecord = (updated: TongKetRenLuyenRecord) => {
    setAppState((prev) => {
      const curRenLuyen = prev.renLuyenState || { danhGiaThang: {}, tongKetKy: {}, lockedKy: {} };
      const nextState: AppState = {
        ...prev,
        renLuyenState: {
          ...curRenLuyen,
          tongKetKy: {
            ...curRenLuyen.tongKetKy,
            [updated.id]: updated,
          },
        },
      };
      saveAppState(nextState);
      return nextState;
    });
  };

  // Lock or unlock summary
  const isKyLocked = Boolean(renLuyenState.lockedKy?.[`${selectedYear}_${selectedKy}_${effectiveClassSummary}`]);

  const toggleLockSummary = () => {
    if (userRole !== 'TPT') {
      showToast('Chỉ Tổng phụ trách Đội hoặc BGH mới có quyền khóa/mở khóa số liệu!');
      return;
    }
    const lockKey = `${selectedYear}_${selectedKy}_${effectiveClassSummary}`;
    const nextLocked = !isKyLocked;

    // Also update records' status to 'TPT đã khóa' or 'GV đã duyệt'
    const updatedSummary: Record<string, TongKetRenLuyenRecord> = {};
    summaryClassStudents.forEach((hs) => {
      const rec = getSummaryRecord(hs, selectedKy);
      updatedSummary[rec.id] = {
        ...rec,
        trangThai: nextLocked ? 'TPT đã khóa' : 'GV đã duyệt',
      };
    });

    setAppState((prev) => {
      const curRenLuyen = prev.renLuyenState || { danhGiaThang: {}, tongKetKy: {}, lockedKy: {} };
      const nextState: AppState = {
        ...prev,
        renLuyenState: {
          ...curRenLuyen,
          lockedKy: {
            ...(curRenLuyen.lockedKy || {}),
            [lockKey]: nextLocked,
          },
          tongKetKy: {
            ...curRenLuyen.tongKetKy,
            ...updatedSummary,
          },
        },
      };
      saveAppState(nextState);
      return nextState;
    });

    showToast(
      nextLocked
        ? `Đã khóa số liệu tổng kết ${selectedKy} Chi đội ${effectiveClassSummary}! Giáo viên không thể chỉnh sửa thêm.`
        : `Đã mở khóa số liệu tổng kết ${selectedKy} Chi đội ${effectiveClassSummary} để hiệu chỉnh.`
    );
  };

  // Print triggered
  const handlePrint = () => {
    window.print();
  };

  // Export Excel
  const handleExportExcelSummary = () => {
    const kyDef = KY_CONFIG.find((k) => k.key === reportKy) || KY_CONFIG[0];
    const studentsToExport = appState.listHocSinh.filter((s) => reportType === 'school' || s.lop === reportClass);

    const headers = [
      'STT',
      'Mã HS',
      'Họ và tên',
      'Giới tính',
      'Chi đội',
      'Điểm trường',
      'Đội viên',
      'Đoàn viên',
      `Số tháng đã đánh giá (${kyDef.months.length} tháng)`,
      'Xếp loại đề xuất',
      'Xếp loại chính thức',
      'Đề xuất khen thưởng',
      'Nhận xét chung',
    ];

    const dataRows = studentsToExport.map((hs, idx) => {
      const rec = getSummaryRecord(hs, reportKy);
      return [
        idx + 1,
        hs.maHs,
        hs.hoTen,
        hs.gioiTinh,
        hs.lop,
        hs.diemTruong,
        hs.isDoiVien ? 'Đội viên TNTP' : 'Chưa',
        hs.isDoanVien ? 'Đoàn viên TNCS' : 'Chưa',
        `${rec.thangIncluded.length}/${kyDef.months.length} (${rec.thangMissing.length === 0 ? 'Đủ' : 'Thiếu T' + rec.thangMissing.join(', T')})`,
        rec.xepLoaiDeXuat,
        rec.xepLoaiChinhThuc,
        rec.khenThuongDeXuat || '',
        rec.nhanXetChung || '',
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 22 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 30 },
      { wch: 40 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TongKetRenLuyen');
    XLSX.writeFile(
      wb,
      `Bang_Tong_Ket_Ren_Luyen_${reportKy.replace(/\s+/g, '_')}_${reportType === 'school' ? 'Toan_Lien_Doi' : reportClass}_2026_2027.xlsx`
    );
    showToast('Đã xuất thành công tệp Excel tổng kết rèn luyện!');
  };

  // Status computation for monthly
  const monthlyStatusCounts = useMemo(() => {
    let completed = 0;
    let pending = 0;
    let sent = 0;
    let approved = 0;

    classStudents.forEach((hs) => {
      const key = `${selectedYear}_T${selectedMonth}_${hs.id}`;
      const rec = renLuyenState.danhGiaThang[key];
      if (!rec || rec.trangThai === 'Đang đánh giá') {
        pending++;
      } else if (rec.trangThai === 'Đã hoàn thành') {
        completed++;
      } else if (rec.trangThai === 'Đã gửi') {
        sent++;
      } else if (rec.trangThai === 'Đã xác nhận') {
        approved++;
      }
    });

    return { completed, pending, sent, approved, total: classStudents.length };
  }, [classStudents, renLuyenState, selectedYear, selectedMonth]);

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* HEADER & ROLE SWITCHER BAR */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-white p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-red-950 font-black shadow-lg">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                HD 283 / HĐĐ TW
              </span>
              <span className="text-xs text-red-200">Năm học {appState.schoolConfig.schoolYear}</span>
            </div>
            <h1 className="text-xl font-black tracking-tight mt-0.5">
              PHÂN HỆ RÈN LUYỆN ĐỘI VIÊN & ĐOÀN VIÊN
            </h1>
            <p className="text-xs text-red-100">
              {appState.schoolConfig.schoolName} • Theo dõi 8 tiêu chí rèn luyện toàn diện 17 Chi đội
            </p>
          </div>
        </div>

        {/* ROLE SIMULATOR / SWITCHER */}
        <div className="bg-black/30 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-center space-x-2 text-xs">
          <span className="text-slate-300 font-bold px-2 flex items-center space-x-1.5">
            <UserCheck className="w-4 h-4 text-yellow-400" />
            <span>Vai trò:</span>
          </span>

          <button
            onClick={() => setUserRole('TPT')}
            className={`px-3 py-1.5 rounded-lg font-black transition cursor-pointer ${
              userRole === 'TPT'
                ? 'bg-yellow-400 text-red-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Tổng phụ trách / BGH (Toàn trường)
          </button>

          <button
            onClick={() => setUserRole('GVCN')}
            className={`px-3 py-1.5 rounded-lg font-black transition cursor-pointer flex items-center space-x-1.5 ${
              userRole === 'GVCN'
                ? 'bg-yellow-400 text-red-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>GV phụ trách Chi đội:</span>
            {userRole === 'GVCN' && (
              <select
                value={assignedClass}
                onChange={(e) => setAssignedClass(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="bg-red-950 text-white rounded px-2 py-0.5 text-xs font-bold border border-yellow-400/40"
              >
                {CLASS_DEFINITIONS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.name} ({c.diemTruong})
                  </option>
                ))}
              </select>
            )}
          </button>
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-2xs space-x-1 text-xs no-print">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-black flex items-center justify-center space-x-2 transition ${
            activeTab === 'monthly'
              ? 'bg-red-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>I. RÈN LUYỆN HẰNG THÁNG (9 THÁNG)</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-black flex items-center justify-center space-x-2 transition ${
            activeTab === 'summary'
              ? 'bg-red-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>II. TỔNG KẾT GIỮA KỲ & CUỐI NĂM</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-black flex items-center justify-center space-x-2 transition ${
            activeTab === 'reports'
              ? 'bg-red-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>III. BÁO CÁO, IN ẤN & XUẤT BIỂU MẪU</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: RÈN LUYỆN HẰNG THÁNG */}
      {/* ======================================================== */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-bold text-slate-600 flex items-center space-x-1.5">
                <Filter className="w-4 h-4 text-red-700" />
                <span>Thời gian:</span>
              </span>

              {/* Month selector */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 font-black text-red-700 focus:ring-2 focus:ring-red-600"
              >
                {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => (
                  <option key={m} value={m}>
                    Tháng {m} (Năm học {selectedYear})
                  </option>
                ))}
              </select>

              {/* Class selector */}
              <span className="font-bold text-slate-600 ml-2">Chi đội:</span>
              {userRole === 'TPT' ? (
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 font-bold focus:ring-2 focus:ring-red-600"
                >
                  <optgroup label="Trường chính (8 lớp)">
                    {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Trường chính').map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Phân hiệu (9 lớp)">
                    {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Phân hiệu').map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name} (Phân hiệu)
                      </option>
                    ))}
                  </optgroup>
                </select>
              ) : (
                <span className="px-3 py-1.5 bg-red-100 text-red-900 font-extrabold rounded-lg border border-red-300">
                  {CLASS_DEFINITIONS.find((c) => c.key === assignedClass)?.name} ({CLASS_DEFINITIONS.find((c) => c.key === assignedClass)?.diemTruong})
                </span>
              )}

              {/* Search */}
              <div className="relative min-w-[200px]">
                <input
                  type="text"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  placeholder="Tìm họ tên, mã HS..."
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-red-600"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* Quick Batch Tools */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleBatchRateAll('Tốt')}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1.5 rounded-lg transition flex items-center space-x-1 cursor-pointer"
                title="Đánh giá tất cả học sinh trong lớp đạt Tốt"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nhanh: Tất cả Đạt Tốt</span>
              </button>

              <button
                type="button"
                onClick={() => handleBatchRateAll('Khá')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-extrabold px-3 py-1.5 rounded-lg transition flex items-center space-x-1 cursor-pointer"
              >
                <span>Nhanh: Tất cả Khá</span>
              </button>

              {userRole === 'GVCN' ? (
                <button
                  type="button"
                  onClick={() => handleSetMonthStatus('Đã gửi')}
                  className="bg-red-700 hover:bg-red-800 text-white font-black px-3.5 py-1.5 rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Lên Tổng Phụ Trách</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetMonthStatus('Đã xác nhận')}
                  className="bg-red-800 hover:bg-red-900 text-yellow-300 font-black px-3.5 py-1.5 rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                  <span>TPT Duyệt & Khóa Tháng {selectedMonth}</span>
                </button>
              )}
            </div>
          </div>

          {/* Status summary banner */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <span className="font-extrabold text-slate-800">
                Chi đội {effectiveClassMonthly} • Tháng {selectedMonth}/2026:
              </span>
              <span className="text-slate-600">
                Sĩ số: <b className="text-slate-900">{monthlyStatusCounts.total}</b> em
              </span>
              <span className="text-emerald-700 font-bold">
                ● Đã đánh giá: {monthlyStatusCounts.completed + monthlyStatusCounts.sent + monthlyStatusCounts.approved}
              </span>
              <span className="text-amber-700 font-bold">
                ● Chưa xét: {monthlyStatusCounts.pending}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-500 font-medium">Trạng thái duyệt:</span>
              {monthlyStatusCounts.approved > 0 ? (
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-black">
                  ✓ TPT đã phê duyệt
                </span>
              ) : monthlyStatusCounts.sent > 0 ? (
                <span className="bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded font-black">
                  ➜ Đã gửi TPT chờ duyệt
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded font-bold">
                  Đang đánh giá
                </span>
              )}
            </div>
          </div>

          {/* Student Evaluation Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-extrabold">
                    <th className="p-3 w-10 text-center">STT</th>
                    <th className="p-3">Học sinh / Đội viên</th>
                    <th className="p-3 text-center">Đoàn - Đội</th>
                    <th className="p-3 text-center">8 Tiêu chí Đánh giá Tháng {selectedMonth}</th>
                    <th className="p-3 text-center w-28">Xếp loại Tháng</th>
                    <th className="p-3 w-56">Nhận xét & Minh chứng</th>
                    <th className="p-3 text-center w-20">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                        Chi đội {effectiveClassMonthly} chưa có học sinh nào. Thầy cô hãy vào mục "Học sinh & Đội viên" để thêm học sinh.
                      </td>
                    </tr>
                  ) : (
                    classStudents
                      .filter((hs) => {
                        if (!searchStudent.trim()) return true;
                        const q = searchStudent.toLowerCase();
                        return hs.hoTen.toLowerCase().includes(q) || hs.maHs.toLowerCase().includes(q);
                      })
                      .map((hs, idx) => {
                        const rec = getMonthlyRecord(hs, selectedMonth);
                        return (
                          <tr key={hs.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-3">
                              <div className="font-black text-slate-900 text-sm">{hs.hoTen}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {hs.maHs} • {hs.danToc} • {hs.gioiTinh}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                {hs.isDoiVien ? (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                                    Đội viên
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">
                                    Chưa vào Đội
                                  </span>
                                )}
                                {hs.isDoanVien && (
                                  <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-300">
                                    ★ Đoàn viên
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 8 Criteria Mini Grid */}
                            <td className="p-3">
                              <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                                {TIEU_CHI_CONFIG.map((tc) => {
                                  const currentVal = rec.tieuChi[tc.key as keyof TieuChiRenLuyenScores] || 'Tốt';
                                  return (
                                    <div
                                      key={tc.key}
                                      className="p-1.5 rounded-lg border bg-slate-50 flex flex-col justify-between"
                                      title={tc.desc}
                                    >
                                      <span className="font-bold text-slate-600 truncate">{tc.label}</span>
                                      <select
                                        value={currentVal}
                                        onChange={(e) => {
                                          const nextVal = e.target.value as MucDanhGiaRenLuyen;
                                          const updated: DanhGiaThangDoiVien = {
                                            ...rec,
                                            tieuChi: {
                                              ...rec.tieuChi,
                                              [tc.key]: nextVal,
                                            },
                                            trangThai: 'Đã hoàn thành',
                                          };
                                          handleUpdateMonthlyRecord(updated);
                                        }}
                                        className={`mt-1 font-black text-[10px] rounded px-1 py-0.5 border ${
                                          currentVal === 'Tốt'
                                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                            : currentVal === 'Khá'
                                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                                            : currentVal === 'Đạt'
                                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                                            : 'bg-red-100 text-red-900 border-red-300'
                                        }`}
                                      >
                                        {MUC_OPTIONS.map((m) => (
                                          <option key={m} value={m}>
                                            {m}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>

                            {/* Overall Month Rating */}
                            <td className="p-3 text-center">
                              <select
                                value={rec.xepLoaiChung}
                                onChange={(e) => {
                                  const nextVal = e.target.value as MucDanhGiaRenLuyen;
                                  handleUpdateMonthlyRecord({
                                    ...rec,
                                    xepLoaiChung: nextVal,
                                    trangThai: 'Đã hoàn thành',
                                  });
                                }}
                                className={`font-black text-xs px-2.5 py-1 rounded-lg border shadow-2xs ${
                                  rec.xepLoaiChung === 'Tốt'
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                                    : rec.xepLoaiChung === 'Khá'
                                    ? 'bg-blue-100 text-blue-900 border-blue-400'
                                    : rec.xepLoaiChung === 'Đạt'
                                    ? 'bg-amber-100 text-amber-900 border-amber-400'
                                    : 'bg-red-100 text-red-900 border-red-400'
                                }`}
                              >
                                {MUC_OPTIONS.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                              <div className="text-[10px] text-slate-400 mt-1">{rec.trangThai}</div>
                            </td>

                            {/* Comments and Evidence */}
                            <td className="p-3 text-[11px] space-y-1">
                              <div>
                                <span className="font-bold text-emerald-800">Ưu:</span>{' '}
                                <span className="text-slate-700">{rec.uuDiem || '--'}</span>
                              </div>
                              {rec.hanChe && rec.hanChe !== 'Không' && (
                                <div>
                                  <span className="font-bold text-amber-800">Hạn chế:</span>{' '}
                                  <span className="text-slate-600">{rec.hanChe}</span>
                                </div>
                              )}
                              {rec.minhChung && (
                                <div className="text-[10px] text-blue-700 italic">
                                  Minh chứng: {rec.minhChung}
                                </div>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => setEditingStudentId(hs.id)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 transition cursor-pointer"
                                title="Chỉnh sửa chi tiết nhận xét & minh chứng"
                              >
                                <Edit className="w-4 h-4" />
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
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TỔNG KẾT GIỮA KỲ & CUỐI NĂM */}
      {/* ======================================================== */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-bold text-slate-600 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-red-700" />
                <span>Kỳ tổng kết:</span>
              </span>

              <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
                {KY_CONFIG.map((k) => (
                  <button
                    key={k.key}
                    type="button"
                    onClick={() => setSelectedKy(k.key)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      selectedKy === k.key
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {k.name}
                  </button>
                ))}
              </div>

              {/* Class selector */}
              <span className="font-bold text-slate-600 ml-2">Chi đội:</span>
              {userRole === 'TPT' ? (
                <select
                  value={summaryClass}
                  onChange={(e) => setSummaryClass(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 font-bold focus:ring-2 focus:ring-red-600"
                >
                  <optgroup label="Trường chính (8 lớp)">
                    {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Trường chính').map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Phân hiệu (9 lớp)">
                    {CLASS_DEFINITIONS.filter((c) => c.diemTruong === 'Phân hiệu').map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name} (Phân hiệu)
                      </option>
                    ))}
                  </optgroup>
                </select>
              ) : (
                <span className="px-3 py-1.5 bg-red-100 text-red-900 font-extrabold rounded-lg border border-red-300">
                  {CLASS_DEFINITIONS.find((c) => c.key === assignedClass)?.name}
                </span>
              )}
            </div>

            {/* Lock / Unlock & Save Actions */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleLockSummary}
                className={`px-4 py-2 rounded-xl font-black flex items-center space-x-2 transition cursor-pointer shadow-sm ${
                  isKyLocked
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-red-700 hover:bg-red-800 text-white'
                }`}
                title={
                  isKyLocked
                    ? 'Dữ liệu đã khóa an toàn. Nhấn để mở khóa nếu cần sửa chữa.'
                    : 'Khóa số liệu kỳ này để chốt danh sách và ngăn sửa đổi.'
                }
              >
                {isKyLocked ? <Lock className="w-4 h-4 text-yellow-300" /> : <Unlock className="w-4 h-4" />}
                <span>{isKyLocked ? 'ĐÃ KHÓA SỐ LIỆU (TPT)' : 'KHÓA SỐ LIỆU KỲ NÀY'}</span>
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <b>Quy tắc tổng hợp tự động:</b> Hệ thống quét toàn bộ các tháng thuộc {selectedKy} (
                {KY_CONFIG.find((k) => k.key === selectedKy)?.desc}) và đề xuất xếp loại khách quan. Thầy cô có thể điều chỉnh và ghi rõ nhận xét chính thức trước khi TPT khóa sổ.
              </span>
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-extrabold">
                    <th className="p-3 w-10 text-center">STT</th>
                    <th className="p-3">Họ và Tên Học sinh</th>
                    <th className="p-3 text-center">Tổ chức</th>
                    <th className="p-3 text-center">Tiến độ Tháng Đã Đánh Giá</th>
                    <th className="p-3 text-center w-28">Đề xuất Tự động</th>
                    <th className="p-3 text-center w-32">Xếp loại Chính thức</th>
                    <th className="p-3">Nhận xét Chung & Đề xuất Khen thưởng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaryClassStudents.map((hs, idx) => {
                    const rec = getSummaryRecord(hs, selectedKy);
                    const kyDef = KY_CONFIG.find((k) => k.key === selectedKy) || KY_CONFIG[0];
                    const hasMissing = rec.thangMissing.length > 0;

                    return (
                      <tr key={hs.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-black text-slate-900 text-sm">{hs.hoTen}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {hs.maHs} • {hs.danToc}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {hs.isDoiVien && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Đội viên
                              </span>
                            )}
                            {hs.isDoanVien && (
                              <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                                Đoàn viên
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Months Progress */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {kyDef.months.map((m) => {
                              const isEvaluated = rec.thangIncluded.includes(m);
                              return (
                                <span
                                  key={m}
                                  className={`w-6 h-6 rounded-md font-bold text-[10px] flex items-center justify-center ${
                                    isEvaluated
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-red-100 text-red-700 border border-red-300'
                                  }`}
                                  title={isEvaluated ? `Tháng ${m}: Đã đánh giá` : `Tháng ${m}: Chưa có dữ liệu`}
                                >
                                  T{m}
                                </span>
                              );
                            })}
                          </div>
                          {hasMissing && (
                            <span className="text-[10px] text-red-600 font-bold mt-1 block">
                              ⚠ Thiếu Tháng {rec.thangMissing.join(', ')}
                            </span>
                          )}
                        </td>

                        {/* Proposed rating */}
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg font-black text-xs border ${
                              rec.xepLoaiDeXuat === 'Tốt'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : rec.xepLoaiDeXuat === 'Khá'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : rec.xepLoaiDeXuat === 'Đạt'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-red-50 text-red-800 border-red-300'
                            }`}
                          >
                            {rec.xepLoaiDeXuat}
                          </span>
                        </td>

                        {/* Official rating selector */}
                        <td className="p-3 text-center">
                          <select
                            disabled={isKyLocked}
                            value={rec.xepLoaiChinhThuc}
                            onChange={(e) => {
                              const nextVal = e.target.value as MucDanhGiaRenLuyen;
                              handleUpdateSummaryRecord({
                                ...rec,
                                xepLoaiChinhThuc: nextVal,
                              });
                            }}
                            className={`font-black text-xs px-2.5 py-1 rounded-lg border shadow-2xs ${
                              isKyLocked ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
                            } ${
                              rec.xepLoaiChinhThuc === 'Tốt'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                                : rec.xepLoaiChinhThuc === 'Khá'
                                ? 'bg-blue-100 text-blue-900 border-blue-400'
                                : rec.xepLoaiChinhThuc === 'Đạt'
                                ? 'bg-amber-100 text-amber-900 border-amber-400'
                                : 'bg-red-100 text-red-900 border-red-400'
                            }`}
                          >
                            {MUC_OPTIONS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Notes and Awards */}
                        <td className="p-3 space-y-1">
                          <input
                            type="text"
                            disabled={isKyLocked}
                            value={rec.nhanXetChung}
                            onChange={(e) => {
                              handleUpdateSummaryRecord({
                                ...rec,
                                nhanXetChung: e.target.value,
                              });
                            }}
                            placeholder="Nhận xét tổng hợp..."
                            className="w-full border border-slate-200 rounded p-1 text-[11px] bg-slate-50 focus:bg-white"
                          />
                          <input
                            type="text"
                            disabled={isKyLocked}
                            value={rec.khenThuongDeXuat || ''}
                            onChange={(e) => {
                              handleUpdateSummaryRecord({
                                ...rec,
                                khenThuongDeXuat: e.target.value,
                              });
                            }}
                            placeholder="Đề xuất khen thưởng (Cháu ngoan Bác Hồ, Cờ thi đua...)"
                            className="w-full border border-yellow-200 rounded p-1 text-[10px] bg-yellow-50/40 text-yellow-900 focus:bg-white"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: BÁO CÁO, IN ẤN & XUẤT BIỂU MẪU */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs no-print">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-slate-700 flex items-center space-x-1">
                <FileText className="w-4 h-4 text-red-700" />
                <span>Loại báo cáo / Biểu mẫu:</span>
              </span>

              <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
                <button
                  type="button"
                  onClick={() => setReportType('class')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    reportType === 'class' ? 'bg-red-700 text-white' : 'text-slate-600'
                  }`}
                >
                  Bảng tổng kết Chi đội
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('school')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    reportType === 'school' ? 'bg-red-700 text-white' : 'text-slate-600'
                  }`}
                >
                  Bảng toàn Liên đội (17 Chi đội)
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('individual')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    reportType === 'individual' ? 'bg-red-700 text-white' : 'text-slate-600'
                  }`}
                >
                  Phiếu rèn luyện Đội viên cá nhân
                </button>
              </div>

              {reportType !== 'school' && (
                <select
                  value={reportClass}
                  onChange={(e) => setReportClass(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 font-bold"
                >
                  {CLASS_DEFINITIONS.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name} ({c.diemTruong})
                    </option>
                  ))}
                </select>
              )}

              {reportType === 'individual' && (
                <select
                  value={selectedStudentForReport}
                  onChange={(e) => setSelectedStudentForReport(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 font-bold text-blue-900"
                >
                  <option value="">-- Chọn Đội viên --</option>
                  {appState.listHocSinh
                    .filter((s) => s.lop === reportClass)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.hoTen} ({s.maHs})
                      </option>
                    ))}
                </select>
              )}

              <select
                value={reportKy}
                onChange={(e) => setReportKy(e.target.value as KyTongKetRenLuyen)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 font-bold"
              >
                {KY_CONFIG.map((k) => (
                  <option key={k.key} value={k.key}>
                    {k.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Print & Export buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-slate-900 hover:bg-black text-white font-black px-4 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-yellow-400" />
                <span>In Bản Chuẩn A4 (Ctrl+P)</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcelSummary}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-black px-4 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Xuất Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* ================= PRINT PREVIEW CONTAINER (Formatted A4 paper) ================= */}
          <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-300 shadow-xl max-w-4xl mx-auto print:border-none print:p-0 print:shadow-none text-black">
            {/* National & Pioneer Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
              <div className="text-center font-bold text-xs uppercase leading-relaxed">
                <div>HỘI ĐỒNG ĐỘI HUYỆN BẮC MÊ</div>
                <div className="font-extrabold text-sm text-red-700">LIÊN ĐỘI THCS ĐƯỜNG HỒNG</div>
                <div className="text-[11px] font-normal normal-case italic">Số: ....../BC-RLĐV</div>
              </div>

              <div className="text-center text-xs font-bold leading-relaxed">
                <div className="uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="font-normal italic text-[11px]">Độc lập - Tự do - Hạnh phúc</div>
                <div className="font-normal italic text-[11px] mt-1">Đường Hồng, ngày ..... tháng ..... năm 2026</div>
              </div>
            </div>

            {/* Individual Report Card */}
            {reportType === 'individual' && (
              <div>
                {(() => {
                  const currentStudent =
                    appState.listHocSinh.find((s) => s.id === selectedStudentForReport) ||
                    appState.listHocSinh.find((s) => s.lop === reportClass) ||
                    appState.listHocSinh[0];

                  if (!currentStudent) {
                    return <div className="text-center text-slate-400 italic py-10">Vui lòng chọn đội viên để in phiếu.</div>;
                  }

                  const summaryRec = getSummaryRecord(currentStudent, reportKy);

                  return (
                    <div className="space-y-6">
                      <div className="text-center space-y-1">
                        <h2 className="text-lg font-black uppercase text-red-900">
                          PHIẾU THEO DÕI RÈN LUYỆN ĐỘI VIÊN & ĐOÀN VIÊN
                        </h2>
                        <div className="text-xs font-bold">KỲ TỔNG KẾT: {reportKy.toUpperCase()} • NĂM HỌC 2026 - 2027</div>
                      </div>

                      {/* Student info box */}
                      <div className="grid grid-cols-2 gap-4 border border-slate-300 p-4 rounded-xl text-xs bg-slate-50/50">
                        <div className="space-y-1.5">
                          <div>Họ và tên: <b className="text-sm font-black">{currentStudent.hoTen}</b></div>
                          <div>Mã số học sinh: <span className="font-mono font-bold">{currentStudent.maHs}</span></div>
                          <div>Ngày sinh: {currentStudent.ngaySinh} • Giới tính: {currentStudent.gioiTinh}</div>
                          <div>Dân tộc: <b>{currentStudent.danToc}</b></div>
                        </div>

                        <div className="space-y-1.5">
                          <div>Chi đội: <b className="text-red-700">{currentStudent.lop}</b> ({currentStudent.diemTruong})</div>
                          <div>
                            Tổ chức Đội: {currentStudent.isDoiVien ? `Đội viên TNTP (Kết nạp: ${currentStudent.ngayVaoDoi || '---'})` : 'Chưa kết nạp'}
                          </div>
                          <div>
                            Tổ chức Đoàn: {currentStudent.isDoanVien ? `Đoàn viên TNCS (Ngày vào: ${currentStudent.ngayVaoDoan || '---'}, Thẻ: ${currentStudent.soTheDoan || 'Chưa cấp'})` : 'Chưa kết nạp'}
                          </div>
                          <div>Chế độ: {currentStudent.isBanTru ? 'Học sinh Bán trú nội trú' : 'Học sinh đi về'}</div>
                        </div>
                      </div>

                      {/* 8 Criteria Evaluation table */}
                      <div>
                        <h3 className="font-bold text-xs uppercase mb-2">I. KẾT QUẢ ĐÁNH GIÁ 8 TIÊU CHÍ RÈN LUYỆN</h3>
                        <table className="w-full text-xs border border-slate-400 border-collapse">
                          <thead>
                            <tr className="bg-slate-100 font-bold">
                              <th className="border border-slate-400 p-2 text-center w-10">TT</th>
                              <th className="border border-slate-400 p-2">Tiêu chí rèn luyện</th>
                              <th className="border border-slate-400 p-2 text-center w-28">Mức đạt</th>
                              <th className="border border-slate-400 p-2">Nhận xét chi tiết</th>
                            </tr>
                          </thead>
                          <tbody>
                            {TIEU_CHI_CONFIG.map((tc, idx) => (
                              <tr key={tc.key}>
                                <td className="border border-slate-400 p-2 text-center font-bold">{idx + 1}</td>
                                <td className="border border-slate-400 p-2">
                                  <div className="font-bold">{tc.label}</div>
                                  <div className="text-[10px] text-slate-500 italic">{tc.desc}</div>
                                </td>
                                <td className="border border-slate-400 p-2 text-center font-black text-emerald-800">
                                  Tốt
                                </td>
                                <td className="border border-slate-400 p-2 text-[11px]">
                                  Thực hiện tự giác, gương mẫu trong học tập và sinh hoạt bán trú.
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary Outcome */}
                      <div className="border border-slate-300 p-4 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center font-bold text-sm">
                          <span>XẾP LOẠI CHUNG KỲ {reportKy.toUpperCase()}:</span>
                          <span className="text-red-700 text-base font-black uppercase">
                            {summaryRec.xepLoaiChinhThuc}
                          </span>
                        </div>
                        <div>
                          <b>Nhận xét của Giáo viên phụ trách:</b> {summaryRec.nhanXetChung}
                        </div>
                        {summaryRec.khenThuongDeXuat && (
                          <div className="text-amber-900 font-bold">
                            Đề xuất khen thưởng: {summaryRec.khenThuongDeXuat}
                          </div>
                        )}
                      </div>

                      {/* Signatures */}
                      <div className="grid grid-cols-2 gap-8 text-center pt-8 text-xs">
                        <div>
                          <div className="font-bold uppercase">GIÁO VIÊN PHỤ TRÁCH CHI ĐỘI</div>
                          <div className="italic text-[11px] text-slate-500">(Ký và ghi rõ họ tên)</div>
                          <div className="h-16"></div>
                          <div className="font-bold">{appState.classesData[reportClass]?.gvcn || 'GVCN Chi đội'}</div>
                        </div>

                        <div>
                          <div className="font-bold uppercase">TM. BAN THƯỜNG VỤ LIÊN ĐỘI</div>
                          <div className="font-bold text-[11px]">TỔNG PHỤ TRÁCH ĐỘI</div>
                          <div className="italic text-[11px] text-slate-500">(Ký và đóng dấu xác nhận)</div>
                          <div className="h-16"></div>
                          <div className="font-bold">{appState.schoolConfig.tptName}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Class Summary Table */}
            {reportType === 'class' && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="text-base font-black uppercase text-red-900">
                    BẢNG TỔNG HỢP KẾT QUẢ RÈN LUYỆN ĐỘI VIÊN & ĐOÀN VIÊN
                  </h2>
                  <div className="text-xs font-bold">
                    CHI ĐỘI: {CLASS_DEFINITIONS.find((c) => c.key === reportClass)?.name.toUpperCase()} (
                    {CLASS_DEFINITIONS.find((c) => c.key === reportClass)?.diemTruong}) • KỲ: {reportKy.toUpperCase()}
                  </div>
                </div>

                <table className="w-full text-xs border border-slate-400 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-[11px]">
                      <th className="border border-slate-400 p-2 text-center w-10">STT</th>
                      <th className="border border-slate-400 p-2">Mã HS</th>
                      <th className="border border-slate-400 p-2">Họ và tên</th>
                      <th className="border border-slate-400 p-2 text-center">Giới tính</th>
                      <th className="border border-slate-400 p-2 text-center">Đoàn/Đội</th>
                      <th className="border border-slate-400 p-2 text-center">Số tháng đánh giá</th>
                      <th className="border border-slate-400 p-2 text-center">Xếp loại chính thức</th>
                      <th className="border border-slate-400 p-2">Nhận xét</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appState.listHocSinh
                      .filter((s) => s.lop === reportClass)
                      .map((s, idx) => {
                        const rec = getSummaryRecord(s, reportKy);
                        return (
                          <tr key={s.id}>
                            <td className="border border-slate-400 p-2 text-center font-bold">{idx + 1}</td>
                            <td className="border border-slate-400 p-2 font-mono font-bold">{s.maHs}</td>
                            <td className="border border-slate-400 p-2 font-bold">{s.hoTen}</td>
                            <td className="border border-slate-400 p-2 text-center">{s.gioiTinh}</td>
                            <td className="border border-slate-400 p-2 text-center font-semibold">
                              {s.isDoanVien ? 'Đoàn viên' : s.isDoiVien ? 'Đội viên' : 'Học sinh'}
                            </td>
                            <td className="border border-slate-400 p-2 text-center">
                              {rec.thangIncluded.length} tháng
                            </td>
                            <td className="border border-slate-400 p-2 text-center font-black text-red-800">
                              {rec.xepLoaiChinhThuc}
                            </td>
                            <td className="border border-slate-400 p-2 text-[11px]">{rec.nhanXetChung}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 text-center pt-8 text-xs">
                  <div>
                    <div className="font-bold uppercase">GIÁO VIÊN PHỤ TRÁCH CHI ĐỘI</div>
                    <div className="h-16"></div>
                    <div className="font-bold">{appState.classesData[reportClass]?.gvcn || 'GVCN Chi đội'}</div>
                  </div>

                  <div>
                    <div className="font-bold uppercase">TỔNG PHỤ TRÁCH ĐỘI</div>
                    <div className="h-16"></div>
                    <div className="font-bold">{appState.schoolConfig.tptName}</div>
                  </div>
                </div>
              </div>
            )}

            {/* School Summary Table (17 Chi đội) */}
            {reportType === 'school' && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="text-base font-black uppercase text-red-900">
                    BẢNG TỔNG HỢP RÈN LUYỆN TOÀN LIÊN ĐỘI (17 CHI ĐỘI)
                  </h2>
                  <div className="text-xs font-bold">KỲ TỔNG KẾT: {reportKy.toUpperCase()} • NĂM HỌC 2026 - 2027</div>
                </div>

                <table className="w-full text-xs border border-slate-400 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-[11px]">
                      <th className="border border-slate-400 p-2 text-center w-10">STT</th>
                      <th className="border border-slate-400 p-2">Chi đội</th>
                      <th className="border border-slate-400 p-2">Điểm trường</th>
                      <th className="border border-slate-400 p-2 text-center">Sĩ số</th>
                      <th className="border border-slate-400 p-2 text-center">Đội viên</th>
                      <th className="border border-slate-400 p-2 text-center">Đoàn viên</th>
                      <th className="border border-slate-400 p-2 text-center">Mức Tốt</th>
                      <th className="border border-slate-400 p-2 text-center">Mức Khá</th>
                      <th className="border border-slate-400 p-2 text-center">Mức Đạt</th>
                      <th className="border border-slate-400 p-2 text-center">Tỷ lệ hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CLASS_DEFINITIONS.map((c, idx) => {
                      const cStudents = appState.listHocSinh.filter((s) => s.lop === c.key);
                      const doiVienCount = cStudents.filter((s) => s.isDoiVien).length;
                      const doanVienCount = cStudents.filter((s) => s.isDoanVien).length;
                      const totCount = cStudents.filter((s) => getSummaryRecord(s, reportKy).xepLoaiChinhThuc === 'Tốt').length;
                      const khaCount = cStudents.filter((s) => getSummaryRecord(s, reportKy).xepLoaiChinhThuc === 'Khá').length;
                      const datCount = cStudents.filter((s) => getSummaryRecord(s, reportKy).xepLoaiChinhThuc === 'Đạt').length;
                      const hoanThanhPct = cStudents.length > 0 ? Math.round(((totCount + khaCount + datCount) / cStudents.length) * 100) : 100;

                      return (
                        <tr key={c.key}>
                          <td className="border border-slate-400 p-2 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-400 p-2 font-black text-red-900">{c.name}</td>
                          <td className="border border-slate-400 p-2">{c.diemTruong}</td>
                          <td className="border border-slate-400 p-2 text-center font-bold">{cStudents.length}</td>
                          <td className="border border-slate-400 p-2 text-center">{doiVienCount}</td>
                          <td className="border border-slate-400 p-2 text-center font-black text-blue-900">
                            {doanVienCount > 0 ? doanVienCount : '--'}
                          </td>
                          <td className="border border-slate-400 p-2 text-center text-emerald-800 font-bold">{totCount}</td>
                          <td className="border border-slate-400 p-2 text-center text-blue-800 font-bold">{khaCount}</td>
                          <td className="border border-slate-400 p-2 text-center text-amber-800">{datCount}</td>
                          <td className="border border-slate-400 p-2 text-center font-black">{hoanThanhPct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 text-center pt-8 text-xs">
                  <div>
                    <div className="font-bold uppercase">BAN GIÁM HIỆU NHÀ TRƯỜNG</div>
                    <div className="h-16"></div>
                    <div className="font-bold">HIỆU TRƯỞNG</div>
                  </div>

                  <div>
                    <div className="font-bold uppercase">TỔNG PHỤ TRÁCH ĐỘI</div>
                    <div className="h-16"></div>
                    <div className="font-bold">{appState.schoolConfig.tptName}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT SINGLE STUDENT MONTHLY EVALUATION DETAILS */}
      {/* ======================================================== */}
      {editingStudentId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-up">
            {(() => {
              const hs = appState.listHocSinh.find((s) => s.id === editingStudentId);
              if (!hs) return null;
              const rec = getMonthlyRecord(hs, selectedMonth);

              return (
                <div>
                  <div className="bg-red-800 px-5 py-3.5 text-white flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-sm uppercase flex items-center space-x-2">
                        <Edit className="w-4 h-4 text-yellow-300" />
                        <span>Đánh giá chi tiết Tháng {selectedMonth}</span>
                      </h3>
                      <p className="text-[11px] text-red-200">
                        {hs.hoTen} ({hs.maHs}) • Chi đội {hs.lop}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingStudentId(null)}
                      className="p-1 hover:bg-white/20 rounded-lg text-white font-bold"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-5 space-y-3.5 text-xs">
                    {/* Copy sample comment quick buttons */}
                    <div>
                      <div className="font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                        <span>Sao chép mẫu nhận xét chuẩn Đội:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {SAMPLE_COMMENTS.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              handleUpdateMonthlyRecord({
                                ...rec,
                                uuDiem: s.uu,
                                hanChe: s.han,
                                huongKhacPhuc: s.huong,
                              });
                            }}
                            className="text-left p-2 rounded-lg border border-slate-200 hover:border-red-400 hover:bg-red-50/50 transition cursor-pointer text-[10px]"
                          >
                            <span className="font-bold text-red-800 block">Mẫu {i + 1}:</span>
                            <span className="text-slate-600 line-clamp-2">{s.uu}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Ưu điểm nổi bật trong tháng
                      </label>
                      <textarea
                        rows={2}
                        value={rec.uuDiem || ''}
                        onChange={(e) => {
                          handleUpdateMonthlyRecord({
                            ...rec,
                            uuDiem: e.target.value,
                          });
                        }}
                        placeholder="Nêu rõ ưu điểm về học tập, kỷ luật, tham gia phong trào..."
                        className="w-full border rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Hạn chế cần khắc phục
                      </label>
                      <input
                        type="text"
                        value={rec.hanChe || ''}
                        onChange={(e) => {
                          handleUpdateMonthlyRecord({
                            ...rec,
                            hanChe: e.target.value,
                          });
                        }}
                        placeholder="Ví dụ: Đi học muộn 1 lần, quên khăn quàng..."
                        className="w-full border rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Hướng khắc phục & Biện pháp
                      </label>
                      <input
                        type="text"
                        value={rec.huongKhacPhuc || ''}
                        onChange={(e) => {
                          handleUpdateMonthlyRecord({
                            ...rec,
                            huongKhacPhuc: e.target.value,
                          });
                        }}
                        placeholder="Ví dụ: Đội cờ đỏ nhắc nhở, bạn cùng phòng kèm cặp..."
                        className="w-full border rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Minh chứng hoạt động / Tuyên dương (nếu có)
                      </label>
                      <input
                        type="text"
                        value={rec.minhChung || ''}
                        onChange={(e) => {
                          handleUpdateMonthlyRecord({
                            ...rec,
                            minhChung: e.target.value,
                          });
                        }}
                        placeholder="Ví dụ: Đạt giải Nhất văn nghệ 20/11, Nhặt được của rơi..."
                        className="w-full border rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingStudentId(null)}
                      className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs"
                    >
                      Xong & Lưu Đánh Giá
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 text-xs font-bold flex items-center space-x-2 animate-bounce-subtle">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
