import { Router } from "express";
import {
  createTable,
  getTables,
  getTable,
  updateTable,
  deleteTable,
} from "../controllers/tableController.js";
import { errorTable, tableExist } from "../middlewares/Middlewares.js";

const router = Router();

router.get("/", getTables); // Obtener todas las mesas
router.post("/", createTable); // Crear una mesa
router.get("/:id", tableExist, errorTable, getTable); // Obtener mesa por id
router.put("/:id", tableExist, errorTable, updateTable); // Actualizar mesa por id
router.delete("/:id", tableExist, errorTable, deleteTable); // Eliminar mesa por id

export default router;
