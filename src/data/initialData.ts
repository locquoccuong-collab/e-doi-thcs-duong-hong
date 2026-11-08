import { ClassDefinition, HoSoGroup, TieuChiItem, AppState, LichCongTac, ThongBao, CoDoItem, SuViec, HocSinh, BchLienDoiMember, ChiTieuCongTac, RenLuyenState, HoSoChiDoiItem, ThuMucChiDoiId } from '../types';

export const CLASS_DEFINITIONS: ClassDefinition[] = [
  // Trường chính: 8 lớp
  { key: '6A', name: 'Chi đội 6A', grade: 6, diemTruong: 'Trường chính' },
  { key: '6B', name: 'Chi đội 6B', grade: 6, diemTruong: 'Trường chính' },
  { key: '7A', name: 'Chi đội 7A', grade: 7, diemTruong: 'Trường chính' },
  { key: '7B', name: 'Chi đội 7B', grade: 7, diemTruong: 'Trường chính' },
  { key: '8A', name: 'Chi đội 8A', grade: 8, diemTruong: 'Trường chính' },
  { key: '8B', name: 'Chi đội 8B', grade: 8, diemTruong: 'Trường chính' },
  { key: '9A', name: 'Chi đội 9A', grade: 9, diemTruong: 'Trường chính' },
  { key: '9B', name: 'Chi đội 9B', grade: 9, diemTruong: 'Trường chính' },

  // Phân hiệu: 9 lớp (8C nằm tại Phân hiệu)
  { key: '6C', name: 'Chi đội 6C', grade: 6, diemTruong: 'Phân hiệu' },
  { key: '6D', name: 'Chi đội 6D', grade: 6, diemTruong: 'Phân hiệu' },
  { key: '7C', name: 'Chi đội 7C', grade: 7, diemTruong: 'Phân hiệu' },
  { key: '7D', name: 'Chi đội 7D', grade: 7, diemTruong: 'Phân hiệu' },
  { key: '8C', name: 'Chi đội 8C', grade: 8, diemTruong: 'Phân hiệu' },
  { key: '8D', name: 'Chi đội 8D', grade: 8, diemTruong: 'Phân hiệu' },
  { key: '9C', name: 'Chi đội 9C', grade: 9, diemTruong: 'Phân hiệu' },
  { key: '9D', name: 'Chi đội 9D', grade: 9, diemTruong: 'Phân hiệu' },
  { key: '9E', name: 'Chi đội 9E', grade: 9, diemTruong: 'Phân hiệu' },
];

export const DEFAULT_HO_SO_GROUPS: HoSoGroup[] = [
  {
    id: 1,
    name: '1. Hồ sơ tổ chức Liên đội, BCH & Phân công nhiệm vụ',
    desc: 'Quyết định thành lập BCH Liên đội, quy chế làm việc, phân công nhiệm vụ TPT và BCH Liên đội nhiệm kỳ 2026-2027.',
    items: [
      {
        id: 101,
        tieuDe: 'Quyết định công nhận Ban Chỉ huy Liên đội năm học 2026-2027',
        noiDung: 'Kiện toàn 15 em đội viên ưu tú vào Ban Chỉ huy Liên đội Trường PTDTBT THCS Đường Hồng.',
        thoiGian: '08:30 ngày 15/09/2026',
        fileName: 'QD_KienToan_BCH_LienDoi_2026_2027.pdf',
        fileSize: '1.2 MB'
      }
    ]
  },
  {
    id: 2,
    name: '2. Hồ sơ Chi đội & Danh sách Thành viên (17 Chi đội)',
    desc: 'Tự động đồng bộ 17 Chi đội toàn trường; danh sách học sinh, ban chỉ huy từng chi đội, sổ theo dõi đội viên.',
    items: [
      {
        id: 201,
        tieuDe: 'Biên bản Đại hội Chi đội đầu năm - 17 Chi đội',
        noiDung: 'Tổng hợp biên bản đại hội chi đội nhiệm kỳ 2026-2027 của 8 lớp Trường chính và 9 lớp Phân hiệu.',
        thoiGian: '14:00 ngày 22/09/2026',
        fileName: 'TongHop_BienBan_DaiHoiChiDoi.docx',
        fileSize: '850 KB'
      }
    ]
  },
  {
    id: 3,
    name: '3. Kế hoạch, chương trình công tác & Báo cáo',
    desc: 'Chương trình công tác năm học theo chủ đề HĐĐ TW; kế hoạch tháng, tuần, báo cáo sơ kết và tổng kết Đội.',
    items: [
      {
        id: 301,
        tieuDe: 'Chương trình công tác Đội và phong trào thiếu nhi năm học 2026-2027',
        noiDung: 'Kế hoạch trọng tâm chủ đề năm học mới, triển khai phong trào "Thiếu nhi Tuyên Quang thi đua làm theo 5 điều Bác Hồ dạy".',
        thoiGian: '09:00 ngày 05/09/2026',
        fileName: 'KeHoach_CongTacDoi_2026_2027.pdf',
        fileSize: '2.4 MB'
      }
    ]
  },
  {
    id: 4,
    name: '4. Rèn luyện đội viên, Kết nạp, Trưởng thành & Sinh hoạt',
    desc: 'Chương trình Rèn luyện đội viên THCS, hồ sơ kết nạp Đội mới, lễ trưởng thành Đội khối 9, giấy giới thiệu Đoàn.',
    items: [
      {
        id: 401,
        tieuDe: 'Danh sách xét kết nạp Đội viên đợt 1 (chào mừng 20/11)',
        noiDung: 'Rà soát các em học sinh khối 6 có ý thức phấn đấu tốt để tổ chức kết nạp Đội.',
        thoiGian: '15:20 ngày 10/10/2026',
        fileName: 'DanhSach_XetKetNap_Dot1.xlsx',
        fileSize: '320 KB'
      }
    ]
  },
  {
    id: 5,
    name: '5. Nguồn lực, Chiến dịch / Kế hoạch nhỏ được theo dõi',
    desc: 'Sổ theo dõi phong trào Kế hoạch nhỏ, quyên góp áo ấm mùa đông, sách vở tặng học sinh bán trú vùng sâu.',
    items: [
      {
        id: 501,
        tieuDe: 'Kế hoạch phát động phong trào "Kế hoạch nhỏ" đợt 1',
        noiDung: 'Thu gom giấy vụn, vỏ lon gây quỹ đàn gà khăn quàng đỏ giúp bạn vượt khó.',
        thoiGian: '16:00 ngày 18/10/2026',
        fileName: 'KeHoachNho_Dot1_2026.pdf',
        fileSize: '650 KB'
      }
    ]
  },
  {
    id: 6,
    name: '6. Phân công & Theo dõi hoạt động Đội Cờ đỏ',
    desc: 'Lịch trực, sổ nhật ký chấm thi đua hàng ngày của Đội cờ đỏ tại cổng trường, sân cờ và khu bán trú.',
    items: [
      {
        id: 601,
        tieuDe: 'Quy chế chấm điểm và trực cờ đỏ năm học 2026-2027',
        noiDung: 'Quy định các khung giờ trực, vị trí trực tại Trường chính và Phân hiệu, cách ghi sổ trung thực, công tâm.',
        thoiGian: '08:00 ngày 08/09/2026',
        fileName: 'QuyChe_DoiCoDo_2026.docx',
        fileSize: '410 KB'
      }
    ]
  },
  {
    id: 7,
    name: '7. Biên bản, Nghị quyết, Đại hội & Tư liệu truyền thống',
    desc: 'Nghị quyết Đại hội Liên đội, biên bản kiểm tra nền nếp, tư liệu ảnh lịch sử Liên đội THCS Đường Hồng.',
    items: [
      {
        id: 701,
        tieuDe: 'Nghị quyết Đại hội Liên đội nhiệm kỳ 2026-2027',
        noiDung: 'Các chỉ tiêu phấn đấu thi đua: 100% Chi đội đạt Vững mạnh, 100% đội viên hoàn thành chương trình rèn luyện.',
        thoiGian: '11:00 ngày 28/09/2026',
        fileName: 'NghiQuyet_DaiHoiLienDoi_2026.pdf',
        fileSize: '1.8 MB'
      }
    ]
  },
  {
    id: 8,
    name: '8. Thi đua, Khen thưởng & Tổng hợp kết quả các tuần',
    desc: 'Bảng tổng hợp điểm thi đua hàng tuần, tháng, học kỳ; danh sách khen thưởng các chi đội xuất sắc nhận cờ luân lưu.',
    items: [
      {
        id: 801,
        tieuDe: 'Bảng tổng hợp thi đua tháng 9/2026',
        noiDung: 'Biên bản xét khen thưởng tháng 9, chi đội 9A và 8C dẫn đầu 2 điểm trường.',
        thoiGian: '17:00 ngày 30/09/2026',
        fileName: 'TongHop_ThiDua_Thang9.xlsx',
        fileSize: '480 KB'
      }
    ]
  }
];

