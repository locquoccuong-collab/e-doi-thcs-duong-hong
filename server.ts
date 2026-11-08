import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Body parsers with generous limits for audio/video uploads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Shared Gemini client utility
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_SYSTEM_INSTRUCTION = `Bạn là Trợ lý AI Chuyên gia Nghiệp vụ Công tác Đội Thiếu niên Tiền phong Hồ Chí Minh, hỗ trợ trực tiếp đồng chí Lộc Quốc Cường - Giáo viên Tổng phụ trách Đội (TPT) tại Liên đội Trường Phổ thông Dân tộc Bán trú (PTDTBT) THCS Đường Hồng, xã Đường Hồng, Tuyên Quang.

THÔNG TIN ĐƠN VỊ VÀ ĐẶC THÙ ĐỊA BÀN:
- Tên đơn vị: Liên đội Trường PTDTBT THCS Đường Hồng, xã Đường Hồng, Tuyên Quang.
- Giáo viên Tổng phụ trách Đội: Lộc Quốc Cường.
- Năm học: 2026-2027.
- Quy mô: Đúng chuẩn 17 Chi đội THCS (tuyệt đối không có khối Tiểu học 1-5 hay Sao nhi đồng):
  + Trường chính (8 Chi đội): 6A, 6B, 7A, 7B, 8A, 8B, 9A, 9B.
  + Phân hiệu (9 Chi đội): 6C, 6D, 7C, 7D, 8C, 8D, 9C, 9D, 9E (Lưu ý: Lớp 8C thuộc Phân hiệu).
- Học sinh dự kiến: 655 em. Phần lớn học sinh là con em đồng bào dân tộc thiểu số vùng cao, nhiều em ăn ở sinh hoạt tại khu nội trú bán trú của nhà trường.

NHIỆM VỤ CỦA TRỢ LÝ:
1. Soạn thảo kế hoạch công tác Đội năm học, tháng, tuần và từng hoạt động cụ thể.
2. Soạn báo cáo sơ kết, tổng kết, báo cáo chuyên đề và báo cáo thi đua tuần/tháng/kỳ.
3. Soạn chương trình, kịch bản MC, bài phát biểu, lời dẫn, câu hỏi giao lưu và trò chơi tập thể cho học sinh THCS.
4. Soạn biên bản họp, biên bản bàn giao, quyết định, tờ trình, thông báo và các biểu mẫu hành chính Đội.
5. Hỗ trợ xây dựng nội dung Đại hội Liên đội, sinh hoạt dưới cờ thứ Hai, hoạt động theo chủ điểm và phong trào thiếu nhi.
6. Hỗ trợ lập dự trù kinh phí, bảng phân công nhiệm vụ, lịch hoạt động và bảng kiểm tra tiến độ.
7. Tổng hợp các số liệu thực tế được cung cấp để dự thảo văn bản chính xác nhất.
8. Tự động phát hiện những nội dung còn thiếu, số liệu chưa thống nhất hoặc các mục cần người dùng bổ sung/xác nhận.

NGUYÊN TẮC VĂN PHONG VÀ TRÍCH DẪN:
- Sử dụng văn phong hành chính giáo dục chuẩn mực, trang trọng, trình bày rõ ràng, đúng chính tả, phù hợp tâm lý lứa tuổi học sinh THCS và điều kiện trường PTDTBT vùng miền núi.
- Khi viện dẫn văn bản pháp luật, công văn hoặc hướng dẫn của Hội đồng Đội, PHẢI kiểm tra nguồn, số hiệu, ngày ban hành và phạm vi áp dụng (ví dụ: Hướng dẫn số 283-HD/HĐĐTW ngày 17/9/2026 của Hội đồng Đội Trung ương về số hóa hồ sơ công tác Đội; Điều lệ Đội TNTP Hồ Chí Minh; 5 điều Bác Hồ dạy...). KHÔNG tự bịa đặt số hiệu, nội dung quy định hoặc số liệu thành tích.
- BẮT BUỘC phân biệt rõ ràng:
  + Dùng nhãn [NGUỒN CHÍNH THỨC] khi viện dẫn văn bản chuẩn hoặc số liệu do người dùng cung cấp.
  + Dùng nhãn [ĐỀ XUẤT THAM KHẢO] cho nội dung gợi ý, kịch bản hoặc ý tưởng do AI đề xuất.
  + Dùng nhãn [CẦN XÁC NHẬN: ...] để đánh dấu rõ các thông tin còn thiếu, chưa xác minh hoặc số liệu cần TPT kiểm tra trước khi ban hành.`;

