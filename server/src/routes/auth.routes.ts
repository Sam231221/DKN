import { Router } from "express";
import { login, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import {
  validateLogin,
  validateEmailVerification,
  validateResendVerification,
  validatePasswordReset,
  validateResetPassword,
} from "../middleware/validation.js";
import {
  loginRateLimiter,
  emailRateLimiter,
} from "../middleware/rateLimiter.js";

export const authRoutes = Router();

// Login route with rate limiting and validation
authRoutes.post("/login", loginRateLimiter, validateLogin, login);

// SIGNUP IS DISABLED - System is invitation-only
// All users must be invited by administrators/consultants via the invitation system
// See /api/invitations endpoints for invitation management
// authRoutes.post(
//   "/signup",
//   signupRateLimiter,
//   validateSignupStep1,
//   validateSignupStep2,
//   validateSignupStep3,
//   signup
// );

// Legacy register route (keeping for backward compatibility)
// DISABLED - System is invitation-only
// authRoutes.post("/register", authRateLimiter, register);

// Email verification routes
authRoutes.post("/verify-email", emailRateLimiter, validateEmailVerification, verifyEmail);
authRoutes.post("/resend-verification", emailRateLimiter, validateResendVerification, resendVerificationEmail);

// Password reset routes
authRoutes.post("/forgot-password", emailRateLimiter, validatePasswordReset, forgotPassword);
authRoutes.post("/reset-password", emailRateLimiter, validateResetPassword, resetPassword);
