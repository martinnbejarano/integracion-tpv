import { Router } from "express";
import passport from "passport";
import {
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/authController.js";

const router = Router();

router.get("/verify-email/:token", verifyEmail);
router.post(
  "/resend-verification",
  passport.authenticate("jwt", { session: false }),
  resendVerificationEmail
);

export default router;
