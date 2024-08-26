import { Router } from "express";
import passport from "passport";
import {
  login,
  logout,
  register,
  failLogin,
  failRegister,
} from "../controllers/authController.js";
//import { isAdmin } from "../middlewares/authMiddleware.js"; // Asumiendo que tienes este middleware

const router = Router();

// Ruta de registro
router.post(
  "/register",
  //isAdmin,
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
  (req, res) => {
    res.send(req.user);
  }
);

export default router;
