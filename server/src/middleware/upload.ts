import multer from "multer";
import type { Request } from "express";

// Configure storage
const storage = multer.memoryStorage(); // Store files in memory for processing

// File filter
// Note: file.size is NOT available in fileFilter when using memoryStorage
// File size is validated by multer's limits.fileSize and in the controller
// Here we only validate file type and extension
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Validate file extension
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'zip', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
  
  if (!ext || !allowedExtensions.includes(ext)) {
    return cb(new Error("File extension not allowed") as any, false);
  }

  // Validate MIME type
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain',
    'text/markdown',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("File type not allowed") as any, false);
  }

  cb(null, true);
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Single file upload middleware
export const uploadSingle = upload.single("file");

