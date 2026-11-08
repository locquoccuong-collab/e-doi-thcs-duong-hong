import React, { useState } from 'react';
import {
  ShieldCheck,
  PlusCircle,
  Edit3,
  Trash2,
  Printer,
  Award,
  CheckCircle2,
  Clock,
  User,
  X,
  School,
} from 'lucide-react';
import { AppState, BchLienDoiMember } from '../types';
import { CLASS_DEFINITIONS } from '../data/initialData';

interface BchLienDoiViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const BchLienDoiView: React.FC<BchLienDoiViewProps> = ({
  appState,
  setAppState,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<BchLienDoiMember | null>(null);

  // Form state
  const [hoTen, setHoTen] = useState<string>('');
  const [lop, setLop] = useState<string>('9A');
  const [chucVu, setChucVu] = useState<string>('Ủy viên BCH Liên đội');
  const [nhiemKy, setNhiemKy] = useState<string>('2026 - 2027');
  const [nhiemVu, setNhiemVu] = useState<string>('');
  const [ketQua, setKetQua] = useState<BchLienDoiMember['ketQua']>('Đang thực hiện');

  const listBch = appState.listBchLienDoi || [];

  const openAddModal = () => {
    setEditingMember(null);
    setHoTen('');
    setLop('9A');
    setChucVu('Ủy viên BCH Liên đội');
    setNhiemKy('2026 - 2027');
    setNhiemVu('');
    setKetQua('Đang thực hiện');
    setIsModalOpen(true);
  };

  const openEditModal = (mem: BchLienDoiMember) => {
    setEditingMember(mem);
    setHoTen(mem.hoTen);
    setLop(mem.lop);
    setChucVu(mem.chucVu);
    setNhiemKy(mem.nhiemKy);
    setNhiemVu(mem.nhiemVu);
    setKetQua(mem.ketQua);
    setIsModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoTen.trim()) return;

    if (editingMember) {
      setAppState((prev) => ({
        ...prev,
        listBchLienDoi: prev.listBchLienDoi.map((m) =>
          m.id === editingMember.id
            ? {
                ...m,
                hoTen: hoTen.trim(),
                lop,
                chucVu: chucVu.trim(),
                nhiemKy: nhiemKy.trim(),
                nhiemVu: nhiemVu.trim(),
                ketQua,
              }
            : m
        ),
      }));
    } else {
      const newMem: BchLienDoiMember = {
        id: `bch-${Date.now()}`,
        hoTen: hoTen.trim(),
        lop,
        chucVu: chucVu.trim(),
        nhiemKy: nhiemKy.trim(),
        nhiemVu: nhiemVu.trim(),
        ketQua,
      };

      setAppState((prev) => ({
        ...prev,
        listBchLienDoi: [...prev.listBchLienDoi, newMem],
      }));
    }

    setIsModalOpen(false);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa thành viên "${name}" khỏi Ban Chỉ huy Liên đội?`)) {
      setAppState((prev) => ({
        ...prev,
        listBchLienDoi: prev.listBchLienDoi.filter((m) => m.id !== id),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-700 font-extrabold uppercase tracking-wide">
            <ShieldCheck className="w-5 h-5 text-yellow-500" />
            <span>Ban Chỉ Huy Liên Đội — Nhiệm Kỳ 2026–2027</span>
          </div>
          <h2 className="font-black text-xl text-slate-800 mt-1">
            Đội Ngũ Cán Bộ Chỉ Huy Đội Nòng Cốt
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý danh sách, chức vụ, nhiệm vụ được phân công và đánh giá kết quả thực hiện nhiệm vụ của Ban Chỉ huy Liên đội.
          </p>
        </div>

        <div className="flex items-center space-x-2 no-print">
          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>In danh sách BCH</span>
          </button>

          <button
            onClick={openAddModal}
            className="bg-red-700 hover:bg-red-800 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Thêm Thành Viên BCH</span>
          </button>
        </div>
      </div>

      {/* Leadership Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {listBch.slice(0, 3).map((lead, idx) => (
          <div
            key={lead.id}
            className="p-5 rounded-2xl bg-gradient-to-br from-red-900 via-red-800 to-red-950 text-white shadow-md relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute right-2 top-2 text-yellow-400/20 text-5xl font-black">
              #{idx + 1}
            </div>
            <div>
              <span className="inline-block bg-yellow-400 text-red-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                {lead.chucVu}
              </span>
              <h3 className="text-xl font-black">{lead.hoTen}</h3>
              <div className="text-xs text-red-200 mt-0.5">
                Chi đội: <b className="text-white">{lead.lop}</b> • Nhiệm kỳ: {lead.nhiemKy}
              </div>
              <p className="text-xs text-red-100 mt-2 line-clamp-2 leading-relaxed">
                {lead.nhiemVu}
              </p>
            </div>
            <div className="pt-3 border-t border-red-700/60 mt-3 flex justify-between items-center text-xs">
              <span className="text-[10px] bg-red-950/80 text-yellow-300 font-bold px-2 py-0.5 rounded border border-yellow-400/30">
                {lead.ketQua}
              </span>
              <button
                onClick={() => openEditModal(lead)}
                className="text-xs text-yellow-300 font-bold hover:underline"
              >
                Cập nhật
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print-card">
        <div className="p-3 bg-slate-900 text-white flex justify-between items-center text-xs">
          <span className="font-bold flex items-center space-x-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>DANH SÁCH KIỆN TOÀN BAN CHỈ HUY LIÊN ĐỘI ({listBch.length} thành viên)</span>
          </span>
          <span className="text-[11px] text-slate-300">
            Nhiệm kỳ 2026–2027 • Trường PTDTBT THCS Đường Hồng
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 text-[11px]">
                <th className="p-3 w-12 text-center">STT</th>
                <th className="p-3">Họ và Tên</th>
                <th className="p-3">Chi Đội</th>
                <th className="p-3">Chức Vụ Ban Chỉ Huy</th>
                <th className="p-3">Nhiệm Kỳ</th>
                <th className="p-3">Nhiệm Vụ Được Giao</th>
                <th className="p-3 text-center">Kết Quả Đánh Giá</th>
                <th className="p-3 text-center no-print w-20">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listBch.map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-bold text-slate-900 text-sm">{m.hoTen}</td>
                  <td className="p-3 font-black text-red-700">Chi đội {m.lop}</td>
                  <td className="p-3 font-bold text-slate-800">
                    <span className="inline-block bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                      {m.chucVu}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{m.nhiemKy}</td>
                  <td className="p-3 text-slate-700 leading-relaxed max-w-xs">{m.nhiemVu}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        m.ketQua === 'Hoàn thành xuất sắc'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : m.ketQua === 'Hoàn thành tốt'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {m.ketQua}
                    </span>
                  </td>
                  <td className="p-3 text-center no-print">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-1 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Sửa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(m.id, m.hoTen)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT BCH MEMBER */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scale-up">
            <div className="bg-red-800 px-5 py-3.5 text-white flex justify-between items-center">
              <h3 className="font-black text-sm uppercase tracking-wide flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-yellow-300" />
                <span>{editingMember ? 'Cập Nhật Thành Viên BCH' : 'Thêm Thành Viên BCH Liên Đội'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ Và Tên Học Sinh *</label>
                <input
                  type="text"
                  required
                  value={hoTen}
                  onChange={(e) => setHoTen(e.target.value)}
                  placeholder="Ví dụ: Hoàng Thị Mơ"
                  className="w-full border rounded-lg p-2 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chi Đội (17 Lớp) *</label>
                  <select
                    value={lop}
                    onChange={(e) => setLop(e.target.value)}
                    className="w-full border rounded-lg p-2 font-bold"
                  >
                    {CLASS_DEFINITIONS.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name} ({c.diemTruong})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nhiệm Kỳ *</label>
                  <input
                    type="text"
                    required
                    value={nhiemKy}
                    onChange={(e) => setNhiemKy(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chức Vụ Trong BCH *</label>
                <select
                  value={chucVu}
                  onChange={(e) => setChucVu(e.target.value)}
                  className="w-full border rounded-lg p-2 font-bold"
                >
                  <option value="Liên đội trưởng">Liên đội trưởng</option>
                  <option value="Liên đội phó thường trực">Liên đội phó thường trực</option>
                  <option value="Liên đội phó">Liên đội phó</option>
                  <option value="Trưởng ban Đội Cờ đỏ">Trưởng ban Đội Cờ đỏ</option>
                  <option value="Trưởng ban Học tập & Búp măng">Trưởng ban Học tập & Búp măng</option>
                  <option value="Trưởng ban Văn thể mỹ & Bán trú">Trưởng ban Văn thể mỹ & Bán trú</option>
                  <option value="Ủy viên BCH Liên đội">Ủy viên BCH Liên đội</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nhiệm Vụ Được Giao</label>
                <textarea
                  rows={2}
                  value={nhiemVu}
                  onChange={(e) => setNhiemVu(e.target.value)}
                  placeholder="Mô tả quyền hạn, mảng phụ trách..."
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kết Quả Thực Hiện Nhiệm Vụ</label>
                <select
                  value={ketQua}
                  onChange={(e) => setKetQua(e.target.value as any)}
                  className="w-full border rounded-lg p-2 font-bold"
                >
                  <option value="Hoàn thành xuất sắc">Hoàn thành xuất sắc</option>
                  <option value="Hoàn thành tốt">Hoàn thành tốt</option>
                  <option value="Đang thực hiện">Đang thực hiện</option>
                  <option value="Chưa đánh giá">Chưa đánh giá</option>
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-black rounded-xl shadow-md"
                >
                  {editingMember ? 'Lưu Thay Đổi' : 'Thêm Thành Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
