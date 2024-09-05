import { Router } from "express";
import authRoutes from "./auth.routes.js";
import emailRoutes from "./email.routes.js";
import userRoutes from "./user.routes.js";
import tableRoutes from "./table.routes.js";
import passport from "passport";

const router = Router();

//rutas

router.use("/auth", authRoutes);
router.use("/email", emailRoutes);
router.use("/users", userRoutes);
router.use(
  "/tables",
  passport.authenticate("jwt", { session: false }),
  tableRoutes
);

export default router;
