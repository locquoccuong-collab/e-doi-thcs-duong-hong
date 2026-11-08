import mammoth from 'mammoth';

export interface ParseDocxResult {
  html: string;
  text: string;
  messages: string[];
}

/**
 * Converts a Word (.docx) array buffer to clean HTML and text
 */
export async function parseDocxBuffer(arrayBuffer: ArrayBuffer): Promise<ParseDocxResult> {
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    return {
      html: result.value || '',
      text: textResult.value || '',
      messages: result.messages.map((m: any) => m.message || String(m)),
    };
  } catch (error: any) {
    console.error('Error parsing docx file with mammoth:', error);
    return {
      html: `<div class="p-4 text-red-600 bg-red-50 rounded-xl">Không thể đọc nội dung tệp Word: ${error?.message || 'Định dạng tệp không hợp lệ'}</div>`,
      text: '',
      messages: [error?.message || 'Parse error'],
    };
  }
}
