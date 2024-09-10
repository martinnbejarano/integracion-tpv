import { Router } from "express";
import {
  createTable,
  getTables,
  getTable,
  updateTable,
  deleteTable,
} from "../controllers/tableController.js";
import {
  errorTable,
  tableExist,
} from "../middlewares/entityMiddlewares/EntityMiddleware.js";
import { catchAsync } from "../middlewares/errorHandlers/catchAsync.js";

const router = Router();

router.get("/", catchAsync(getTables)); // Obtener todas las mesas
router.post("/", catchAsync(createTable)); // Crear una mesa
router.get("/:id", tableExist, errorTable, catchAsync(getTable)); // Obtener mesa por id
router.put("/:id", tableExist, errorTable, catchAsync(updateTable)); // Actualizar mesa por id
router.delete("/:id", tableExist, errorTable, catchAsync(deleteTable)); // Eliminar mesa por id

export default router;
