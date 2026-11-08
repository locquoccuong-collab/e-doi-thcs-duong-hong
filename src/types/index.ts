export type DiemTruongType = 'Trường chính' | 'Phân hiệu';

export interface ClassDefinition {
  key: string;
  name: string;
  grade: number;
  diemTruong: DiemTruongType;
}

export interface ClassData {
  key: string;
  name: string;
  grade: number;
  diemTruong: DiemTruongType;
  gvcn: string;
  siso: number | null;
  soDoiVien?: number | null;
  soThanhNien?: number | null;
  chiDoiTruong: string;
  chiDoiPho?: string;
  bchChiDoi?: string[]; // Danh sách 3 thành viên BCH Chi đội
  phongHoc?: string;
  ghiChu?: string;
}

export interface HocSinh {
  id: string;
  maHs: string;
  hoTen: string;
  gioiTinh: 'Nam' | 'Nữ';
  ngaySinh: string;
  danToc: string;
  lop: string;
  diemTruong: DiemTruongType;
  isDoiVien: boolean;
  ngayVaoDoi?: string;
  isBanTru: boolean;
  hoanThanhRenLuyen: 'Chưa xét' | 'Đang rèn luyện' | 'Hoàn thành' | 'Xuất sắc';
  isDoanVien?: boolean;
  ngayVaoDoan?: string;
  soTheDoan?: string;
  chiDoanSinhHoat?: string;
  ghiChu?: string;
}

export interface BchLienDoiMember {
  id: string;
  hoTen: string;
  lop: string;
  chucVu: string;
  nhiemKy: string;
  nhiemVu: string;
  ketQua: 'Chưa đánh giá' | 'Đang thực hiện' | 'Hoàn thành tốt' | 'Hoàn thành xuất sắc';
}

export interface ChiTieuCongTac {
  id: string;
  ten: string;
  mucTieu: string;
  hienTai: number;
  chiTieu: number;
  donVi: string;
  ghiChu: string;
}

export interface SuViec {
  id: number;
  tuan: number;
  hocKy: 'HK1' | 'HK2' | 'CA_NAM';
  lop: string;
  thoiGian: string; // ISO or formatted
  hocSinh: string;
  tieuChi: string;
  diem: number;
  moTa: string;
  nguoiGhi: string;
  diaDiem?: string;
}

export interface ThongBao {
  id: number;
  tieuDe: string;
  noiDung: string;
  mucDo: 'Thông thường' | 'KHẨN' | 'TỐI KHẨN';
  doiTuong: string;
  thoiGian: string;
  nguoiDang: string;
}

export interface CoDoItem {
  id: number;
  diemTruong: DiemTruongType;
  lop: string;
  hoTen: string;
  caTruc: string;
  gioTruc?: string;
  viTri: string;
  nhiemVu?: string;
  ghiChu: string;
}

export interface HoSoItem {
  id: number;
  tieuDe: string;
  noiDung: string;
  thoiGian: string;
  fileName?: string | null;
  fileData?: string | null; // Base64 data URL
  fileSize?: string;
  fileId?: string; // Key in IndexedDB
  keHoachId?: number; // Linked plan ID
  isFromKeHoach?: boolean;
}

export interface HoSoGroup {
  id: number;
  name: string;
  desc: string;
  items: HoSoItem[];
}

export type LoaiMinhChung =
  | 'Tệp kế hoạch chính'
  | 'Tài liệu minh chứng'
  | 'Hình ảnh hoạt động'
  | 'Biên bản'
  | 'Báo cáo kết quả'
  | 'Danh sách học sinh tham gia'
  | 'Tài liệu bổ sung';

export interface TaiLieuMinhChung {
  id: string;
  loai: LoaiMinhChung;
  tenTaiLieu: string;
  fileId: string; // Key in IndexedDB
  fileName: string;
  fileType: 'pdf' | 'docx' | 'image' | 'excel' | 'other';
  fileSize: string;
  ngayTao: string;
  ghiChu?: string;
  linkedHoSoGroupId?: number; // Linked to one of the 8 digital record groups
}

