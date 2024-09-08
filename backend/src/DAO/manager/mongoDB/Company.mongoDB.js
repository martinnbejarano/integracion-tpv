import ManagerMongoDB from "./ManagerMongoDB.js";
import { Company } from "../../models/company.models.js";

export class CompanyMongoDB extends ManagerMongoDB {
  constructor() {
    super(Company);
  }

  //REVISAR
  async getBranches(id) {
    try {
      const branches = await this.collection.findById(id).populate("branches");
      return branches;
    } catch (err) {
      throw new Error("Error: " + err);
    }
  }
  async getOneByName(name) {
    try {
      const company = await this.collection.findOne({ name });
      return company;
    } catch (err) {
      throw new Error("Error: " + err);
    }
  }
}
