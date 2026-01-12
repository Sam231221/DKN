import { Router } from "express";
import { login, register, signup, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } from "../controllers/auth.controller";
import {
  validateLogin,
  validateSignupStep1,
  validateSignupStep2,
  validateSignupStep3,
  validateEmailVerification,
  validateResendVerification,
  validatePasswordReset,
  validateResetPassword,
} from "../middleware/validation";
import {
  loginRateLimiter,
  signupRateLimiter,
  authRateLimiter,
  emailRateLimiter,
} from "../middleware/rateLimiter";

export const authRoutes = Router();

// Login route with rate limiting and validation
authRoutes.post("/login", loginRateLimiter, validateLogin, login);

// New multi-step signup route with validation
// Frontend sends all data from all steps, and we validate all steps at once
authRoutes.post(
  "/signup",
  signupRateLimiter,
  validateSignupStep1,
  validateSignupStep2,
  validateSignupStep3,
  signup
);

// Legacy register route (keeping for backward compatibility)
authRoutes.post("/register", authRateLimiter, register);

// Email verification routes
authRoutes.post("/verify-email", emailRateLimiter, validateEmailVerification, verifyEmail);
authRoutes.post("/resend-verification", emailRateLimiter, validateResendVerification, resendVerificationEmail);

// Password reset routes
authRoutes.post("/forgot-password", emailRateLimiter, validatePasswordReset, forgotPassword);
authRoutes.post("/reset-password", emailRateLimiter, validateResetPassword, resetPassword);
