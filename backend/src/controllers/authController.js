import { envConfig } from "../utils/env.config.js";
import { companyApi, branchApi, userApi } from "../utils/passport.config.js";
import { addToBlacklist } from "../utils/tokenBlacklist.js";
import { sendEmail } from "../utils/emailService.js";
import crypto from "crypto";

export const login = async (req, res) => {
  try {
    const { user } = req.user;

    if (!user.isEmailVerified) {
      return res.status(403).json({
        error:
          "Por favor, verifique su correo electrónico antes de iniciar sesión",
      });
    }

    // Passport ya ha autenticado al usuario y generado el token
    res.json({ message: "Inicio de sesión exitoso", payload: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el inicio de sesión" });
  }
};

export const failLogin = (req, res) => {
  try {
    res.status(401).json({ error: "Error en el inicio de sesión" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const logout = (req, res) => {
  try {
    const token =
      req.cookies[envConfig.SIGNED_COOKIE] ||
      req.get("Authorization")?.split(" ")[1];
    if (token) {
      addToBlacklist(token);
    }
    res.clearCookie(envConfig.SIGNED_COOKIE);
    res.json({ mensaje: "Sesión cerrada exitosamente" });
  } catch (error) {
    console.error("Error en logout:", error);
    res
      .status(500)
      .json({ error: "Error al cerrar sesión", mensaje: error.message });
  }
};

export const register = async (req, res) => {
  try {
    if (!req.user || !req.user.user) {
      return res.status(400).json({ error: "Error en el registro de usuario" });
    }

    const { user, token } = req.user;

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 24); // El token expira en 24 horas

    // Actualizar usuario con el token de verificación y su fecha de expiración
    await userApi.update(user._id, {
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: tokenExpiration,
      isEmailVerified: false,
    });

    // Enviar correo de verificación
    const verificationLink = `${envConfig.APP_URL}/verify-email/${verificationToken}`;
    await sendEmail(
      user.email,
      "Verificación de correo electrónico",
      `<html><body>
        <h1>Bienvenido a nuestra aplicación</h1>
        <p>Por favor, haga clic en el siguiente enlace para verificar su correo electrónico:</p>
        <a href="${verificationLink}">Verificar correo electrónico</a>
        <p>Este enlace expirará en 24 horas.</p>
      </body></html>`
    );

    let responseData = {
      message:
        "Usuario registrado exitosamente. Por favor, verifique su correo electrónico.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isEmailVerified: false,
        accountDeletionRequested: user.accountDeletionRequested,
        accountDeletionDate: user.accountDeletionDate,
      },
      token: token,
    };

    if (user.role === "company_admin") {
      const company = await companyApi.getOne(user.company);
      responseData.company = {
        id: company._id,
        name: company.name,
      };
    } else if (user.role === "branch_admin") {
      const branch = await branchApi.getOne(user.branch);
      const company = await companyApi.getOne(user.company);
      responseData.branch = {
        id: branch._id,
        name: branch.name,
        direction: branch.direction,
      };
      responseData.company = {
        id: company._id,
        name: company.name,
      };
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

export const failRegister = (req, res) => {
  try {
    res.status(400).json({ error: "Error en el registro de usuario" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

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

export const googleCallback = (req, res) => {
  const token = req.user.token;
  res.cookie(envConfig.SIGNED_COOKIE, token, {
    httpOnly: true,
    secure: true,
    maxAge: 3600000,
  });
  res.redirect("/"); // Redirige a la página principal después de la autenticación exitosa
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

// Añade esta nueva función para manejar la verificación del correo
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await userApi.findUserByVerificationToken(token);

    if (!user) {
      return res.status(400).json({ error: "Token de verificación inválido" });
    }

    // Verificar si el token ha expirado
    if (user.emailVerificationTokenExpires < new Date()) {
      return res
        .status(400)
        .json({ error: "El token de verificación ha expirado" });
    }

    await userApi.update(user._id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
    });

    res.json({ message: "Correo electrónico verificado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al verificar el correo electrónico" });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userApi.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ error: "El correo electrónico ya está verificado" });
    }

    // Generar nuevo token de verificación
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 24); // El token expira en 24 horas

    // Actualizar usuario con el nuevo token de verificación y su fecha de expiración
    await userApi.update(user._id, {
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: tokenExpiration,
    });

    // Enviar nuevo correo de verificación
    const verificationLink = `${envConfig.APP_URL}/verify-email/${verificationToken}`;
    await sendEmail(
      user.email,
      "Verificación de correo electrónico",
      `<html><body>
        <h1>Verificación de correo electrónico</h1>
        <p>Por favor, haga clic en el siguiente enlace para verificar su correo electrónico:</p>
        <a href="${verificationLink}">Verificar correo electrónico</a>
        <p>Este enlace expirará en 24 horas.</p>
      </body></html>`
    );

    res.json({ message: "Se ha enviado un nuevo correo de verificación" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al reenviar el correo de verificación" });
  }
};