export interface KeHoachDetail {
  mucTieu?: string;
  diaDiem?: string;
  kinhPhiDuTru?: string;
  noiDungVanBan?: string; // Text content
  noiDungHtml?: string; // Renderable HTML (e.g. from Docx)
  mainFile?: {
    fileId: string;
    fileName: string;
    fileType: 'pdf' | 'docx' | 'other';
    fileSize: string;
    uploadDate: string;
  };
  minhChungList?: TaiLieuMinhChung[];
  linkedHoSoGroupIds?: number[]; // IDs of linked groups (1-8)
  ketQuaDanhGia?: {
    soLuongHsThamGia?: number;
    danhGiaChung?: string;
    xepLoai?: 'Xuất sắc' | 'Tốt' | 'Đạt yêu cầu' | 'Chưa đạt';
    ngayDanhGia?: string;
    nguoiDanhGia?: string;
    ghiChu?: string;
  };
  lichThucHienChiTiet?: {
    id: string;
    giaiDoan: string;
    thoiGian: string;
    noiDung: string;
    nguoiThucHien: string;
    daHoanThanh: boolean;
  }[];
}

export interface LichCongTac {
  id: number;
  loai:
    | 'Kế hoạch năm học'
    | 'Kế hoạch tháng'
    | 'Kế hoạch tuần'
    | 'Hoạt động theo chủ điểm'
    | 'Nhiệm vụ đột xuất'
    | 'Tuần'
    | 'Tháng'
    | 'Học kỳ I'
    | 'Học kỳ II';
  tieuDe: string;
  thoiGian: string;
  nguoiPhuTrach: string;
  trangThai: 'Chờ thực hiện' | 'Chưa thực hiện' | 'Đang thực hiện' | 'Hoàn thành';
  detail?: KeHoachDetail;
  linkedHoSoGroupIds?: number[];
  parentPlanId?: number;
}

export interface TieuChiItem {
  id: number;
  nhom: string;
  ten: string;
  diem: number;
}

