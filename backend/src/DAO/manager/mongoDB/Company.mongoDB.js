import ManagerMongoDB from "./ManagerMongoDB.js";
import { Company } from "../../models/company.models.js";
import { AppError } from "../../../middlewares/errorHandlers/AppError.js";

export class CompanyMongoDB extends ManagerMongoDB {
  constructor() {
    super(Company);
  }

  async getBranches(id) {
    try {
      const company = await this.collection.findById(id).populate("branches");
      if (!company) {
        throw new AppError("Empresa no encontrada", 404);
      }
      return company.branches;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Error al obtener sucursales: ${err.message}`, 500);
    }
  }

  async getOneByName(name) {
    try {
      const company = await this.collection.findOne({ name });
      if (!company) {
        throw new AppError("Empresa no encontrada", 404);
      }
      return company;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(
        `Error al buscar empresa por nombre: ${err.message}`,
        500
      );
    }
  }
}
