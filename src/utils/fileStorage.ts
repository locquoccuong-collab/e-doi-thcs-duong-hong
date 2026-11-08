/**
 * IndexedDB File Storage for e-Đội THCS Đường Hồng
 * Manages persistent storage of large Word (.docx), PDF, images and evidence files
 * without overloading localStorage.
 */

const DB_NAME = 'eDoi_FileStorage_DB_v1';
const STORE_NAME = 'plan_and_evidence_files';
const DB_VERSION = 1;

interface StoredFileRecord {
  fileId: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  data: ArrayBuffer;
  updatedAt: number;
}

// In-memory fallback if IndexedDB is blocked or unavailable
const memoryFallbackMap = new Map<string, StoredFileRecord>();
const activeBlobUrls = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'fileId' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.warn('IndexedDB open error, falling back to in-memory store:', request.error);
      reject(request.error);
    };
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export interface SavedFileInfo {
  fileId: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  isPdf: boolean;
  isDocx: boolean;
  isImage: boolean;
  isExcel: boolean;
}

/**
 * Save a File or Blob into IndexedDB with an auto-generated or specified ID
 */
export async function saveFileToStorage(
  file: File | Blob,
  customFileName?: string,
  existingFileId?: string
): Promise<SavedFileInfo> {
  const fileId = existingFileId || `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const fileName =
    customFileName || (file instanceof File ? file.name : `tai_lieu_${Date.now()}`);
  const mimeType = file.type || 'application/octet-stream';
  const sizeBytes = file.size;
  const fileSize = formatFileSize(sizeBytes);

  const arrayBuffer = await file.arrayBuffer();

  const record: StoredFileRecord = {
    fileId,
    fileName,
    fileSize,
    mimeType,
    data: arrayBuffer,
    updatedAt: Date.now(),
  };

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed, using memory fallback:', err);
    memoryFallbackMap.set(fileId, record);
  }

  // Also cache in memory for instant retrieval
  memoryFallbackMap.set(fileId, record);

  const lowerName = fileName.toLowerCase();
  return {
    fileId,
    fileName,
    fileSize,
    mimeType,
    isPdf: lowerName.endsWith('.pdf') || mimeType.includes('pdf'),
    isDocx: lowerName.endsWith('.docx') || mimeType.includes('wordprocessingml'),
    isImage:
      mimeType.startsWith('image/') ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.webp'),
    isExcel: lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || mimeType.includes('spreadsheet'),
  };
}

/**
 * Retrieve a stored file by ID from IndexedDB
 */
export async function getFileFromStorage(
  fileId: string
): Promise<{ blob: Blob; fileName: string; mimeType: string; fileSize: string } | null> {
  let record: StoredFileRecord | undefined = memoryFallbackMap.get(fileId);

  if (!record) {
    try {
      const db = await openDatabase();
      record = await new Promise<StoredFileRecord | undefined>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.get(fileId);
        req.onsuccess = () => resolve(req.result as StoredFileRecord);
        req.onerror = () => reject(req.error);
      });
      if (record) {
        memoryFallbackMap.set(fileId, record);
      }
    } catch (err) {
      console.warn('IndexedDB get failed:', err);
    }
  }

  if (!record || !record.data) return null;

  const blob = new Blob([record.data], { type: record.mimeType });
  return {
    blob,
    fileName: record.fileName,
    mimeType: record.mimeType,
    fileSize: record.fileSize,
  };
}

/**
 * Generate a Blob URL for previewing in iframes, img tags, or object elements
 */
export async function getFileBlobUrl(fileId: string): Promise<string | null> {
  const cachedUrl = activeBlobUrls.get(fileId);
  if (cachedUrl) return cachedUrl;

  const item = await getFileFromStorage(fileId);
  if (!item) return null;

  const url = URL.createObjectURL(item.blob);
  activeBlobUrls.set(fileId, url);
  return url;
}

/**
 * Download a file from IndexedDB
 */
export async function downloadFileFromStorage(
  fileId: string,
  fallbackFileName?: string
): Promise<boolean> {
  const fileData = await getFileFromStorage(fileId);
  if (!fileData) {
    console.warn('File not found in storage for download:', fileId);
    return false;
  }

  const url = URL.createObjectURL(fileData.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fallbackFileName || fileData.fileName || `tai_lieu_${fileId}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
  return true;
}

/**
 * Delete a file record from storage
 */
export async function deleteFileFromStorage(fileId: string): Promise<boolean> {
  memoryFallbackMap.delete(fileId);
  const existingUrl = activeBlobUrls.get(fileId);
  if (existingUrl) {
    URL.revokeObjectURL(existingUrl);
    activeBlobUrls.delete(fileId);
  }

  try {
    const db = await openDatabase();
    return await new Promise<boolean>((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(fileId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}
