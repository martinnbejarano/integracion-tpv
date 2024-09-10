import ManagerMongoDB from "./ManagerMongoDB.js";
import { User } from "../../models/user.models.js";
import { AppError } from "../../../middlewares/errorHandlers/AppError.js";

export class UserMongoDB extends ManagerMongoDB {
  constructor() {
    super(User);
  }

  async findUserByEmail(email) {
    try {
      const user = await this.collection.findOne({ email });
      return user;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(
        `Error al buscar usuario por email: ${err.message}`,
        500
      );
    }
  }

  async findUserByVerificationToken(token) {
    try {
      const user = await this.collection.findOne({
        emailVerificationToken: token,
      });
      if (!user) {
        throw new AppError("Token de verificación inválido", 400);
      }
      return user;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(
        `Error al buscar usuario por token de verificación: ${err.message}`,
        500
      );
    }
  }

  async findOneByResetToken(token, currentDate) {
    try {
      const user = await this.collection.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: currentDate },
      });
      if (!user) {
        throw new AppError(
          "Token de restablecimiento de contraseña inválido o expirado",
          400
        );
      }
      return user;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(
        `Error al buscar usuario por token de restablecimiento: ${err.message}`,
        500
      );
    }
  }
}
