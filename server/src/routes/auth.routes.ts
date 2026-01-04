import { Router } from "express";
import { login, register, signup } from "../controllers/auth.controller";
import {
  validateLogin,
  validateSignupStep1,
  validateSignupStep2,
  validateSignupStep3,
} from "../middleware/validation";
import {
  loginRateLimiter,
  signupRateLimiter,
  authRateLimiter,
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
