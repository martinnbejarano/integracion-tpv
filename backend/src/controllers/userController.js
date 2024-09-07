import { sendEmail } from "../utils/emailService.js";
import { envConfig } from "../utils/env.config.js";
import { branchApi, companyApi, userApi } from "../utils/passport.config.js";

export const getCurrentUser = (req, res) => {
  try {
    // El middleware de Passport ya ha verificado la autenticación,
    // así que podemos asumir que req.user existe
    res.json(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el usuario actual" });
  }
};

export const requestAccountDeletion = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userApi.getOne(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Marcar la cuenta para eliminación
    await userApi.update(userId, {
      accountDeletionRequested: true,
      accountDeletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días en el futuro
    });

    // Enviar correo electrónico de confirmación
    await sendEmail(
      user.email,
      "Solicitud de eliminación de cuenta",
      "<html><body><h1>Su solicitud de eliminación de cuenta ha sido recibida</h1><p>Su cuenta será eliminada en 30 días.</p></body></html>"
    );

    res.status(200).json({
      message:
        "Solicitud de eliminación de cuenta recibida. La cuenta se eliminará en 30 días.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al procesar la solicitud de eliminación de cuenta",
    });
  }
};

export const cancelAccountDeletion = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userApi.getOne(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!user.accountDeletionRequested) {
      return res.status(400).json({
        error: "No hay una solicitud de eliminación de cuenta pendiente",
      });
    }

    // Cancelar la solicitud de eliminación
    await userApi.update(userId, {
      accountDeletionRequested: false,
      accountDeletionDate: null,
    });

    // Enviar correo electrónico de confirmación
    await sendEmail(
      user.email,
      "Cancelación de solicitud de eliminación de cuenta",
      "<html><body><h1>Su solicitud de eliminación de cuenta ha sido cancelada</h1></body></html>"
    );

    res.status(200).json({
      message: "Solicitud de eliminación de cuenta cancelada exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al cancelar la solicitud de eliminación de cuenta",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userApi.getOne(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!user.accountDeletionRequested) {
      return res
        .status(400)
        .json({ error: "No se ha solicitado la eliminación de esta cuenta" });
    }

    // Verificar si han pasado 30 días desde la solicitud
    const deletionDate = new Date(user.accountDeletionDate);
    if (Date.now() < deletionDate.getTime()) {
      return res.status(400).json({
        error:
          "Aún no ha pasado el período de espera para la eliminación de la cuenta",
      });
    }

    // Proceder con la eliminación
    if (user.role === "company_admin") {
      // Eliminar la compañía y todas sus sucursales
      const company = await companyApi.getOne(user.company);
      if (company) {
        for (const branchId of company.branches) {
          await branchApi.delete(branchId);
        }
        await companyApi.delete(user.company);
      }
    } else if (user.role === "branch_admin") {
      // Eliminar solo la sucursal
      await branchApi.delete(user.branch);
      // Actualizar la compañía para eliminar la referencia a esta sucursal
      await companyApi.update(user.company, {
        $pull: { branches: user.branch },
      });
    }

    // Finalmente, eliminar el usuario
    await userApi.delete(userId);

    // Enviar correo electrónico de confirmación
    await sendEmail(
      user.email,
      "Cuenta eliminada",
      "<html><body><h1>Su cuenta ha sido eliminada exitosamente</h1></body></html>"
    );

    res.clearCookie(envConfig.SIGNED_COOKIE);
    res.status(200).json({ message: "Cuenta eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la cuenta" });
  }
};
