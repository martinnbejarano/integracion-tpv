import { Router } from "express";
import tableRouter from "./table.routes.js";
import authRouter from "./auth.routes.js";

const router = Router();

//rutas

router.use("/auth", authRouter);

router.use(
  "/tables",
  passport.authenticate("jwt", { session: false }),
  tableRouter
);

export default router;