export const DEFAULT_TIEU_CHI: TieuChiItem[] = [
  { id: 1, nhom: 'Chuyên cần', ten: 'Học sinh đi muộn / Vắng học không phép', diem: -2 },
  { id: 2, nhom: 'Tác phong', ten: 'Không đeo khăn quàng / Sai quy định trang phục', diem: -2 },
  { id: 3, nhom: 'Vệ sinh', ten: 'Vệ sinh lớp học / Khu nội trú chưa sạch sẽ', diem: -3 },
  { id: 4, nhom: 'Kỷ luật', ten: 'Mất trật tự giờ truy bài 15 phút hoặc trong tiết học', diem: -2 },
  { id: 5, nhom: 'Học tập', ten: 'Tiết học không tốt trong sổ đầu bài / xếp loại C, D', diem: -2 },
  { id: 6, nhom: 'Bán trú', ten: 'Vi phạm quy định giờ giấc ăn ở, ngủ nghỉ khu bán trú', diem: -3 },
  { id: 7, nhom: 'Tuyên dương', ten: 'Nhặt được của rơi trả lại người mất', diem: 5 },
  { id: 8, nhom: 'Tuyên dương', ten: 'Gương sáng vượt khó, tích cực giúp bạn tiến bộ', diem: 5 },
  { id: 9, nhom: 'Phong trào', ten: 'Tham gia xuất sắc các hoạt động Đội / Văn thể mỹ', diem: 5 },
  { id: 10, nhom: 'Học tập', ten: 'Đạt hoa điểm tốt / Điểm 10 xuất sắc trong tuần', diem: 2 },
];

export const INITIAL_THONG_BAO: ThongBao[] = [
  {
    id: 1,
    tieuDe: 'Kế hoạch kiểm tra nền nếp chuyên cần và khu bán trú Tuần 8',
    noiDung: 'Đề nghị GVCN 17 Chi đội nhắc nhở học sinh đeo khăn quàng đầy đủ, xếp chăn màn nội trú đúng quy cách trước 7h00 sáng.',
    mucDo: 'KHẨN',
    doiTuong: 'Toàn trường (17 Chi đội)',
    thoiGian: '07:15 ngày 26/10/2026',
    nguoiDang: 'TPT Lộc Quốc Cường'
  },
  {
    id: 2,
    tieuDe: 'Phát động chặng thi đua cao điểm chào mừng ngày Nhà giáo Việt Nam 20/11',
    noiDung: 'Mỗi Chi đội đăng ký ít nhất 01 công trình măng non hoặc tiết mục văn nghệ truyền thống bản sắc dân tộc vùng cao.',
    mucDo: 'Thông thường',
    doiTuong: 'Toàn trường (17 Chi đội)',
    thoiGian: '14:30 ngày 24/10/2026',
    nguoiDang: 'BCH Liên Đội'
  }
];

export const INITIAL_CO_DO: CoDoItem[] = [
  {
    id: 1,
    diemTruong: 'Trường chính',
    lop: '9A',
    hoTen: 'Hoàng Văn Thắng',
    caTruc: 'Đầu giờ sáng (7h00 - 7h30)',
    viTri: 'Cổng trường chính & Cầu thang tầng 1',
    ghiChu: 'Theo dõi khăn quàng, tác phong đi học đúng giờ'
  },
  {
    id: 2,
    diemTruong: 'Trường chính',
    lop: '8A',
    hoTen: 'Ma Thị Lan',
    caTruc: 'Giờ ra chơi sáng & Truy bài',
    viTri: 'Sân cờ & Dãy lớp học Trường chính',
    ghiChu: 'Giám sát trật tự truy bài 15 phút đầu giờ'
  },
  {
    id: 3,
    diemTruong: 'Phân hiệu',
    lop: '9C',
    hoTen: 'Lý A Sùng',
    caTruc: 'Đầu giờ sáng (7h00 - 7h30)',
    viTri: 'Cổng Phân hiệu & Sân trường',
    ghiChu: 'Kiểm tra sĩ số đầu giờ cùng GVCN'
  },
  {
    id: 4,
    diemTruong: 'Phân hiệu',
    lop: '8C',
    hoTen: 'Đặng Mùi Mấy',
    caTruc: 'Giờ tan học / Khu bán trú',
    viTri: 'Khu nội trú & Nhà ăn Phân hiệu',
    ghiChu: 'Kiểm tra vệ sinh phòng ở và giờ cơm bán trú'
  }
];

