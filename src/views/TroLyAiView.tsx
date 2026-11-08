import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Video,
  FileText,
  Sparkles,
  Copy,
  CheckCircle2,
  Download,
  FolderPlus,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Film,
  Layers,
  Calendar,
  DollarSign,
  Gamepad2,
  Volume2,
  Trash2,
} from 'lucide-react';
import { AppState, ChatMessage, GeneratedVideo } from '../types';
import { CLASS_DEFINITIONS } from '../data/initialData';

interface TroLyAiViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  hocKy: 'HK1' | 'HK2' | 'CA_NAM';
  selectedWeek: number;
}

export const TroLyAiView: React.FC<TroLyAiViewProps> = ({
  appState,
  setAppState,
  hocKy,
  selectedWeek,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'video'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial friendly greeting from the AI assistant
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Kính chào đồng chí **Lộc Quốc Cường** - Giáo viên Tổng phụ trách Đội Liên đội Trường PTDTBT THCS Đường Hồng! 👋

Tôi là **Trợ lý AI Nghiệp vụ Công tác Đội**, sẵn sàng đồng hành cùng đồng chí trong mọi nhiệm vụ năm học 2026–2027:

1. 📋 **Soạn thảo Kế hoạch**: Kế hoạch công tác năm, tháng, tuần, đại hội chi đội/liên đội, kế hoạch nhỏ.
2. 🎤 **Kịch bản & Lời dẫn**: Kịch bản dẫn chương trình (MC) Lễ Chào cờ đầu tuần, Lễ Kết nạp Đội viên, Đại hội Liên đội, bài phát biểu kỷ niệm 20/11, 22/12, 26/3, 15/5.
3. 📊 **Báo cáo & Thi đua**: Báo cáo sơ kết/tổng kết dựa trên số liệu thực tế của **17 Chi đội** (8 lớp Trường chính, 9 lớp Phân hiệu) và khu Bán trú.
4. 📝 **Biểu mẫu Hành chính**: Quyết định công nhận Ban Chỉ huy Liên đội, tờ trình kinh phí, biên bản kiểm tra, công văn triệu tập.
5. 💰 **Dự trù kinh phí & Phân công**: Lập bảng dự trù ngân sách hoạt động Đội, bảng phân công nhiệm vụ chi tiết.
6. 🎮 **Trò chơi & Kỹ năng**: Trò chơi sinh hoạt tập thể dân gian, câu đố giao lưu, múa hát tập thể phù hợp với học sinh dân tộc thiểu số vùng cao.

📌 *Đặc biệt: Hệ thống tuân thủ nghiêm ngặt thể thức hành chính giáo dục, đánh dấu rõ ràng giữa "[NGUỒN CHÍNH THỨC]" và "[ĐỀ XUẤT THAM KHẢO]", đồng thời ghi chú "[CẦN XÁC NHẬN: ...]" đối với các thông tin chưa rõ.*

Đồng chí cần hỗ trợ soạn thảo nội dung gì hôm nay? Hãy chọn gợi ý nhanh bên dưới hoặc nhập yêu cầu trực tiếp!`,
        timestamp: 'Vừa xong',
        model: 'gemini-3.8-flash',
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [includeContext, setIncludeContext] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveHoSoSuccess, setSaveHoSoSuccess] = useState<string | null>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Video generation state
  const [videoPrompt, setVideoPrompt] = useState<string>('');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Context preparation
  const getContextPayload = () => {
    if (!includeContext) return null;

    let tongSiSoThucTe = 0;
    let soLopDaNhap = 0;
    Object.values(appState.classesData).forEach((c) => {
      if (c.siso) {
        tongSiSoThucTe += Number(c.siso);
        soLopDaNhap++;
      }
    });

    const suViecTuan = appState.listSuViec.filter(
      (s) => s.tuan === selectedWeek && (s.hocKy === hocKy || hocKy === 'CA_NAM')
    );

    return {
      schoolName: appState.schoolConfig.schoolName,
      location: appState.schoolConfig.location,
      tptName: appState.schoolConfig.tptName,
      schoolYear: appState.schoolConfig.schoolYear,
      hocKy,
      selectedWeek,
      projectedStudents: appState.schoolConfig.projectedStudents,
      totalActualStudents: soLopDaNhap > 0 ? `${tongSiSoThucTe} em (${soLopDaNhap}/17 lớp)` : 'Chưa nhập',
      classesSummary: 'Trường chính (8 Chi đội: 6A, 6B, 7A, 7B, 8A, 8B, 9A, 9B); Phân hiệu (9 Chi đội: 6C, 6D, 7C, 7D, 8C, 8D, 9C, 9D, 9E).',
      eventsSummary: suViecTuan.length > 0
        ? `Đã ghi nhận ${suViecTuan.length} vụ việc trong Tuần ${selectedWeek}: ${suViecTuan.map((s) => `${s.lop}: ${s.hocSinh} (${s.tieuChi}, ${s.diem}đ)`).join('; ')}`
        : `Tuần ${selectedWeek} toàn trường duy trì nề nếp tốt, chưa có vi phạm nghiêm trọng.`,
      codoSummary: `Đội cờ đỏ có ${appState.listCoDo.length} thành viên tham gia giám sát các ca trực tại Cổng trường và Khu bán trú 2 điểm trường.`,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputPrompt).trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          contextData: getContextPayload(),
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi gửi yêu cầu đến AI');
      }

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'Không có phản hồi từ mô hình.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        model: data.model || selectedModel,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Đã xảy ra lỗi:** ${err.message || 'Không thể kết nối với dịch vụ Gemini AI'}. Vui lòng thử lại.`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Microphone Audio Recording & Transcribing via gemini-3.5-transcribe
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());

        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const res = await fetch('/api/ai/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Audio,
                mimeType: 'audio/webm',
              }),
            });

            const data = await res.json();
            if (res.ok && data.text) {
              setInputPrompt((prev) => (prev ? `${prev} ${data.text}` : data.text));
            } else {
              alert(`Lỗi phiên âm: ${data.error || 'Không nhận diện được giọng nói'}`);
            }
            setIsTranscribing(false);
          };
          reader.readAsDataURL(audioBlob);
        } catch (e: any) {
          alert('Lỗi xử lý file ghi âm: ' + e.message);
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      alert('Không thể truy cập microphone: ' + (err.message || 'Vui lòng cấp quyền micro trong trình duyệt'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Video Generation via gemini-omni-1.1-flash
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || isVideoLoading) return;
    setIsVideoLoading(true);
    setVideoError(null);

    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt.trim(),
          aspectRatio: videoAspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi tạo video bằng gemini-omni-1.1-flash');
      }

      const newVid: GeneratedVideo = {
        id: `vid-${Date.now()}`,
        prompt: videoPrompt.trim(),
        url: data.videoUrl,
        aspectRatio: data.aspectRatio,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setGeneratedVideos((prev) => [newVid, ...prev]);
      setVideoPrompt('');
    } catch (e: any) {
      setVideoError(e.message || 'Không thể tạo video');
    } finally {
      setIsVideoLoading(false);
    }
  };

  // Save AI Document directly into one of the 8 Record Groups
  const handleSaveToHoSoGroup = (content: string, titleHint: string) => {
    const groupIdStr = window.prompt(
      'Chọn Nhóm Hồ Sơ Số Hóa để lưu tài liệu này (nhập số từ 1 đến 8):\n' +
        '1: Hồ sơ tổ chức Liên đội, BCH\n' +
        '2: Hồ sơ Chi đội (17 Chi đội)\n' +
        '3: Kế hoạch, chương trình & báo cáo\n' +
        '4: Rèn luyện đội viên, kết nạp\n' +
        '5: Phong trào / Kế hoạch nhỏ\n' +
        '6: Phân công Đội Cờ đỏ\n' +
        '7: Biên bản, Nghị quyết, Đại hội\n' +
        '8: Thi đua, Khen thưởng',
      '3'
    );

    if (!groupIdStr) return;
    const gId = parseInt(groupIdStr);
    if (isNaN(gId) || gId < 1 || gId > 8) {
      alert('Vui lòng nhập số từ 1 đến 8 hợp lệ!');
      return;
    }

    const docTitle = window.prompt('Nhập tiêu đề lưu văn bản:', titleHint || 'Văn bản do Trợ lý AI soạn thảo');
    if (!docTitle) return;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())} ngày ${pad(
      now.getDate()
    )}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    // Convert text to a downloadable data URL as .txt/.doc
    const textBlob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      setAppState((prev) => ({
        ...prev,
        hoSoGroups: prev.hoSoGroups.map((g) => {
          if (g.id === gId) {
            return {
              ...g,
              items: [
                {
                  id: Date.now(),
                  tieuDe: docTitle,
                  noiDung: content.slice(0, 200) + '...',
                  thoiGian: timeStr,
                  fileName: `${docTitle.replace(/[\s/\\?%*:|"<>]/g, '_')}.txt`,
                  fileData: dataUrl,
                  fileSize: `${(content.length / 1024).toFixed(1)} KB`,
                },
                ...(g.items || []),
              ],
            };
          }
          return g;
        }),
      }));

      setSaveHoSoSuccess(`Đã lưu thành công vào Nhóm Hồ Sơ số ${gId}!`);
      setTimeout(() => setSaveHoSoSuccess(null), 3000);
    };
    reader.readAsDataURL(textBlob);
  };

  const handleCopyText = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownloadDoc = (content: string, defaultName: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${defaultName.replace(/[\s/\\?%*:|"<>]/g, '_')}_THCS_DuongHong.txt`;
    link.click();
  };

  // Format AI text with badges for tags
  const renderFormattedContent = (content: string) => {
    // Replace markers with styled badges
    const parts = content.split(/(\[NGUỒN CHÍNH THỨC\]|\[ĐỀ XUẤT THAM KHẢO\]|\[CẦN XÁC NHẬN:[^\]]+\])/g);

    return parts.map((part, index) => {
      if (part === '[NGUỒN CHÍNH THỨC]') {
        return (
          <span
            key={index}
            className="inline-flex items-center space-x-1 px-2 py-0.5 my-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs mr-1"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-700 inline" />
            <span>NGUỒN CHÍNH THỨC</span>
          </span>
        );
      }
      if (part === '[ĐỀ XUẤT THAM KHẢO]') {
        return (
          <span
            key={index}
            className="inline-flex items-center space-x-1 px-2 py-0.5 my-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs mr-1"
          >
            <Sparkles className="w-3 h-3 text-blue-700 inline" />
            <span>ĐỀ XUẤT THAM KHẢO</span>
          </span>
        );
      }
      if (part.startsWith('[CẦN XÁC NHẬN:')) {
        return (
          <span
            key={index}
            className="inline-flex items-center space-x-1 px-2.5 py-0.5 my-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs mr-1"
          >
            <AlertCircle className="w-3 h-3 text-amber-700 inline" />
            <span>{part.replace('[', '').replace(']', '')}</span>
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 text-white p-5 rounded-2xl shadow-lg border border-red-700/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 text-xs font-black uppercase tracking-wider mb-1">
            <Bot className="w-5 h-5 text-yellow-400" />
            <span>Trợ Lý Số AI Nghiệp Vụ Công Tác Đội TNTP Hồ Chí Minh</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Trợ Lý Chuyên Môn Phục Vụ TPT Lộc Quốc Cường
          </h2>
          <p className="text-xs text-red-100 mt-1 max-w-2xl leading-relaxed">
            Tự động soạn thảo kế hoạch, báo cáo từ số liệu thật, kịch bản MC, biên bản họp, biểu mẫu hành chính giáo dục, tuân thủ Hướng dẫn 283-HD/HĐĐTW và hỗ trợ học sinh THCS vùng cao Đường Hồng.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/20 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition ${
              activeSubTab === 'chat'
                ? 'bg-red-700 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Trò Chuyện & Soạn Thảo</span>
          </button>

          <button
            onClick={() => setActiveSubTab('video')}
            className={`px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition ${
              activeSubTab === 'video'
                ? 'bg-red-700 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4 text-yellow-300" />
            <span>Tạo Video Minh Họa</span>
          </button>
        </div>
      </div>

      {saveHoSoSuccess && (
        <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{saveHoSoSuccess}</span>
        </div>
      )}

      {/* SUB-TAB 1: MULTI-TURN CHAT & DOCUMENT DRAFTING */}
      {activeSubTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[75vh] overflow-hidden">
          {/* Controls Bar: Model & Context Toggle */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-600">Mô hình AI:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-red-600"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Tiêu chuẩn, Khuyên dùng)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Phản hồi siêu nhanh)</option>
                  <option value="gemini-4-argon">gemini-4-argon (Suy luận chuyên sâu cao cấp)</option>
                </select>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer font-bold select-none">
                <input
                  type="checkbox"
                  checked={includeContext}
                  onChange={(e) => setIncludeContext(e.target.checked)}
                  className="rounded text-red-700 focus:ring-red-600 w-4 h-4"
                />
                <span
                  className={includeContext ? 'text-emerald-700' : 'text-slate-500'}
                  title="Tự động nạp số liệu 17 Chi đội, Sĩ số 655 HS, Thi đua tuần hiện tại"
                >
                  ⚡ Đính kèm số liệu 17 Chi đội & Tuần {selectedWeek}
                </span>
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (window.confirm('Bạn có muốn xóa lịch sử cuộc trò chuyện hiện tại?')) {
                    setMessages([messages[0]]);
                  }
                }}
                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition"
                title="Xóa đoạn hội thoại"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips Bar */}
          <div className="px-3 py-2 bg-slate-100/80 border-b border-slate-200 overflow-x-auto whitespace-nowrap custom-scrollbar flex items-center space-x-2 text-[11px]">
            <span className="font-bold text-slate-500 flex items-center space-x-1 pl-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gợi ý mẫu:</span>
            </span>

            <button
              onClick={() =>
                handleSendMessage(
                  'Soạn giúp tôi Kế hoạch tổ chức các hoạt động chào mừng ngày Nhà giáo Việt Nam 20/11 cho 17 Chi đội THCS Đường Hồng, bao gồm phong trào thi đua tuần, hội thi văn nghệ vùng cao và làm báo tường.'
                )
              }
              className="px-2.5 py-1 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold rounded-lg border border-slate-200 transition"
            >
              📋 Kế hoạch 20/11
            </button>

            <button
              onClick={() =>
                handleSendMessage(
                  `Dựa trên số liệu Tuần ${selectedWeek} của 17 Chi đội và nề nếp bán trú, hãy dự thảo Báo cáo thi đua tuần gửi Ban Giám hiệu và các thầy cô GVCN.`
                )
              }
              className="px-2.5 py-1 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold rounded-lg border border-slate-200 transition"
            >
              📊 Báo cáo Tuần {selectedWeek} từ số liệu thật
            </button>

            <button
              onClick={() =>
                handleSendMessage(
                  'Soạn kịch bản MC điều hành Lễ Chào cờ đầu tuần trang trọng cho 2 em học sinh Ban Chỉ huy Liên đội dẫn, có phần nhận xét thi đua và phát động phong trào mới.'
                )
              }
              className="px-2.5 py-1 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold rounded-lg border border-slate-200 transition"
            >
              🎤 Kịch bản MC Chào cờ
            </button>

            <button
              onClick={() =>
                handleSendMessage(
                  'Soạn mẫu Quyết định thành lập Ban Chỉ huy Liên đội năm học 2026-2027 đúng thể thức văn bản hành chính giáo dục.'
                )
              }
              className="px-2.5 py-1 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold rounded-lg border border-slate-200 transition"
            >
              📝 Quyết định BCH Liên đội
            </button>

            <button
              onClick={() =>
                handleSendMessage(
                  'Lập bảng dự trù kinh phí tổ chức Đại hội Liên đội nhiệm kỳ 2026-2027 với quy mô 655 học sinh tại 2 điểm trường, chi tiết từng khoản mục hợp lý.'
                )
              }
              className="px-2.5 py-1 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold rounded-lg border border-slate-200 transition"
            >
              💰 Dự trù kinh phí Đại hội
            </button>

            <button
              onClick={() =>
                handleSendMessage(
                  'Gợi ý 5 trò chơi tập thể dân gian gắn kết học sinh nội trú bán trú vùng cao trong giờ ra chơi và sinh hoạt Đội.'
                )
              }
              className="px-2.5 py-1 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold rounded-lg border border-slate-200 transition"
            >
              🎮 5 Trò chơi bán trú
            </button>
          </div>

          {/* Scrollable Message Thread */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 shadow-xs space-y-2 text-xs leading-relaxed ${
                      isAssistant
                        ? 'bg-white border border-slate-200 text-slate-800'
                        : 'bg-red-800 text-white'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-1.5 gap-2 border-slate-100 text-[10px]">
                      <div className="flex items-center space-x-1.5 font-bold">
                        {isAssistant ? (
                          <>
                            <Bot className="w-3.5 h-3.5 text-red-700" />
                            <span className="text-red-800">Trợ Lý AI Nghiệp Vụ Đội</span>
                            {msg.model && (
                              <span className="bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded text-[9px]">
                                {msg.model}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-red-100 font-bold">
                            {appState.schoolConfig.tptName} (TPT)
                          </span>
                        )}
                      </div>
                      <span className={isAssistant ? 'text-slate-400' : 'text-red-200'}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="whitespace-pre-line font-normal break-words selection:bg-yellow-200 selection:text-slate-900">
                      {isAssistant ? renderFormattedContent(msg.content) : msg.content}
                    </div>

                    {/* Assistant Action Buttons */}
                    {isAssistant && msg.id !== 'msg-welcome' && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] no-print">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center space-x-1"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Đã sao chép!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            handleSaveToHoSoGroup(msg.content, msg.content.slice(0, 40))
                          }
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold transition flex items-center space-x-1"
                          title="Lưu văn bản này trực tiếp vào 8 Nhóm Hồ Sơ Số Hóa"
                        >
                          <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lưu vào 8 Nhóm Hồ Sơ</span>
                        </button>

                        <button
                          onClick={() =>
                            handleDownloadDoc(msg.content, 'Van_Ban_Nghiep_Vu_Doi')
                          }
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold transition flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-600" />
                          <span>Tải file văn bản (.txt)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3 text-xs text-slate-600">
                  <div className="w-5 h-5 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                  <span className="font-bold text-red-800">
                    Trợ lý AI đang tra cứu quy định và dự thảo văn bản nghiệp vụ...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Box & Voice Recording */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            {isRecording && (
              <div className="p-2 bg-red-50 border border-red-300 rounded-xl flex items-center justify-between text-xs text-red-800 font-bold animate-pulse">
                <span className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
                  <span>Đang ghi âm giọng nói của Thầy... Hãy nói nội dung cần trợ lý soạn thảo.</span>
                </span>
                <button
                  onClick={stopRecording}
                  className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded-lg text-xs font-black shadow-xs"
                >
                  Dừng & Phiên âm
                </button>
              </div>
            )}

            {isTranscribing && (
              <div className="p-2 bg-amber-50 border border-amber-300 rounded-xl flex items-center space-x-2 text-xs text-amber-900 font-bold">
                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <span>Mô hình gemini-3.5-transcribe đang chuyển đổi giọng nói sang văn bản...</span>
              </div>
            )}

            <div className="flex items-end space-x-2">
              <div className="relative flex-1">
                <textarea
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  placeholder="Nhập yêu cầu soạn thảo văn bản, kịch bản, kế hoạch, hoặc bấm Micro để nói..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white resize-none"
                />
              </div>

              {/* Voice button */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-xl shadow-xs transition flex-shrink-0 flex items-center justify-center ${
                  isRecording
                    ? 'bg-red-600 text-white ring-4 ring-red-200 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
                title="Ghi âm bằng microphone và chuyển sang văn bản bằng gemini-3.5-transcribe"
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-red-700" />}
              </button>

              {/* Send button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputPrompt.trim()}
                className="bg-red-700 hover:bg-red-800 disabled:bg-slate-300 text-white font-black text-xs px-5 py-3 rounded-xl shadow-md transition flex items-center space-x-1.5 flex-shrink-0 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Gửi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: VIDEO GENERATION (gemini-omni-1.1-flash via Interactions API) */}
      {activeSubTab === 'video' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-red-700 uppercase tracking-wide">
              <Film className="w-4 h-4 text-yellow-500" />
              <span>Tạo Video Minh Họa Hoạt Động Đội (Mô hình gemini-omni-1.1-flash)</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 mt-1">
              Sáng Tạo Video Clip Hoạt Động Đội & Phong Trào Thiếu Nhi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỗ trợ tạo video minh họa cho Lễ Chào cờ, Lễ Kết nạp Đội viên, Hội trại truyền thống và hoạt động múa hát bán trú theo tỷ lệ 16:9 hoặc 9:16.
            </p>
          </div>

          {videoError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <b className="block">Thông báo khi tạo video:</b>
                <span>{videoError}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tỷ Lệ Khung Hình Video (Aspect Ratio) *
              </label>
              <div className="flex items-center space-x-3 text-xs">
                <button
                  type="button"
                  onClick={() => setVideoAspectRatio('16:9')}
                  className={`px-4 py-2 rounded-xl font-bold border transition flex items-center space-x-2 ${
                    videoAspectRatio === '16:9'
                      ? 'bg-red-700 text-white border-red-700 shadow-xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>16:9 (Màn hình ngang / Máy chiếu trường học)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoAspectRatio('9:16')}
                  className={`px-4 py-2 rounded-xl font-bold border transition flex items-center space-x-2 ${
                    videoAspectRatio === '9:16'
                      ? 'bg-red-700 text-white border-red-700 shadow-xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Film className="w-4 h-4 rotate-90" />
                  <span>9:16 (Màn hình dọc / Video Zalo, TikTok, Shorts)</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Mô Tả Cảnh Video Muốn Tạo *
                </label>
                <span className="text-[11px] text-slate-400">Mô tả sinh động, chi tiết</span>
              </div>
              <textarea
                rows={3}
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="Ví dụ: Cảnh học sinh THCS dân tộc vùng cao đeo khăn quàng đỏ tươi, trang nghiêm thực hiện nghi lễ chào cờ dưới bóng cờ Tổ quốc trên sân trường miền núi..."
                className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            {/* Prompt presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500">Gợi ý chủ đề video:</span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    setVideoPrompt(
                      'Học sinh THCS dân tộc bán trú xếp hàng ngay ngắn tập thể dục buổi sáng và múa hát tập thể vui tươi tại sân trường miền núi Tuyên Quang.'
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold border border-slate-200"
                >
                  🏔️ Múa hát tập thể bán trú
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setVideoPrompt(
                      'Đội viên Đội Cờ đỏ đeo băng đỏ kiểm tra nề nếp trang phục khăn quàng và hỗ trợ các bạn học sinh vào cổng trường đúng giờ.'
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold border border-slate-200"
                >
                  🚩 Đội Cờ đỏ trực cổng trường
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setVideoPrompt(
                      'Hội trại măng non rực rỡ cờ hoa, các em thiếu nhi tham gia thi cắm trại và đốt lửa trại truyền thống ấm cúng.'
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold border border-slate-200"
                >
                  ⛺ Hội trại Măng non truyền thống
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateVideo}
              disabled={isVideoLoading || !videoPrompt.trim()}
              className="w-full py-3 bg-red-700 hover:bg-red-800 disabled:bg-slate-300 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              {isVideoLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mô hình gemini-omni-1.1-flash đang khởi tạo video (có thể mất 1–2 phút)...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4 text-yellow-300" />
                  <span>Tạo Video Bằng AI (gemini-omni-1.1-flash)</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Videos Gallery */}
          {generatedVideos.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="font-black text-sm text-slate-800 uppercase tracking-wide flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Video Đã Tạo Thành Công ({generatedVideos.length})</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedVideos.map((vid) => (
                  <div
                    key={vid.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs space-y-3"
                  >
                    <div className="flex justify-between items-start text-xs font-bold text-slate-800">
                      <span className="line-clamp-2">{vid.prompt}</span>
                      <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
                        {vid.aspectRatio}
                      </span>
                    </div>

                    <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center">
                      <video
                        src={vid.url}
                        controls
                        className={`w-full max-h-72 object-contain ${
                          vid.aspectRatio === '9:16' ? 'max-w-[200px] mx-auto' : ''
                        }`}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>{vid.timestamp}</span>
                      <a
                        href={vid.url}
                        download={`Video_Doi_${vid.id}.mp4`}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải video về máy</span>
                      </a>
                    </div>
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
