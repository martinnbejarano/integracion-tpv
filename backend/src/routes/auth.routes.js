import { Router } from "express";
import passport from "passport";
import {
  login,
  logout,
  register,
  failLogin,
  failRegister,
  getCurrentUser,
  googleCallback,
  requestAccountDeletion,
  cancelAccountDeletion,
  deleteUser,
} from "../controllers/authController.js";

const router = Router();

// Ruta de registro
router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/auth/failregister",
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

// Ruta para obtener el usuario actual (protegida con JWT)
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  getCurrentUser
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

// Ruta para solicitar la eliminación de la cuenta
router.post(
  "/request-account-deletion",
  passport.authenticate("jwt", { session: false }),
  requestAccountDeletion
);

// Ruta para cancelar la solicitud de eliminación de la cuenta
router.post(
  "/cancel-account-deletion",
  passport.authenticate("jwt", { session: false }),
  cancelAccountDeletion
);

// Ruta para eliminar el usuario actual (protegida con JWT)
router.delete(
  "/delete-account",
  passport.authenticate("jwt", { session: false }),
  deleteUser
);

export default router;
