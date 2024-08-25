import ManagerMongoDB from "./ManagerMongoDB.js";
import { table } from "../../models/table.models.js";

export class TableMongoDB extends ManagerMongoDB {
  constructor() {
    super(table);
  }
}
