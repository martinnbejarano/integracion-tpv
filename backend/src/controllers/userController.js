import { sendEmail } from "../utils/emailService.js";
import { envConfig } from "../utils/env.config.js";
import { branchApi, companyApi, userApi } from "../utils/passport.config.js";
import { AppError } from "../middlewares/errorHandlers/AppError.js";
import {
  getAccountDeletionRequestTemplate,
  getAccountDeletionCancellationTemplate,
  getAccountDeletedTemplate,
} from "../utils/emailTemplates.js";

export const getCurrentUser = (req, res) => {
  if (!req.user) {
    throw new AppError("Usuario no autenticado", 401);
  }
  res.json(req.user);
};

export const requestAccountDeletion = async (req, res) => {
  const userId = req.user._id;
  const user = await userApi.getOne(userId);

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  await userApi.update(userId, {
    accountDeletionRequested: true,
    accountDeletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días en el futuro
  });

  await sendEmail(
    user.email,
    "Solicitud de eliminación de cuenta",
    getAccountDeletionRequestTemplate()
  );

  res.status(200).json({
    message:
      "Solicitud de eliminación de cuenta recibida. La cuenta se eliminará en 30 días.",
  });
};

export const cancelAccountDeletion = async (req, res) => {
  const userId = req.user._id;
  const user = await userApi.getOne(userId);

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  if (!user.accountDeletionRequested) {
    throw new AppError(
      "No hay una solicitud de eliminación de cuenta pendiente",
      400
    );
  }

  await userApi.update(userId, {
    accountDeletionRequested: false,
    accountDeletionDate: null,
  });

  await sendEmail(
    user.email,
    "Cancelación de solicitud de eliminación de cuenta",
    getAccountDeletionCancellationTemplate()
  );

  res.status(200).json({
    message: "Solicitud de eliminación de cuenta cancelada exitosamente",
  });
};

export const deleteUser = async (req, res) => {
  const userId = req.user._id;
  const user = await userApi.getOne(userId);

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  if (!user.accountDeletionRequested) {
    throw new AppError(
      "No se ha solicitado la eliminación de esta cuenta",
      400
    );
  }

  const deletionDate = new Date(user.accountDeletionDate);
  if (Date.now() < deletionDate.getTime()) {
    throw new AppError(
      "Aún no ha pasado el período de espera para la eliminación de la cuenta",
      400
    );
  }

  if (user.role === "company_admin") {
    const company = await companyApi.getOne(user.company);
    if (company) {
      for (const branchId of company.branches) {
        await branchApi.delete(branchId);
      }
      await companyApi.delete(user.company);
    }
  } else if (user.role === "branch_admin") {
    await branchApi.delete(user.branch);
    await companyApi.update(user.company, {
      $pull: { branches: user.branch },
    });
  }

  await userApi.delete(userId);

  await sendEmail(user.email, "Cuenta eliminada", getAccountDeletedTemplate());

  res.clearCookie(envConfig.SIGNED_COOKIE);
  res.status(200).json({ message: "Cuenta eliminada exitosamente" });
};
