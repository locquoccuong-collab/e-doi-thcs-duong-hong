import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, KeyRound, Lock, CheckCircle2, Archive } from 'lucide-react';
import { HocSinh } from '../../types';
import { verifyAdminPin } from '../../utils/authService';

interface ModalConfirmDeleteHocSinhProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentsToDelete: HocSinh[];
}

export const ModalConfirmDeleteHocSinh: React.FC<ModalConfirmDeleteHocSinhProps> = ({
  isOpen,
  onClose,
  onConfirm,
  studentsToDelete,
}) => {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen || studentsToDelete.length === 0) return null;

  const count = studentsToDelete.length;

  const handleExecuteDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    if (!/^\d{6}$/.test(pin)) {
      setPinError('Mã PIN bắt buộc phải gồm đúng 06 chữ số.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await verifyAdminPin(pin);
      if (!res.isValid) {
        setPinError(res.message);
        setIsVerifying(false);
        return;
      }

      // Valid PIN
      setIsVerifying(false);
      setPin('');
      setPinError(null);
      onConfirm();
    } catch (err: any) {
      setIsVerifying(false);
      setPinError('Lỗi kiểm tra mã PIN: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-scale-up">
        {/* Header */}
        <div className="bg-red-800 px-5 py-3.5 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-900/80 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide flex items-center space-x-1.5">
                <span>Xác Nhận Xóa {count} Học Sinh</span>
                <span className="bg-yellow-400 text-red-950 text-[10px] px-1.5 py-0.2 rounded font-black">
                  PIN 06 SỐ
                </span>
              </h3>
              <p className="text-[11px] text-red-200">
                Chuyển vào Thùng rác dữ liệu • Có thể khôi phục bất cứ lúc nào
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setPin('');
              setPinError(null);
              onClose();
            }}
            className="p-1 hover:bg-white/20 rounded-lg text-red-200 hover:text-white transition"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleExecuteDelete} className="p-5 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
          {/* Confirmation Prompt */}
          <div className="flex items-start space-x-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-black text-red-900 leading-snug">
                Thầy có chắc muốn xóa {count} học sinh đã chọn không?
              </div>
              <p className="text-[11px] text-red-700 mt-1 leading-relaxed">
                Để chống xóa nhầm và bảo vệ dữ liệu, hệ thống sẽ chuyển các học sinh này vào <b>Thùng rác dữ liệu</b>. Thầy/Cô có thể khôi phục lại bất kỳ lúc nào trong phân hệ <b>Quản trị Bảo Mật</b>.
              </p>
            </div>
          </div>

          {/* List of students to delete */}
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span>Danh sách học sinh sẽ xóa ({count} em):</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Kiểm tra kỹ trước khi xác nhận
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50 custom-scrollbar">
              {studentsToDelete.map((hs, idx) => (
                <div
                  key={hs.id || idx}
                  className="p-2 px-3 flex items-center justify-between hover:bg-white transition text-xs"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 w-6 text-center">
                      {idx + 1}.
                    </span>
                    <div className="truncate">
                      <span className="font-bold text-slate-900 block truncate">
                        {hs.hoTen}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Mã: {hs.maHs}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    <span className="font-black text-red-700 bg-red-100 px-2 py-0.5 rounded text-[10px]">
                      {hs.lop}
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded">
                      {hs.diemTruong}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6-Digit PIN Requirement Box */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-950 font-black text-xs uppercase">
              <KeyRound className="w-4 h-4 text-amber-700" />
              <span>Bắt Buộc Nhập Mã PIN ADMIN (06 Chữ Số):</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Nhập mã PIN 6 số quản trị của Thầy (Mặc định ban đầu: <code className="font-mono font-bold bg-amber-100 px-1 rounded">123456</code>) để phê duyệt thao tác xóa:
            </p>

            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setPinError(null);
              }}
              placeholder="●●●●●●"
              className="w-full p-2.5 bg-white border border-amber-400 rounded-xl font-mono text-center text-base tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              required
              autoFocus
            />

            {pinError && (
              <div className="text-[11px] font-bold text-red-700 bg-red-100 p-2 rounded-lg">
                ✗ {pinError}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end space-x-2.5 flex-shrink-0 -mx-5 -mb-5 mt-2">
            <button
              type="button"
              onClick={() => {
                setPin('');
                setPinError(null);
                onClose();
              }}
              className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-white transition text-xs cursor-pointer"
            >
              HỦY BỎ
            </button>
            <button
              type="submit"
              disabled={pin.length !== 6 || isVerifying}
              className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-black rounded-xl shadow-md transition text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isVerifying ? 'ĐANG XÁC THỰC PIN...' : `XÁC NHẬN XÓA (${count} HỌC SINH)`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
