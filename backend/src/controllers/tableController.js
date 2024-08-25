import { TableMongoDB } from "../DAO/manager/mongoDB/table.mongoDB.js";

export const tableApi = new TableMongoDB();

export const createTable = async (req, res) => {
  try {
    const table = await tableApi.create(req.body);
    res.status(200).json({ "table: ": table });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getTables = async (req, res) => {
  try {
    const tables = await tableApi.getAll();
    res.status(200).json({ "tables: ": tables });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getTable = async (req, res) => {
  try {
    const table = await tableApi.getOne(req.params.id);
    res.status(200).json({ "table: ": table });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateTable = async (req, res) => {
  try {
    const updatedTable = await tableApi.update(req.params.id, req.body);
    res.status(200).json({ "tabla actualizada: ": updatedTable });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const deletedTable = await tableApi.delete(req.params.id);
    res.status(200).json({ "tabla eliminada: ": deletedTable });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};