export const INITIAL_LICH_CONG_TAC: LichCongTac[] = [
  {
    id: 1,
    loai: 'Kế hoạch năm học',
    tieuDe: 'Kế hoạch công tác Đội & Phong trào Thiếu nhi Liên đội năm học 2026-2027',
    thoiGian: 'Cả năm học 2026-2027',
    nguoiPhuTrach: 'TPT Lộc Quốc Cường & BGH',
    trangThai: 'Đang thực hiện',
    linkedHoSoGroupIds: [1, 3, 5, 8],
    detail: {
      mucTieu: 'Triển khai toàn diện 5 chương trình công tác Đội trọng tâm năm học 2026-2027, nâng cao chất lượng nề nếp bán trú, chuyên cần và tỷ lệ đội viên hoàn thành chương trình rèn luyện tại 2 điểm trường.',
      diaDiem: 'Toàn trường (Trường chính & Phân hiệu)',
      kinhPhiDuTru: 'Theo dự toán ngân sách Đội được BGH phê duyệt',
      noiDungVanBan: 'KẾ HOẠCH NĂM HỌC 2026 - 2027\nLIÊN ĐỘI TRƯỜNG PHỔ THÔNG DÂN TỘC BÁN TRÚ THCS ĐƯỜNG HỒNG\n\nChủ đề năm học: "Thiếu nhi Bắc Mê - Vâng lời Bác dạy - Tự hào truyền thống - Vững bước tương lai".\n\nI. CÁC CHỈ TIÊU CƠ BẢN\n1. 100% Chi đội (17/17 lớp) tổ chức tốt các hoạt động sinh hoạt Đội theo chủ điểm.\n2. 100% học sinh bán trú thực hiện nghiêm giờ giấc ăn nghỉ, xếp chăn màn nội trú đúng quy cách.\n3. Kết nạp 100% học sinh đủ điều kiện vào Đội TNTP Hồ Chí Minh.\n4. Đảm bảo 100% học sinh không vi phạm an toàn giao thông và bạo lực học đường.',
      linkedHoSoGroupIds: [1, 3, 5, 8],
      lichThucHienChiTiet: [
        {
          id: 'ms-1-1',
          giaiDoan: 'Bước 1',
          thoiGian: 'Tháng 9/2026',
          noiDung: 'Tổ chức Đại hội Liên đội nhiệm kỳ 2026-2027 và kiện toàn 17 BCH Chi đội',
          nguoiThucHien: 'TPT Lộc Quốc Cường',
          daHoanThanh: true,
        },
        {
          id: 'ms-1-2',
          giaiDoan: 'Bước 2',
          thoiGian: 'Tháng 10 - 11/2026',
          noiDung: 'Phát động chặng thi đua cao điểm chào mừng Ngày Nhà giáo Việt Nam 20/11',
          nguoiThucHien: 'BCH Liên đội & 17 GVCN',
          daHoanThanh: true,
        },
        {
          id: 'ms-1-3',
          giaiDoan: 'Bước 3',
          thoiGian: 'Tháng 1/2027',
          noiDung: 'Sơ kết công tác Đội Học kỳ 1 và tuyên dương các Chi đội xuất sắc',
          nguoiThucHien: 'BGH & TPT Đội',
          daHoanThanh: false,
        },
      ],
      minhChungList: [
        {
          id: 'mc-init-1',
          loai: 'Tài liệu minh chứng',
          tenTaiLieu: 'Nghị quyết Đại hội Liên đội năm học 2026-2027',
          fileId: 'file_init_nghiquyet',
          fileName: 'Nghi_Quyet_Dai_Hoi_Lien_Doi_2026_2027.pdf',
          fileType: 'pdf',
          fileSize: '420 KB',
          ngayTao: '28/09/2026',
          ghiChu: 'Biên bản biểu quyết 100% đại biểu thông qua chỉ tiêu',
          linkedHoSoGroupId: 1,
        },
        {
          id: 'mc-init-2',
          loai: 'Hình ảnh hoạt động',
          tenTaiLieu: 'Ảnh Đại hội Liên đội tại Hội trường Trường chính',
          fileId: 'file_init_anhdaihoi',
          fileName: 'Anh_Dai_Hoi_Lien_Doi_2026.jpg',
          fileType: 'image',
          fileSize: '1.2 MB',
          ngayTao: '28/09/2026',
          ghiChu: 'Toàn cảnh đại hội và nghi thức chào cờ',
          linkedHoSoGroupId: 3,
        },
      ],
    },
  },
  {
    id: 2,
    loai: 'Kế hoạch tháng',
    tieuDe: 'Kế hoạch thi đua cao điểm chào mừng Ngày Nhà giáo Việt Nam 20/11 - Bông hoa điểm 10',
    thoiGian: 'Tháng 11/2026',
    nguoiPhuTrach: '17 Chi đội & TPT Đội',
    trangThai: 'Đang thực hiện',
    linkedHoSoGroupIds: [4, 6],
    detail: {
      mucTieu: 'Tạo không khí thi đua sôi nổi trong học tập và rèn luyện đạo đức, phấn đấu mỗi học sinh đạt nhiều hoa điểm tốt dâng tặng thầy cô giáo vùng cao.',
      diaDiem: 'Toàn trường (17 Chi đội)',
      kinhPhiDuTru: '1.200.000 VNĐ (Khen thưởng hoa điểm 10)',
      noiDungVanBan: 'KẾ HOẠCH THI ĐUA THÁNG 11\nChủ đề: "Bông hoa điểm 10 dâng tặng thầy cô"\n\n1. Thời gian: Từ ngày 01/11/2026 đến hết ngày 20/11/2026.\n2. Nội dung:\n- Tuần học tốt, giờ học tốt, tiết học không vi phạm.\n- Phong trào "Bông hoa điểm 10": Tuyên dương học sinh đạt từ 5 điểm 10 trở lên.\n- Thi làm tập san báo ảnh và thi văn nghệ truyền thống dân tộc Tày, Mông, Dao.',
      linkedHoSoGroupIds: [4, 6],
      lichThucHienChiTiet: [
        {
          id: 'ms-2-1',
          giaiDoan: 'Tuần 1',
          thoiGian: '02/11/2026',
          noiDung: 'Phát động phong trào trong buổi Chào cờ đầu tuần',
          nguoiThucHien: 'TPT Lộc Quốc Cường',
          daHoanThanh: true,
        },
        {
          id: 'ms-2-2',
          giaiDoan: 'Tuần 2 & 3',
          thoiGian: '09/11 - 18/11/2026',
          noiDung: 'Chấm sơ khảo báo tường và các tiết mục văn nghệ 17 Chi đội',
          nguoiThucHien: 'Ban Giám khảo Đoàn Đội',
          daHoanThanh: false,
        },
        {
          id: 'ms-2-3',
          giaiDoan: 'Tuần 4',
          thoiGian: '20/11/2026',
          noiDung: 'Lễ kỷ niệm Ngày Nhà giáo Việt Nam và trao thưởng thi đua',
          nguoiThucHien: 'BGH & TPT',
          daHoanThanh: false,
        },
      ],
      minhChungList: [
        {
          id: 'mc-init-3',
          loai: 'Tài liệu minh chứng',
          tenTaiLieu: 'Thể lệ cuộc thi Báo tường và Văn nghệ truyền thống',
          fileId: 'file_init_thele',
          fileName: 'The_Le_Thi_Dua_20_11_Duong_Hong.docx',
          fileType: 'docx',
          fileSize: '315 KB',
          ngayTao: '01/11/2026',
          ghiChu: 'Gửi 17 GVCN và BCH Chi đội',
          linkedHoSoGroupId: 6,
        },
      ],
    },
  },
  {
    id: 3,
    loai: 'Kế hoạch tuần',
    tieuDe: 'Kiểm tra nền nếp, truy bài 15 phút và vệ sinh bán trú 2 điểm trường Tuần 8',
    thoiGian: 'Thứ Hai đến Thứ Sáu',
    nguoiPhuTrach: 'Đội Cờ đỏ & GVCN 17 lớp',
    trangThai: 'Đang thực hiện',
    linkedHoSoGroupIds: [7],
    detail: {
      mucTieu: 'Duy trì nền nếp tác phong khăn quàng, đồng phục, vệ sinh khu phòng ở nội trú tại Trường chính và Phân hiệu.',
      diaDiem: '2 Điểm trường',
      noiDungVanBan: 'Kiểm tra định kỳ hàng ngày:\n- 7h00 - 7h30: Cổng trường & tác phong chuyên cần.\n- 7h30 - 7h45: Trật tự truy bài 15 phút.\n- 11h30 & 17h30: Giờ cơm và vệ sinh khu bán trú.',
      linkedHoSoGroupIds: [7],
    },
  },
  {
    id: 4,
    loai: 'Hoạt động theo chủ điểm',
    tieuDe: 'Sinh hoạt chuyên đề "Tình bạn diệu kỳ - Xây dựng tình bạn đẹp, nói không với bạo lực học đường"',
    thoiGian: 'Tuần 10 (Tháng 11/2026)',
    nguoiPhuTrach: 'BCH Liên Đội & TPT',
    trangThai: 'Chưa thực hiện',
    linkedHoSoGroupIds: [5],
    detail: {
      mucTieu: 'Giáo dục kỹ năng sống, tinh thần đoàn kết giúp đỡ bạn bè cùng tiến bộ, đặc biệt giữa các học sinh dân tộc thiểu số vùng cao.',
      diaDiem: 'Sân cờ Trường chính',
      linkedHoSoGroupIds: [5],
    },
  },
  {
    id: 5,
    loai: 'Nhiệm vụ đột xuất',
    tieuDe: 'Đón đoàn kiểm tra chuyên đề công tác nội trú - bán trú và vệ sinh an toàn thực phẩm tại Phân hiệu',
    thoiGian: 'Ngày 30/10/2026',
    nguoiPhuTrach: 'TPT Lộc Quốc Cường & GVCN Phân hiệu',
    trangThai: 'Hoàn thành',
    linkedHoSoGroupIds: [1, 7],
    detail: {
      mucTieu: 'Chuẩn bị hồ sơ sổ sách Đội, kiểm tra cơ sở vật chất phòng ở bán trú học sinh tại Phân hiệu đón đoàn kiểm tra Phòng GD&ĐT.',
      diaDiem: 'Phân hiệu THCS Đường Hồng',
      linkedHoSoGroupIds: [1, 7],
      ketQuaDanhGia: {
        soLuongHsThamGia: 315,
        xepLoai: 'Tốt',
        danhGiaChung: 'Đoàn kiểm tra đánh giá cao nề nếp bán trú, phòng ở ngăn nắp, hồ sơ quản lý học sinh và đội viên rõ ràng đầy đủ.',
        ngayDanhGia: '30/10/2026',
        nguoiDanhGia: 'TPT Lộc Quốc Cường',
      },
    },
  },
  {
    id: 6,
    loai: 'Kế hoạch năm học',
    tieuDe: 'Sơ kết công tác Đội & Phong trào Thiếu nhi Học kỳ 1 (Năm học 2026-2027)',
    thoiGian: 'Tháng 01/2027',
    nguoiPhuTrach: 'Ban Giám hiệu & TPT',
    trangThai: 'Chưa thực hiện',
    linkedHoSoGroupIds: [1, 8],
    detail: {
      mucTieu: 'Đánh giá kết quả triển khai công tác Đội và phong trào thiếu nhi Học kỳ 1; biểu dương khen thưởng các tập thể và cá nhân xuất sắc.',
      diaDiem: 'Toàn trường',
      linkedHoSoGroupIds: [1, 8],
    },
  },
];

