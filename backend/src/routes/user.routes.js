import { Router } from "express";
import passport from "passport";
import {
  getCurrentUser,
  requestAccountDeletion,
  cancelAccountDeletion,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();

// Ruta para obtener el usuario actual (protegida con JWT)
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  getCurrentUser
);
router.post(
  "/request-account-deletion",
  passport.authenticate("jwt", { session: false }),
  requestAccountDeletion
);
router.post(
  "/cancel-account-deletion",
  passport.authenticate("jwt", { session: false }),
  cancelAccountDeletion
);
router.delete(
  "/delete-account",
  passport.authenticate("jwt", { session: false }),
  deleteUser
);

export default router;
