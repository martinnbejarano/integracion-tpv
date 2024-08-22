import { Router } from "express";
import tableRouter from "./table.routes.js";
const router = Router();

//rutas
router.use("/mesa", tableRouter);

export default router;