export const INITIAL_SU_VIEC: SuViec[] = [
  {
    id: 1,
    tuan: 8,
    hocKy: 'HK1',
    lop: '7A',
    thoiGian: '07:20 ngày 26/10/2026',
    hocSinh: 'Trần Văn Nam',
    tieuChi: 'Không đeo khăn quàng / Sai quy định trang phục',
    diem: -2,
    moTa: 'Quên khăn quàng tại phòng ở nội trú khi vào lớp học',
    nguoiGhi: 'Cờ đỏ Trường chính',
    diaDiem: 'Cổng trường'
  },
  {
    id: 2,
    tuan: 8,
    hocKy: 'HK1',
    lop: '9A',
    thoiGian: '09:45 ngày 25/10/2026',
    hocSinh: 'Hoàng Thị Mơ',
    tieuChi: 'Nhặt được của rơi trả lại người mất',
    diem: 5,
    moTa: 'Nhặt được máy tính Casio rơi tại sân trường và nộp lại cho thầy TPT tìm người trả',
    nguoiGhi: 'TPT Lộc Quốc Cường',
    diaDiem: 'Sân cờ'
  },
  {
    id: 3,
    tuan: 8,
    hocKy: 'HK1',
    lop: '8C',
    thoiGian: '07:10 ngày 26/10/2026',
    hocSinh: 'Đặng Văn Tiến',
    tieuChi: 'Gương sáng vượt khó, tích cực giúp bạn tiến bộ',
    diem: 5,
    moTa: 'Cõng bạn bị đau chân đi học và phụ giúp dọn cơm bán trú cả tuần',
    nguoiGhi: 'GVCN Phân hiệu',
    diaDiem: 'Phân hiệu'
  }
];

export const INITIAL_HOC_SINH: HocSinh[] = [
  {
    id: 'hs-001',
    maHs: 'DH26001',
    hoTen: 'Hoàng Thị Mơ',
    gioiTinh: 'Nữ',
    ngaySinh: '15/03/2012',
    danToc: 'Tày',
    lop: '9A',
    diemTruong: 'Trường chính',
    isDoiVien: true,
    ngayVaoDoi: '15/05/2021',
    isDoanVien: true,
    ngayVaoDoan: '26/03/2026',
    soTheDoan: 'ĐV-260901',
    chiDoanSinhHoat: 'Chi đoàn THCS Đường Hồng',
    isBanTru: true,
    hoanThanhRenLuyen: 'Xuất sắc',
    ghiChu: 'Liên đội trưởng, gương mẫu, học sinh giỏi'
  },
  {
    id: 'hs-002',
    maHs: 'DH26002',
    hoTen: 'Đặng Văn Tiến',
    gioiTinh: 'Nam',
    ngaySinh: '22/08/2013',
    danToc: 'Dao',
    lop: '8C',
    diemTruong: 'Phân hiệu',
    isDoiVien: true,
    ngayVaoDoi: '26/03/2022',
    isDoanVien: false,
    isBanTru: true,
    hoanThanhRenLuyen: 'Xuất sắc',
    ghiChu: 'Liên đội phó phụ trách Phân hiệu, cõng bạn đi học'
  },
  {
    id: 'hs-003',
    maHs: 'DH26003',
    hoTen: 'Trần Văn Nam',
    gioiTinh: 'Nam',
    ngaySinh: '10/11/2013',
    danToc: 'Kinh',
    lop: '8A',
    diemTruong: 'Trường chính',
    isDoiVien: true,
    ngayVaoDoi: '26/03/2022',
    isDoanVien: false,
    isBanTru: false,
    hoanThanhRenLuyen: 'Hoàn thành',
    ghiChu: 'Chi đội trưởng 8A, đội viên nhiệt tình'
  },
  {
    id: 'hs-004',
    maHs: 'DH26004',
    hoTen: 'Ma Thị Lan',
    gioiTinh: 'Nữ',
    ngaySinh: '05/01/2013',
    danToc: 'Tày',
    lop: '8B',
    diemTruong: 'Trường chính',
    isDoiVien: true,
    ngayVaoDoi: '15/05/2022',
    isDoanVien: false,
    isBanTru: true,
    hoanThanhRenLuyen: 'Hoàn thành',
    ghiChu: 'Chi đội phó 8B, phụ trách văn nghệ'
  },
  {
    id: 'hs-005',
    maHs: 'DH26005',
    hoTen: 'Hoàng Văn Thắng',
    gioiTinh: 'Nam',
    ngaySinh: '18/06/2012',
    danToc: 'Nùng',
    lop: '9B',
    diemTruong: 'Trường chính',
    isDoiVien: true,
    ngayVaoDoi: '15/05/2021',
    isDoanVien: true,
    ngayVaoDoan: '26/03/2026',
    soTheDoan: 'ĐV-260905',
    chiDoanSinhHoat: 'Chi đoàn THCS Đường Hồng',
    isBanTru: true,
    hoanThanhRenLuyen: 'Xuất sắc',
    ghiChu: 'Trưởng ban Đội Cờ đỏ, giám sát nghiêm túc'
  },
  {
    id: 'hs-006',
    maHs: 'DH26006',
    hoTen: 'Lý A Sùng',
    gioiTinh: 'Nam',
    ngaySinh: '09/04/2012',
    danToc: 'Mông',
    lop: '9C',
    diemTruong: 'Phân hiệu',
    isDoiVien: true,
    ngayVaoDoi: '26/03/2021',
    isDoanVien: true,
    ngayVaoDoan: '19/05/2026',
    soTheDoan: 'ĐV-260912',
    chiDoanSinhHoat: 'Chi đoàn Phân hiệu Đường Hồng',
    isBanTru: true,
    hoanThanhRenLuyen: 'Hoàn thành',
    ghiChu: 'Ủy viên BCH Liên đội, năng nổ phong trào thể thao'
  },
  {
    id: 'hs-007',
    maHs: 'DH26007',
    hoTen: 'Đặng Mùi Mấy',
    gioiTinh: 'Nữ',
    ngaySinh: '14/12/2013',
    danToc: 'Dao',
    lop: '8D',
    diemTruong: 'Phân hiệu',
    isDoiVien: true,
    ngayVaoDoi: '15/05/2022',
    isBanTru: true,
    hoanThanhRenLuyen: 'Hoàn thành',
    ghiChu: 'Chi đội trưởng 8D'
  },
  {
    id: 'hs-008',
    maHs: 'DH26008',
    hoTen: 'Nông Văn Hùng',
    gioiTinh: 'Nam',
    ngaySinh: '20/02/2015',
    danToc: 'Tày',
    lop: '6A',
    diemTruong: 'Trường chính',
    isDoiVien: false,
    isBanTru: true,
    hoanThanhRenLuyen: 'Đang rèn luyện',
    ghiChu: 'Học sinh mới khối 6, đang phấn đấu kết nạp Đội'
  },
  {
    id: 'hs-009',
    maHs: 'DH26009',
    hoTen: 'Lò Thị Hoa',
    gioiTinh: 'Nữ',
    ngaySinh: '12/07/2015',
    danToc: 'Thái',
    lop: '6C',
    diemTruong: 'Phân hiệu',
    isDoiVien: false,
    isBanTru: true,
    hoanThanhRenLuyen: 'Đang rèn luyện',
    ghiChu: 'Học sinh bán trú Phân hiệu'
  },
  {
    id: 'hs-010',
    maHs: 'DH26010',
    hoTen: 'Vàng A Páo',
    gioiTinh: 'Nam',
    ngaySinh: '30/10/2012',
    danToc: 'Mông',
    lop: '9E',
    diemTruong: 'Phân hiệu',
    isDoiVien: true,
    ngayVaoDoi: '26/03/2021',
    isBanTru: true,
    hoanThanhRenLuyen: 'Hoàn thành',
    ghiChu: 'Chi đội trưởng 9E Phân hiệu'
  }
];

