import { Router } from "express";
import passport from "passport";
import {
  getCurrentUser,
  requestAccountDeletion,
  cancelAccountDeletion,
  deleteUser,
} from "../controllers/userController.js";
import { catchAsync } from "../middlewares/errorHandlers/catchAsync.js";

const router = Router();

// Ruta para obtener el usuario actual (protegida con JWT)
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  catchAsync(getCurrentUser)
);
router.post(
  "/request-account-deletion",
  passport.authenticate("jwt", { session: false }),
  catchAsync(requestAccountDeletion)
);
router.post(
  "/cancel-account-deletion",
  passport.authenticate("jwt", { session: false }),
  catchAsync(cancelAccountDeletion)
);
router.delete(
  "/delete-account",
  passport.authenticate("jwt", { session: false }),
  catchAsync(deleteUser)
);

export default router;