// 1. Multi-turn AI Assistant Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, contextData, model = 'gemini-3.8-flash' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Danh sách tin nhắn không hợp lệ' });
    }

    // Build context summary if provided
    let contextPrompt = '';
    if (contextData) {
      contextPrompt = `\n\n[DỮ LIỆU HIỆN HÀNH TẠI TRƯỜNG PTDTBT THCS ĐƯỜNG HỒNG]:
- Năm học: ${contextData.schoolYear || '2026-2027'} (${contextData.hocKy || 'HK1'}, Tuần ${contextData.selectedWeek || 8})
- Tổng học sinh dự kiến: ${contextData.projectedStudents || 655} em
- Tổng sĩ số thực tế đã nhập: ${contextData.totalActualStudents || 'Đang cập nhật'} em
- Tình hình 17 Chi đội: ${contextData.classesSummary || '8 lớp Trường chính, 9 lớp Phân hiệu'}
- Sự việc/vi phạm ghi nhận trong tuần: ${contextData.eventsSummary || 'Nền nếp ổn định'}
- Đội cờ đỏ: ${contextData.codoSummary || 'Đang duy trì các ca trực'}\n`;
    }

    // Prepare contents array for generateContent
    // Map previous user/assistant messages
    const contents = messages.map((m: { role: string; content: string }, index: number) => {
      const isLast = index === messages.length - 1;
      let text = m.content;
      if (isLast && m.role === 'user' && contextPrompt) {
        text = `${m.content}${contextPrompt}`;
      }
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text }],
      };
    });

    const chosenModel = model || 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model: chosenModel,
      contents,
      config: {
        systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return res.json({
      text: response.text || '',
      model: chosenModel,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return res.status(500).json({
      error: error.message || 'Lỗi khi kết nối với Trợ lý AI Gemini',
    });
  }
});

// 2. Transcribe Audio endpoint (gemini-3.5-transcribe)
app.post('/api/ai/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Không tìm thấy dữ liệu âm thanh để chuyển văn bản' });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/[a-z0-9]+;base64,/, '');

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Hãy lắng nghe và phiên âm chính xác toàn bộ lời nói bằng tiếng Việt. Giữ nguyên ngữ nghĩa, tên riêng học sinh, tên chi đội (ví dụ 6A, 8C, Phân hiệu) và các thuật ngữ công tác Đội. Trả về đúng nội dung văn bản thuần túy.',
          },
        ],
      },
    });

    return res.json({
      text: response.text || '',
    });
  } catch (error: any) {
    console.error('Error in /api/ai/transcribe:', error);
    return res.status(500).json({
      error: error.message || 'Lỗi khi phiên âm giọng nói qua mô hình gemini-3.5-transcribe',
    });
  }
});

// 3. Generate Video from text endpoint (gemini-omni-1.1-flash via Interactions API)
app.post('/api/ai/generate-video', async (req, res) => {
  try {
    const { prompt, aspectRatio = '16:9' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Vui lòng cung cấp mô tả để tạo video' });
    }

    const validAspect = aspectRatio === '9:16' ? '9:16' : '16:9';

    // Call Interactions API with gemini-omni-1.1-flash
    const interaction = await ai.interactions.create(
      {
        model: 'gemini-omni-1.1-flash',
        input: prompt,
        response_format: {
          type: 'video',
          aspect_ratio: validAspect,
        },
      },
      { timeout: 300000 }
    );

    const videoPart = interaction.output_video;
    if (videoPart && videoPart.data) {
      const mimeType = videoPart.mime_type || 'video/mp4';
      const videoDataUrl = `data:${mimeType};base64,${videoPart.data}`;
      return res.json({
        videoUrl: videoDataUrl,
        aspectRatio: validAspect,
      });
    }

    // If interaction finished but video wasn't in output_video
    return res.status(500).json({
      error: 'Không tìm thấy dữ liệu video trong kết quả phản hồi của mô hình.',
    });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-video:', error);
    return res.status(500).json({
      error:
        error.message ||
        'Lỗi khi tạo video bằng gemini-omni-1.1-flash. Lưu ý mô hình video yêu cầu cấu hình khóa API phù hợp.',
    });
  }
});

// Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
