import { Router } from "express";
import {
  createTable,
  getTables,
  getTable,
} from "../controllers/tableController";
import { errorTable, tableExist } from "../middlewares/Middlewares";

router.get("/", getTables); // Obtener todas las mesas
router.post("/", createTable); // Crear una mesa
router.get("/:id", tableExist, errorTable, getTable);

const router = Router();
