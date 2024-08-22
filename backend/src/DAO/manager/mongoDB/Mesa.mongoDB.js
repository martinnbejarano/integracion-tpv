import ManagerMongoDB from "./ManagerMongoDB.js";
import { Mesa } from "../../models/mesa.models.js";

export class MesaMongoDB extends ManagerMongoDB {
  constructor() {
    super(Mesa);
  }
}
