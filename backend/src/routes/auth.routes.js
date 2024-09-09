import { Router } from "express";
import passport from "passport";
import {
  login,
  logout,
  register,
  failLogin,
  failRegister,
  googleCallback,
} from "../controllers/authController.js";

const router = Router();

// Ruta de registro
router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/auth/failregister",
    failureMessage: true,
    session: false,
  }),
  register
);

// Ruta de fallo en el registro
router.get("/failregister", failRegister);

// Ruta de login
router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/auth/faillogin",
    session: false,
  }),
  login
);

// Ruta de fallo en el login
router.get("/faillogin", failLogin);

// Ruta de logout (protegida con JWT)
router.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  logout
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
  googleCallback
);

// Ruta para solicitar restablecimiento de contraseña
router.post("/forgot-password", forgotPassword);

// Ruta para restablecer la contraseña
router.post("/reset-password/:token", resetPassword);

export default router;