export const INITIAL_BCH_LIEN_DOI: BchLienDoiMember[] = [
  {
    id: 'bch-1',
    hoTen: 'Hoàng Thị Mơ',
    lop: '9A',
    chucVu: 'Liên đội trưởng',
    nhiemKy: '2026 - 2027',
    nhiemVu: 'Phụ trách chung toàn Liên đội, chủ trì các buổi sinh hoạt BCH và điều hành Nghi lễ Đội',
    ketQua: 'Hoàn thành xuất sắc'
  },
  {
    id: 'bch-2',
    hoTen: 'Đặng Văn Tiến',
    lop: '8C',
    chucVu: 'Liên đội phó thường trực',
    nhiemKy: '2026 - 2027',
    nhiemVu: 'Phụ trách điều hành công tác Đội và nề nếp khu bán trú tại Phân hiệu',
    ketQua: 'Hoàn thành xuất sắc'
  },
  {
    id: 'bch-3',
    hoTen: 'Trần Văn Nam',
    lop: '8A',
    chucVu: 'Liên đội phó',
    nhiemKy: '2026 - 2027',
    nhiemVu: 'Phụ trách thi đua nền nếp, kiểm tra chuyên cần khối 7, 8 Trường chính',
    ketQua: 'Hoàn thành tốt'
  },
  {
    id: 'bch-4',
    hoTen: 'Hoàng Văn Thắng',
    lop: '9B',
    chucVu: 'Trưởng ban Đội Cờ đỏ',
    nhiemKy: '2026 - 2027',
    nhiemVu: 'Quản lý lịch trực, sổ chấm thi đua hàng ngày của Đội cờ đỏ 2 điểm trường',
    ketQua: 'Hoàn thành tốt'
  },
  {
    id: 'bch-5',
    hoTen: 'Ma Thị Lan',
    lop: '8B',
    chucVu: 'Trưởng ban Học tập & Búp măng',
    nhiemKy: '2026 - 2027',
    nhiemVu: 'Theo dõi phong trào Hoa điểm tốt, đôi bạn cùng tiến và phát thanh măng non',
    ketQua: 'Đang thực hiện'
  },
  {
    id: 'bch-6',
    hoTen: 'Lý A Sùng',
    lop: '9C',
    chucVu: 'Trưởng ban Văn thể mỹ & Bán trú',
    nhiemKy: '2026 - 2027',
    nhiemVu: 'Tổ chức múa hát sân trường, trò chơi dân gian và nề nếp phòng ở bán trú',
    ketQua: 'Hoàn thành tốt'
  },
  {
    id: 'bch-7',
    hoTen: 'Đặng Mùi Mấy',
    lop: '8D',
    chucVu: 'Ủy viên BCH Liên đội',
    nhiemKy: '2026 - 2027',
    nhiemVu: 'Phụ trách công tác kế hoạch nhỏ và đôn đốc phong trào đọc và làm theo báo Đội',
    ketQua: 'Đang thực hiện'
  }
];

export const INITIAL_CHI_TIEU: ChiTieuCongTac[] = [
  {
    id: 'ct-1',
    ten: 'Chi đội Vững mạnh xuất sắc',
    mucTieu: '100% Chi đội (17/17 lớp) đạt danh hiệu Chi đội Vững mạnh',
    hienTai: 17,
    chiTieu: 17,
    donVi: 'Chi đội',
    ghiChu: 'Trường chính 8 lớp, Phân hiệu 9 lớp'
  },
  {
    id: 'ct-2',
    ten: 'Tỷ lệ kết nạp Đội viên khối 6',
    mucTieu: '100% học sinh đủ điều kiện được bồi dưỡng và kết nạp Đội viên',
    hienTai: 85,
    chiTieu: 100,
    donVi: '%',
    ghiChu: 'Đợt 1 chào mừng 20/11, đợt 2 ngày 26/3'
  },
  {
    id: 'ct-3',
    ten: 'Hoàn thành Rèn luyện Đội viên',
    mucTieu: 'Tỷ lệ đội viên THCS hoàn thành Chương trình Rèn luyện đội viên',
    hienTai: 92,
    chiTieu: 98,
    donVi: '%',
    ghiChu: 'Hạng Ba (K6-7) và Hạng Nhì (K8-9)'
  },
  {
    id: 'ct-4',
    ten: 'Công trình Măng non Bán trú',
    mucTieu: 'Mỗi Chi đội đảm nhận ít nhất 01 bồn hoa hoặc công trình vườn rau',
    hienTai: 15,
    chiTieu: 17,
    donVi: 'Công trình',
    ghiChu: 'Đã hoàn thành 15/17 công trình măng non'
  },
  {
    id: 'ct-5',
    ten: 'Phong trào Kế hoạch nhỏ',
    mucTieu: 'Gây quỹ Đàn gà Khăn quàng đỏ giúp học sinh nghèo vượt khó',
    hienTai: 100,
    chiTieu: 100,
    donVi: '%',
    ghiChu: '100% Chi đội hoàn thành chỉ tiêu lon/giấy vụn'
  },
  {
    id: 'ct-6',
    ten: 'An toàn giao thông & Bạo lực',
    mucTieu: 'Giữ vững 0 vụ việc vi phạm trật tự ATGT hoặc bạo lực học đường',
    hienTai: 0,
    chiTieu: 0,
    donVi: 'Vụ việc',
    ghiChu: 'Duy trì trường học thân thiện, học sinh tích cực'
  }
];

