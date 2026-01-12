import { promises as fs } from "fs";
import path from "path";
import { createId } from "@paralleldrive/cuid2";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

// Allowed file types (MIME types)
const ALLOWED_MIME_TYPES = [
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "text/plain",
  "text/markdown",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// File extensions mapping (for validation)
const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "md",
  "zip",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
];

/**
 * Initialize upload directory if it doesn't exist
 */
export async function initializeUploadDir(): Promise<void> {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Validate file size
 */
export function validateFileSize(fileSize: number): boolean {
  return fileSize <= MAX_FILE_SIZE;
}

/**
 * Validate file type (MIME type)
 */
export function validateFileType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Validate file extension
 */
export function validateFileExtension(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase().slice(1);
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Generate a unique filename
 */
export function generateFileName(originalName: string, userId: string): string {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");
  const uniqueId = createId();
  const timestamp = Date.now();
  return `${userId}_${timestamp}_${sanitizedBaseName}_${uniqueId}${ext}`;
}

/**
 * Upload file to local storage
 * @param fileBuffer - The file buffer
 * @param fileName - The generated filename
 * @returns The file URL/path
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  await initializeUploadDir();
  
  const filePath = path.join(UPLOAD_DIR, fileName);
  await fs.writeFile(filePath, fileBuffer);
  
  // Return relative path for URL construction
  return `/uploads/${fileName}`;
}

/**
 * Delete file from storage
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    const fileName = path.basename(fileUrl);
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    await fs.unlink(filePath);
  } catch (error: any) {
    // Ignore errors if file doesn't exist
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

/**
 * Get file stats (size, etc.)
 */
export async function getFileStats(fileUrl: string): Promise<{
  size: number;
  exists: boolean;
}> {
  try {
    const fileName = path.basename(fileUrl);
    const filePath = path.join(UPLOAD_DIR, fileName);
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      exists: true,
    };
  } catch {
    return {
      size: 0,
      exists: false,
    };
  }
}

/**
 * Validate file (size and type)
 */
export function validateFile(
  fileSize: number,
  mimeType: string,
  fileName: string
): { valid: boolean; error?: string } {
  if (!validateFileSize(fileSize)) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (!validateFileType(mimeType)) {
    return {
      valid: false,
      error: "File type not allowed",
    };
  }

  if (!validateFileExtension(fileName)) {
    return {
      valid: false,
      error: "File extension not allowed",
    };
  }

  return { valid: true };
}