export interface SchoolConfig {
  schoolName: string;
  location: string;
  schoolYear: string;
  tptName: string;
  projectedStudents: number;
  diemThresholds: {
    xuatSac: number;
    tot: number;
    kha: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  isVoice?: boolean;
}

export interface GeneratedVideo {
  id: string;
  prompt: string;
  url: string;
  aspectRatio: '16:9' | '9:16';
  timestamp: string;
}

export type MucDanhGiaRenLuyen = 'Tốt' | 'Khá' | 'Đạt' | 'Cần cố gắng';

export interface TieuChiRenLuyenScores {
  daoDucTacPhong: MucDanhGiaRenLuyen;
  hocTap: MucDanhGiaRenLuyen;
  chuyenCan: MucDanhGiaRenLuyen;
  noiQuyKyLuat: MucDanhGiaRenLuyen;
  bacHoDay: MucDanhGiaRenLuyen;
  hoatDongDoi: MucDanhGiaRenLuyen;
  veSinhLaoDong: MucDanhGiaRenLuyen;
  doanKetGiupDo: MucDanhGiaRenLuyen;
}

export interface DanhGiaThangDoiVien {
  id: string; // `${namHoc}_T${thang}_${hocSinhId}`
  namHoc: string;
  thang: number; // 9, 10, 11, 12, 1, 2, 3, 4, 5
  hocSinhId: string;
  maHs: string;
  hoTen: string;
  lop: string;
  diemTruong: DiemTruongType;
  tieuChi: TieuChiRenLuyenScores;
  xepLoaiChung: MucDanhGiaRenLuyen;
  uuDiem?: string;
  hanChe?: string;
  huongKhacPhuc?: string;
  minhChung?: string;
  trangThai: 'Đang đánh giá' | 'Đã hoàn thành' | 'Đã gửi' | 'Đã xác nhận';
  nguoiDanhGia: string;
  ngayDanhGia: string;
  nguoiXacNhan?: string;
  ngayXacNhan?: string;
}

export type KyTongKetRenLuyen = 'Giữa HK1' | 'Cuối HK1' | 'Giữa HK2' | 'Cuối năm';

export interface TongKetRenLuyenRecord {
  id: string; // `${namHoc}_${ky}_${hocSinhId}`
  namHoc: string;
  ky: KyTongKetRenLuyen;
  hocSinhId: string;
  maHs: string;
  hoTen: string;
  lop: string;
  diemTruong: DiemTruongType;
  thangIncluded: number[];
  thangMissing: number[];
  xepLoaiDeXuat: MucDanhGiaRenLuyen;
  xepLoaiChinhThuc: MucDanhGiaRenLuyen;
  nhanXetChung: string;
  khenThuongDeXuat?: string;
  trangThai: 'Đang tổng kết' | 'GV đã duyệt' | 'TPT đã khóa';
  nguoiCapNhat: string;
  ngayCapNhat: string;
}

export interface RenLuyenState {
  danhGiaThang: Record<string, DanhGiaThangDoiVien>;
  tongKetKy: Record<string, TongKetRenLuyenRecord>;
  lockedKy?: Record<string, boolean>; // key: `${namHoc}_${ky}_${lop}`
}

export type ThuMucChiDoiId =
  | '01_ke_hoach_nam_hoc'
  | '02_ke_hoach_thang'
  | '03_bao_cao_thang'
  | '04_bao_cao_giua_cuoi_ky'
  | '05_bao_cao_tong_ket_nam'
  | '06_bien_ban_dai_hoi_hop'
  | '07_minh_chung_hoat_dong'
  | '08_ho_so_khac';

export type TrangThaiHoSoChiDoi =
  | 'Chưa thực hiện'
  | 'Chưa gửi'
  | 'Đã gửi'
  | 'Đã cập nhật'
  | 'Đã kiểm tra'
  | 'Cần bổ sung';

export type NhanXetTptHoSo =
  | 'Hồ sơ đầy đủ'
  | 'Hồ sơ cần bổ sung'
  | 'Hồ sơ cần chỉnh sửa'
  | 'Nội dung cần hoàn thiện'
  | string;

export interface HoSoChiDoiVersion {
  version: number;
  fileId: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  note?: string;
}

export interface HoSoChiDoiItem {
  id: string; // e.g. `${classKey}_${thuMucId}_${Date.now()}`
  classKey: string; // e.g. '9A', '8C'
  thuMucId: ThuMucChiDoiId;
  tenHoSo: string;
  thoiGianThucHien: string; // e.g. "Tháng 10/2026", "Học kỳ 1"
  thangBaoCao?: number; // 9, 10, 11, 12, 1, 2, 3, 4, 5
  namHoc: string; // '2026-2027'
  gvGui: string;
  thoiGianGui: string;
  fileId: string; // Key in IndexedDB
  fileName: string;
  fileSize: string;
  fileType: 'doc' | 'docx' | 'xls' | 'xlsx' | 'pdf' | 'jpg' | 'jpeg' | 'png' | 'other';
  trangThai: TrangThaiHoSoChiDoi;
  nhanXetTpt?: NhanXetTptHoSo;
  ngayKiemTra?: string;
  nguoiKiemTra?: string;
  ghiChu?: string;
  version: number;
  history?: HoSoChiDoiVersion[];
}

export interface AppState {
  schoolConfig: SchoolConfig;
  classesData: Record<string, ClassData>;
  listHocSinh: HocSinh[];
  listBchLienDoi: BchLienDoiMember[];
  listChiTieu: ChiTieuCongTac[];
  weeklyScores: Record<string, number>; // key: `${year}_${hk}_W${week}_${classKey}`
  listSuViec: SuViec[];
  listThongBao: ThongBao[];
  listCoDo: CoDoItem[];
  listLichCongTac: LichCongTac[];
  listTieuChi: TieuChiItem[];
  hoSoGroups: HoSoGroup[];
  renLuyenState?: RenLuyenState;
  listHoSoChiDoi?: HoSoChiDoiItem[];
  lastSyncedAt?: string;
  lastSyncedBy?: string;
}

export interface BackupMetadata {
  appName: string;
  version: string;
  exportTimestamp: string;
  schoolYear: string;
  counts: {
    hocSinh: number;
    doiVien: number;
    doanVien: number;
    chiDoi: number;
    bchLienDoi: number;
    lichCongTac: number;
    hoSoChiDoi: number;
    suViec: number;
    thongBao: number;
  };
  integrityCheck: boolean;
}

export interface FullBackupData {
  metadata: BackupMetadata;
  appState: AppState;
}

export type SyncStatus = 'connected' | 'syncing' | 'synced' | 'disconnected' | 'error';

export type TabKey =
  | 'ban-lam-viec'
  | 'quan-ly-hoc-sinh'
  | 'ren-luyen-doi-vien'
  | 'bch-lien-doi'
  | 'tro-ly-ai'
  | 'thong-bao'
  | 'su-viec'
  | 'guong-tot'
  | 'bao-cao-zalo'
  | 'thi-dua-tuan'
  | 'thi-dua-khen-thuong'
  | 'cau-hinh-tieu-chi'
  | 'chi-doi'
  | 'kho-ho-so-chi-doi'
  | 'doi-co-do'
  | 'ho-so-so-hoa'
  | 'lich-cong-tac'
  | 'cau-hinh-don-vi'
  | 'quan-tri-du-lieu'
  | 'quan-ly-tai-khoan';