export const INITIAL_REN_LUYEN_STATE: RenLuyenState = {
  danhGiaThang: {
    '2026-2027_T9_hs-001': {
      id: '2026-2027_T9_hs-001',
      namHoc: '2026-2027',
      thang: 9,
      hocSinhId: 'hs-001',
      maHs: 'DH26001',
      hoTen: 'Hoàng Thị Mơ',
      lop: '9A',
      diemTruong: 'Trường chính',
      tieuChi: {
        daoDucTacPhong: 'Tốt',
        hocTap: 'Tốt',
        chuyenCan: 'Tốt',
        noiQuyKyLuat: 'Tốt',
        bacHoDay: 'Tốt',
        hoatDongDoi: 'Tốt',
        veSinhLaoDong: 'Tốt',
        doanKetGiupDo: 'Tốt',
      },
      xepLoaiChung: 'Tốt',
      uuDiem: 'Gương mẫu, tích cực điều hành Liên đội trong tháng khai giảng',
      hanChe: 'Không',
      huongKhacPhuc: 'Phát huy tốt vai trò tự quản của BCH Liên đội',
      minhChung: 'Điều hành thành công Lễ Khai giảng và Đại hội Liên đội',
      trangThai: 'Đã xác nhận',
      nguoiDanhGia: 'GVCN 9A',
      ngayDanhGia: '30/09/2026',
      nguoiXacNhan: 'TPT Lộc Quốc Cường',
      ngayXacNhan: '01/10/2026',
    },
    '2026-2027_T10_hs-001': {
      id: '2026-2027_T10_hs-001',
      namHoc: '2026-2027',
      thang: 10,
      hocSinhId: 'hs-001',
      maHs: 'DH26001',
      hoTen: 'Hoàng Thị Mơ',
      lop: '9A',
      diemTruong: 'Trường chính',
      tieuChi: {
        daoDucTacPhong: 'Tốt',
        hocTap: 'Tốt',
        chuyenCan: 'Tốt',
        noiQuyKyLuat: 'Tốt',
        bacHoDay: 'Tốt',
        hoatDongDoi: 'Tốt',
        veSinhLaoDong: 'Tốt',
        doanKetGiupDo: 'Tốt',
      },
      xepLoaiChung: 'Tốt',
      uuDiem: 'Nhặt được của rơi trả lại bạn, đạt nhiều hoa điểm tốt',
      hanChe: 'Không',
      huongKhacPhuc: 'Tiếp tục giúp đỡ các bạn học lực trung bình trong chi đội',
      minhChung: 'Biên bản tuyên dương sự việc ngày 25/10/2026',
      trangThai: 'Đã xác nhận',
      nguoiDanhGia: 'GVCN 9A',
      ngayDanhGia: '31/10/2026',
      nguoiXacNhan: 'TPT Lộc Quốc Cường',
      ngayXacNhan: '02/11/2026',
    },
    '2026-2027_T9_hs-002': {
      id: '2026-2027_T9_hs-002',
      namHoc: '2026-2027',
      thang: 9,
      hocSinhId: 'hs-002',
      maHs: 'DH26002',
      hoTen: 'Đặng Văn Tiến',
      lop: '8C',
      diemTruong: 'Phân hiệu',
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
      uuDiem: 'Chăm ngoan, phụ trách tốt hoạt động Đội tại Phân hiệu',
      hanChe: 'Môn Toán cần rèn thêm bài tập',
      huongKhacPhuc: 'Nhờ bạn kèm cặp thêm trong giờ tự học bán trú',
      minhChung: 'Nhật ký thi đua Phân hiệu',
      trangThai: 'Đã xác nhận',
      nguoiDanhGia: 'GVCN 8C',
      ngayDanhGia: '30/09/2026',
      nguoiXacNhan: 'TPT Lộc Quốc Cường',
      ngayXacNhan: '01/10/2026',
    },
    '2026-2027_T10_hs-002': {
      id: '2026-2027_T10_hs-002',
      namHoc: '2026-2027',
      thang: 10,
      hocSinhId: 'hs-002',
      maHs: 'DH26002',
      hoTen: 'Đặng Văn Tiến',
      lop: '8C',
      diemTruong: 'Phân hiệu',
      tieuChi: {
        daoDucTacPhong: 'Tốt',
        hocTap: 'Tốt',
        chuyenCan: 'Tốt',
        noiQuyKyLuat: 'Tốt',
        bacHoDay: 'Tốt',
        hoatDongDoi: 'Tốt',
        veSinhLaoDong: 'Tốt',
        doanKetGiupDo: 'Tốt',
      },
      xepLoaiChung: 'Tốt',
      uuDiem: 'Cõng bạn đau chân đi học cả tuần, nhiệt tình phụ giúp bếp bán trú',
      hanChe: 'Không',
      huongKhacPhuc: 'Duy trì tinh thần tương thân tương ái',
      minhChung: 'Gương sáng việc tốt Tuần 8 được tuyên dương toàn trường',
      trangThai: 'Đã xác nhận',
      nguoiDanhGia: 'GVCN 8C',
      ngayDanhGia: '31/10/2026',
      nguoiXacNhan: 'TPT Lộc Quốc Cường',
      ngayXacNhan: '02/11/2026',
    },
  },
  tongKetKy: {
    '2026-2027_Giữa HK1_hs-001': {
      id: '2026-2027_Giữa HK1_hs-001',
      namHoc: '2026-2027',
      ky: 'Giữa HK1',
      hocSinhId: 'hs-001',
      maHs: 'DH26001',
      hoTen: 'Hoàng Thị Mơ',
      lop: '9A',
      diemTruong: 'Trường chính',
      thangIncluded: [9, 10],
      thangMissing: [],
      xepLoaiDeXuat: 'Tốt',
      xepLoaiChinhThuc: 'Tốt',
      nhanXetChung: 'Đội viên gương mẫu xuất sắc, hoàn thành toàn diện 8 tiêu chí rèn luyện Đội viên.',
      khenThuongDeXuat: 'Đề nghị Liên đội tuyên dương Đội viên tiêu biểu cấp trường',
      trangThai: 'TPT đã khóa',
      nguoiCapNhat: 'TPT Lộc Quốc Cường',
      ngayCapNhat: '02/11/2026',
    },
  },
  lockedKy: {
    '2026-2027_Giữa HK1_9A': false,
  },
};

export interface ThuMucChiDoiDef {
  id: ThuMucChiDoiId;
  code: string;
  name: string;
  desc: string;
  badge?: string;
}

export const THU_MUC_CHI_DOI_DEFS: ThuMucChiDoiDef[] = [
  {
    id: '01_ke_hoach_nam_hoc',
    code: '01',
    name: 'KẾ HOẠCH NĂM HỌC',
    desc: 'Kế hoạch công tác Đội chi đội năm học 2026-2027, đăng ký chỉ tiêu thi đua chi đội vững mạnh.',
    badge: 'Đầu năm',
  },
  {
    id: '02_ke_hoach_thang',
    code: '02',
    name: 'KẾ HOẠCH THÁNG',
    desc: 'Kế hoạch hoạt động chi đội theo từng tháng (Tháng 9 đến Tháng 5), phân công nhiệm vụ và lịch trực tuần.',
    badge: 'Hằng tháng',
  },
  {
    id: '03_bao_cao_thang',
    code: '03',
    name: 'BÁO CÁO CÔNG TÁC ĐỘI HÀNG THÁNG',
    desc: 'Báo cáo nề nếp, chuyên cần, sinh hoạt Đội định kỳ từ Tháng 9 đến Tháng 5 gửi TPT Đội.',
    badge: '9 Tháng',
  },
  {
    id: '04_bao_cao_giua_cuoi_ky',
    code: '04',
    name: 'BÁO CÁO GIỮA HỌC KỲ VÀ CUỐI HỌC KỲ',
    desc: 'Báo cáo sơ kết giữa Học kỳ I, cuối Học kỳ I, giữa Học kỳ II đánh giá nề nếp bán trú và thi đua.',
    badge: 'Định kỳ',
  },
  {
    id: '05_bao_cao_tong_ket_nam',
    code: '05',
    name: 'BÁO CÁO TỔNG KẾT NĂM HỌC',
    desc: 'Báo cáo tổng kết công tác Đội và phong trào thiếu nhi cả năm học của Chi đội, đề xuất khen thưởng.',
    badge: 'Cuối năm',
  },
  {
    id: '06_bien_ban_dai_hoi_hop',
    code: '06',
    name: 'BIÊN BẢN ĐẠI HỘI, SINH HOẠT VÀ HỌP CHI ĐỘI',
    desc: 'Biên bản Đại hội Chi đội đầu năm, biên bản họp BCH chi đội định kỳ, biên bản sinh hoạt chuyên đề.',
    badge: 'Hành chính',
  },
  {
    id: '07_minh_chung_hoat_dong',
    code: '07',
    name: 'MINH CHỨNG HOẠT ĐỘNG',
    desc: 'Hình ảnh, danh sách tham gia hoạt động Đội, công trình măng non, kế hoạch nhỏ, văn nghệ, thể thao.',
    badge: 'Minh chứng',
  },
  {
    id: '08_ho_so_khac',
    code: '08',
    name: 'HỒ SƠ KHÁC',
    desc: 'Tài liệu bổ sung, quyết định khen thưởng, tờ trình, danh sách đội viên ưu tú giới thiệu Đoàn.',
    badge: 'Mở rộng',
  },
];

