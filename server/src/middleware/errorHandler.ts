import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  status: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Sanitizes error messages to prevent exposing sensitive information
 * like SQL queries, database structure, or internal implementation details
 */
const sanitizeErrorMessage = (error: any): string => {
  const errorMessage = error?.message || String(error) || "An error occurred";
  
  // Check if error message contains SQL query details
  if (
    errorMessage.includes("Failed query") ||
    errorMessage.includes("select") ||
    errorMessage.includes("INSERT") ||
    errorMessage.includes("UPDATE") ||
    errorMessage.includes("DELETE") ||
    errorMessage.includes("from \"") ||
    errorMessage.includes("where \"") ||
    errorMessage.includes("params:") ||
    errorMessage.toLowerCase().includes("syntax error")
  ) {
    // This is a database query error - return a generic message
    return "A database error occurred. Please try again later.";
  }

  // For other errors, return the message as-is (will be further sanitized below)
  return errorMessage;
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log full error details on the server for debugging
  console.error("Error details:", {
    message: err?.message,
    code: err?.code,
    name: err?.name,
    stack: err?.stack,
  });

  // If it's already an AppError, use its properties
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Handle Multer errors (file upload errors)
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        status: "error",
        message: err.message || "File size exceeds the maximum allowed size of 50MB",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        status: "error",
        message: "Too many files. Only one file is allowed.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        status: "error",
        message: "Unexpected file field. Use 'file' as the field name.",
      });
    }
    return res.status(400).json({
      status: "error",
      message: err.message || "File upload error",
    });
  }

  // Handle PostgreSQL/database errors
  if (err.code) {
    // PostgreSQL error codes
    switch (err.code) {
      case "23505": // Unique violation
        return res.status(409).json({
          status: "error",
          message: "A record with this information already exists.",
        });
      case "23503": // Foreign key violation
        return res.status(400).json({
          status: "error",
          message: "Invalid reference. The operation cannot be completed.",
        });
      case "23502": // Not null violation
        return res.status(400).json({
          status: "error",
          message: "Required fields are missing.",
        });
      case "42P01": // Undefined table
        return res.status(500).json({
          status: "error",
          message: "Database configuration error. Please contact support.",
        });
      case "ECONNREFUSED":
      case "ENOTFOUND":
        return res.status(500).json({
          status: "error",
          message: "Database connection error. Please try again later.",
        });
      case "ETIMEDOUT":
        return res.status(500).json({
          status: "error",
          message: "Request timed out. Please try again.",
        });
    }
  }

  // Handle database query errors (from postgres.js or drizzle)
  const sanitizedMessage = sanitizeErrorMessage(err);
  
  // Determine status code
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  // In production, never expose detailed error information
  const isDevelopment = process.env.NODE_ENV === "development";
  
  // For 500 errors (server errors), use a generic message in production
  const userMessage = 
    statusCode >= 500 && !isDevelopment
      ? "An internal server error occurred. Please try again later."
      : sanitizedMessage;

  res.status(statusCode).json({
    status,
    message: userMessage || "An error occurred",
    ...(isDevelopment && { 
      stack: err.stack,
      originalMessage: err?.message,
    }),
  });
};

