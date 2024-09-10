import { Router } from "express";
import passport from "passport";
import {
  login,
  logout,
  register,
  failLogin,
  failRegister,
  googleCallback,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { catchAsync } from "../middlewares/errorHandlers/catchAsync.js";

const router = Router();

// Ruta de registro
router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/auth/failregister",
    failureMessage: true,
    session: false,
  }),
  catchAsync(register)
);

// Ruta de fallo en el registro
router.get("/failregister", catchAsync(failRegister));

// Ruta de login
router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/auth/faillogin",
    session: false,
  }),
  catchAsync(login)
);

// Ruta de fallo en el login
router.get("/faillogin", catchAsync(failLogin));

// Ruta de logout (protegida con JWT)
router.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  catchAsync(logout)
);

// Ruta para iniciar el proceso de autenticación con Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Ruta de callback para Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/faillogin",
    session: false,
  }),
  catchAsync(googleCallback)
);

// Ruta para solicitar restablecimiento de contraseña
router.post("/forgot-password", catchAsync(forgotPassword));

// Ruta para restablecer la contraseña
router.post("/reset-password/:token", catchAsync(resetPassword));

export default router;
