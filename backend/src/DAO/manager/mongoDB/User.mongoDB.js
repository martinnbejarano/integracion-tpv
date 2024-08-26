import ManagerMongoDB from "./ManagerMongoDB.js";
import { User } from "../../models/user.models.js";

export class UserMongoDB extends ManagerMongoDB {
  constructor() {
    super(User);
  }

  async findUserByEmail(email) {
    try {
      const user = await this.collection.findOne({ email });
      return user;
    } catch (error) {
      throw new Error("Error: " + err);
    }
  }
}
