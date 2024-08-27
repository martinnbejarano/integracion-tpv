import ManagerMongoDB from "./ManagerMongoDB.js";
import { Branch } from "../../models/branch.models.js";

export class BranchMongoDB extends ManagerMongoDB {
  constructor() {
    super(Branch);
  }
}
