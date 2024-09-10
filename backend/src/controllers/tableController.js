import { TableMongoDB } from "../DAO/manager/mongoDB/table.mongoDB.js";
import { AppError } from "../middlewares/errorHandlers/AppError.js";

export const tableApi = new TableMongoDB();

export const createTable = async (req, res) => {
  const table = await tableApi.create(req.body);
  if (!table) {
    throw new AppError("No se pudo crear la mesa", 400);
  }
  res.status(201).json({ table });
};

export const getTables = async (req, res) => {
  const tables = await tableApi.getAll();
  res.status(200).json({ tables });
};

export const getTable = async (req, res) => {
  const table = req.entity || (await tableApi.getOne(req.params.id));
  if (!table) {
    throw new AppError("Mesa no encontrada", 404);
  }
  res.status(200).json({ table });
};

export const updateTable = async (req, res) => {
  const table = req.entity || (await tableApi.getOne(req.params.id));
  if (!table) {
    throw new AppError("Mesa no encontrada", 404);
  }
  const updatedTable = await tableApi.update(table._id, req.body);
  res.status(200).json({ table: updatedTable });
};

export const deleteTable = async (req, res) => {
  const table = req.entity || (await tableApi.getOne(req.params.id));
  if (!table) {
    throw new AppError("Mesa no encontrada", 404);
  }
  await tableApi.delete(table._id);
  res.status(200).json({ message: "Mesa eliminada exitosamente" });
};