export const INITIAL_HO_SO_CHI_DOI: HoSoChiDoiItem[] = [
  // Chi đội 9A (Trường chính)
  {
    id: 'hs-cd-9A-01',
    classKey: '9A',
    thuMucId: '01_ke_hoach_nam_hoc',
    tenHoSo: 'Kế hoạch công tác Đội Chi đội 9A năm học 2026-2027',
    thoiGianThucHien: 'Năm học 2026-2027',
    namHoc: '2026-2027',
    gvGui: 'GVCN 9A',
    thoiGianGui: '14:20 ngày 20/09/2026',
    fileId: 'f_cd_9a_kh_nam',
    fileName: 'Ke_Hoach_Cong_Tac_Doi_Chi_Doi_9A_2026_2027.docx',
    fileSize: '245 KB',
    fileType: 'docx',
    trangThai: 'Đã kiểm tra',
    nhanXetTpt: 'Hồ sơ đầy đủ',
    ngayKiemTra: '22/09/2026',
    nguoiKiemTra: 'TPT Lộc Quốc Cường',
    version: 1,
  },
  {
    id: 'hs-cd-9A-03-t9',
    classKey: '9A',
    thuMucId: '03_bao_cao_thang',
    tenHoSo: 'Báo cáo công tác Đội Tháng 9/2026 - Chi đội 9A',
    thoiGianThucHien: 'Tháng 9/2026',
    thangBaoCao: 9,
    namHoc: '2026-2027',
    gvGui: 'GVCN 9A',
    thoiGianGui: '16:00 ngày 30/09/2026',
    fileId: 'f_cd_9a_bc_t9',
    fileName: 'Bao_Cao_Cong_Tac_Doi_Thang_9_Chi_Doi_9A.docx',
    fileSize: '180 KB',
    fileType: 'docx',
    trangThai: 'Đã kiểm tra',
    nhanXetTpt: 'Hồ sơ đầy đủ',
    ngayKiemTra: '01/10/2026',
    nguoiKiemTra: 'TPT Lộc Quốc Cường',
    version: 1,
  },
  {
    id: 'hs-cd-9A-03-t10',
    classKey: '9A',
    thuMucId: '03_bao_cao_thang',
    tenHoSo: 'Báo cáo công tác Đội Tháng 10/2026 - Chi đội 9A',
    thoiGianThucHien: 'Tháng 10/2026',
    thangBaoCao: 10,
    namHoc: '2026-2027',
    gvGui: 'GVCN 9A',
    thoiGianGui: '17:15 ngày 31/10/2026',
    fileId: 'f_cd_9a_bc_t10',
    fileName: 'Bao_Cao_Cong_Tac_Doi_Thang_10_Chi_Doi_9A.docx',
    fileSize: '215 KB',
    fileType: 'docx',
    trangThai: 'Đã gửi',
    nhanXetTpt: 'Hồ sơ đầy đủ',
    ngayKiemTra: '02/11/2026',
    nguoiKiemTra: 'TPT Lộc Quốc Cường',
    version: 1,
  },
  {
    id: 'hs-cd-9A-06',
    classKey: '9A',
    thuMucId: '06_bien_ban_dai_hoi_hop',
    tenHoSo: 'Biên bản Đại hội Chi đội 9A nhiệm kỳ 2026-2027',
    thoiGianThucHien: 'Tháng 9/2026',
    namHoc: '2026-2027',
    gvGui: 'GVCN 9A',
    thoiGianGui: '09:00 ngày 22/09/2026',
    fileId: 'f_cd_9a_bb_dh',
    fileName: 'Bien_Ban_Dai_Hoi_Chi_Doi_9A_2026.pdf',
    fileSize: '650 KB',
    fileType: 'pdf',
    trangThai: 'Đã kiểm tra',
    nhanXetTpt: 'Hồ sơ đầy đủ',
    version: 1,
  },
  {
    id: 'hs-cd-9A-07',
    classKey: '9A',
    thuMucId: '07_minh_chung_hoat_dong',
    tenHoSo: 'Hình ảnh và minh chứng Công trình măng non bồn hoa chi đội 9A',
    thoiGianThucHien: 'Tháng 10/2026',
    namHoc: '2026-2027',
    gvGui: 'GVCN 9A',
    thoiGianGui: '15:30 ngày 25/10/2026',
    fileId: 'f_cd_9a_mc_ctmn',
    fileName: 'Hinh_Anh_Cong_Trinh_Mang_Non_9A.jpg',
    fileSize: '1.4 MB',
    fileType: 'jpg',
    trangThai: 'Đã kiểm tra',
    version: 1,
  },

  // Chi đội 8C (Phân hiệu)
  {
    id: 'hs-cd-8C-01',
    classKey: '8C',
    thuMucId: '01_ke_hoach_nam_hoc',
    tenHoSo: 'Kế hoạch công tác Đội Chi đội 8C (Phân hiệu) năm học 2026-2027',
    thoiGianThucHien: 'Năm học 2026-2027',
    namHoc: '2026-2027',
    gvGui: 'GVCN 8C',
    thoiGianGui: '11:00 ngày 21/09/2026',
    fileId: 'f_cd_8c_kh_nam',
    fileName: 'Ke_Hoach_Nam_Hoc_2026_2027_Chi_Doi_8C.docx',
    fileSize: '195 KB',
    fileType: 'docx',
    trangThai: 'Đã kiểm tra',
    nhanXetTpt: 'Hồ sơ đầy đủ',
    ngayKiemTra: '23/09/2026',
    nguoiKiemTra: 'TPT Lộc Quốc Cường',
    version: 1,
  },
  {
    id: 'hs-cd-8C-03-t9',
    classKey: '8C',
    thuMucId: '03_bao_cao_thang',
    tenHoSo: 'Báo cáo công tác Đội Tháng 9/2026 - Chi đội 8C',
    thoiGianThucHien: 'Tháng 9/2026',
    thangBaoCao: 9,
    namHoc: '2026-2027',
    gvGui: 'GVCN 8C',
    thoiGianGui: '16:30 ngày 30/09/2026',
    fileId: 'f_cd_8c_bc_t9',
    fileName: 'Bao_Cao_Thang_9_Chi_Doi_8C_Phan_Hieu.xlsx',
    fileSize: '85 KB',
    fileType: 'xlsx',
    trangThai: 'Đã kiểm tra',
    nhanXetTpt: 'Hồ sơ đầy đủ',
    ngayKiemTra: '01/10/2026',
    nguoiKiemTra: 'TPT Lộc Quốc Cường',
    version: 1,
  },
  {
    id: 'hs-cd-8C-03-t10',
    classKey: '8C',
    thuMucId: '03_bao_cao_thang',
    tenHoSo: 'Báo cáo công tác Đội Tháng 10/2026 - Chi đội 8C',
    thoiGianThucHien: 'Tháng 10/2026',
    thangBaoCao: 10,
    namHoc: '2026-2027',
    gvGui: 'GVCN 8C',
    thoiGianGui: '15:45 ngày 31/10/2026',
    fileId: 'f_cd_8c_bc_t10',
    fileName: 'Bao_Cao_Thang_10_Chi_Doi_8C_Phan_Hieu.xlsx',
    fileSize: '92 KB',
    fileType: 'xlsx',
    trangThai: 'Đã cập nhật',
    nhanXetTpt: 'Hồ sơ đầy đủ',
    ngayKiemTra: '02/11/2026',
    nguoiKiemTra: 'TPT Lộc Quốc Cường',
    version: 2,
    history: [
      {
        version: 1,
        fileId: 'f_cd_8c_bc_t10_v1',
        fileName: 'Bao_Cao_Thang_10_Chi_Doi_8C_v1.xlsx',
        fileSize: '80 KB',
        uploadDate: '30/10/2026',
        uploadedBy: 'GVCN 8C',
        note: 'Bản nộp lần 1',
      },
    ],
  },
  {
    id: 'hs-cd-8C-06',
    classKey: '8C',
    thuMucId: '06_bien_ban_dai_hoi_hop',
    tenHoSo: 'Biên bản Đại hội Chi đội 8C nhiệm kỳ 2026-2027',
    thoiGianThucHien: 'Tháng 9/2026',
    namHoc: '2026-2027',
    gvGui: 'GVCN 8C',
    thoiGianGui: '10:30 ngày 23/09/2026',
    fileId: 'f_cd_8c_bb_dh',
    fileName: 'Bien_Ban_Dai_Hoi_Chi_Doi_8C.pdf',
    fileSize: '510 KB',
    fileType: 'pdf',
    trangThai: 'Đã kiểm tra',
    version: 1,
  },

  // Chi đội 7A (Trường chính)
  {
    id: 'hs-cd-7A-01',
    classKey: '7A',
    thuMucId: '01_ke_hoach_nam_hoc',
    tenHoSo: 'Kế hoạch công tác Đội Chi đội 7A năm học 2026-2027',
    thoiGianThucHien: 'Năm học 2026-2027',
    namHoc: '2026-2027',
    gvGui: 'GVCN 7A',
    thoiGianGui: '15:00 ngày 21/09/2026',
    fileId: 'f_cd_7a_kh_nam',
    fileName: 'Ke_Hoach_Nam_Hoc_Chi_Doi_7A.docx',
    fileSize: '210 KB',
    fileType: 'docx',
    trangThai: 'Đã kiểm tra',
    nhanXetTpt: 'Hồ sơ đầy đủ',
    version: 1,
  },
  {
    id: 'hs-cd-7A-03-t9',
    classKey: '7A',
    thuMucId: '03_bao_cao_thang',
    tenHoSo: 'Báo cáo công tác Đội Tháng 9/2026 - Chi đội 7A',
    thoiGianThucHien: 'Tháng 9/2026',
    thangBaoCao: 9,
    namHoc: '2026-2027',
    gvGui: 'GVCN 7A',
    thoiGianGui: '14:00 ngày 30/09/2026',
    fileId: 'f_cd_7a_bc_t9',
    fileName: 'Bao_Cao_Thang_9_Chi_Doi_7A.docx',
    fileSize: '165 KB',
    fileType: 'docx',
    trangThai: 'Đã kiểm tra',
    version: 1,
  },
  {
    id: 'hs-cd-7A-03-t10',
    classKey: '7A',
    thuMucId: '03_bao_cao_thang',
    tenHoSo: 'Báo cáo công tác Đội Tháng 10/2026 - Chi đội 7A',
    thoiGianThucHien: 'Tháng 10/2026',
    thangBaoCao: 10,
    namHoc: '2026-2027',
    gvGui: 'GVCN 7A',
    thoiGianGui: '16:00 ngày 01/11/2026',
    fileId: 'f_cd_7a_bc_t10',
    fileName: 'Bao_Cao_Thang_10_Chi_Doi_7A.docx',
    fileSize: '170 KB',
    fileType: 'docx',
    trangThai: 'Cần bổ sung',
    nhanXetTpt: 'Hồ sơ cần bổ sung',
    ghiChu: 'Cần bổ sung số liệu nề nếp chuyên cần bán trú tuần 8',
    ngayKiemTra: '02/11/2026',
    nguoiKiemTra: 'TPT Lộc Quốc Cường',
    version: 1,
  },

  // Chi đội 6B (Trường chính)
  {
    id: 'hs-cd-6B-06',
    classKey: '6B',
    thuMucId: '06_bien_ban_dai_hoi_hop',
    tenHoSo: 'Biên bản Đại hội Chi đội 6B đầu năm học 2026-2027',
    thoiGianThucHien: 'Tháng 9/2026',
    namHoc: '2026-2027',
    gvGui: 'GVCN 6B',
    thoiGianGui: '16:00 ngày 24/09/2026',
    fileId: 'f_cd_6b_bb_dh',
    fileName: 'Bien_Ban_Dai_Hoi_Chi_Doi_6B.docx',
    fileSize: '185 KB',
    fileType: 'docx',
    trangThai: 'Đã kiểm tra',
    version: 1,
  },
  {
    id: 'hs-cd-6B-03-t9',
    classKey: '6B',
    thuMucId: '03_bao_cao_thang',
    tenHoSo: 'Báo cáo công tác Đội Tháng 9/2026 - Chi đội 6B',
    thoiGianThucHien: 'Tháng 9/2026',
    thangBaoCao: 9,
    namHoc: '2026-2027',
    gvGui: 'GVCN 6B',
    thoiGianGui: '16:45 ngày 30/09/2026',
    fileId: 'f_cd_6b_bc_t9',
    fileName: 'Bao_Cao_Thang_9_Chi_Doi_6B.docx',
    fileSize: '155 KB',
    fileType: 'docx',
    trangThai: 'Đã kiểm tra',
    version: 1,
  },
];

export function getInitialAppState(): AppState {
  const classesData: Record<string, any> = {};

  CLASS_DEFINITIONS.forEach(c => {
    classesData[c.key] = {
      key: c.key,
      name: c.name,
      grade: c.grade,
      diemTruong: c.diemTruong,
      gvcn: '',
      siso: c.key === '9A' ? 38 : c.key === '8C' ? 36 : c.key === '8A' ? 40 : null,
      soDoiVien: c.key === '9A' ? 35 : c.key === '8C' ? 36 : c.key === '8A' ? 39 : null,
      soThanhNien: c.key === '9A' ? 3 : c.key === '8C' ? 0 : c.key === '8A' ? 0 : null,
      chiDoiTruong: c.key === '9A' ? 'Hoàng Thị Mơ' : c.key === '8C' ? 'Đặng Văn Tiến' : '',
      chiDoiPho: c.key === '9A' ? 'Hoàng Văn Thắng' : '',
      bchChiDoi: ['Chi đội trưởng', 'Chi đội phó', 'Ủy viên'],
      phongHoc: '',
      ghiChu: ''
    };
  });

  // Pre-seed some default sample weekly scores for week 8 so it looks alive immediately!
  const weeklyScores: Record<string, number> = {};
  CLASS_DEFINITIONS.forEach(c => {
    weeklyScores[`2026-2027_HK1_W8_${c.key}`] = 98;
  });
  // Adjust top classes
  weeklyScores[`2026-2027_HK1_W8_9A`] = 100;
  weeklyScores[`2026-2027_HK1_W8_8C`] = 100;
  weeklyScores[`2026-2027_HK1_W8_7A`] = 96;

  return {
    schoolConfig: {
      schoolName: 'Trường PTDTBT THCS Đường Hồng',
      location: 'Xã Đường Hồng, Tuyên Quang',
      schoolYear: '2026-2027',
      tptName: 'Lộc Quốc Cường',
      projectedStudents: 655,
      diemThresholds: {
        xuatSac: 95,
        tot: 85,
        kha: 70
      }
    },
    classesData,
    listHocSinh: INITIAL_HOC_SINH,
    listBchLienDoi: INITIAL_BCH_LIEN_DOI,
    listChiTieu: INITIAL_CHI_TIEU,
    weeklyScores,
    listSuViec: INITIAL_SU_VIEC,
    listThongBao: INITIAL_THONG_BAO,
    listCoDo: INITIAL_CO_DO,
    listLichCongTac: INITIAL_LICH_CONG_TAC,
    listTieuChi: DEFAULT_TIEU_CHI,
    hoSoGroups: DEFAULT_HO_SO_GROUPS,
    renLuyenState: INITIAL_REN_LUYEN_STATE,
    listHoSoChiDoi: INITIAL_HO_SO_CHI_DOI,
  };
}

