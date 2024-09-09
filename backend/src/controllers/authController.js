import { envConfig } from "../utils/env.config.js";
import { companyApi, branchApi, userApi } from "../utils/passport.config.js";
import { addToBlacklist } from "../utils/tokenBlacklist.js";
import { sendEmail } from "../utils/emailService.js";
import { generateVerificationToken } from "../utils/verificationToken.js";
import { createHash } from "../utils/bcrypt.config.js";
import {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
  getPasswordResetConfirmationTemplate,
} from "../utils/emailTemplates.js";

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

    const { verificationToken, tokenExpiration } =
      generateVerificationToken(24);

    // Actualizar usuario con el token de verificación y su fecha de expiración
    await userApi.update(user._id, {
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: tokenExpiration,
      isEmailVerified: false,
    });

    // Enviar correo de verificación
    await sendEmail(
      user.email,
      "Verificación de correo electrónico",
      getVerificationEmailTemplate(verificationToken)
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
      emailVerificationToken: verificationToken,
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
    const errorMessage =
      req.session?.messages?.pop() || "Error en el registro de usuario";
    res.status(400).json({ error: errorMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
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

    const { verificationToken, tokenExpiration } =
      generateVerificationToken(24);

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
      getVerificationEmailTemplate(verificationToken)
    );

    res.json({ message: "Se ha enviado un nuevo correo de verificación" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al reenviar el correo de verificación" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userApi.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { verificationToken, tokenExpiration } = generateVerificationToken(1); // Token válido por 1 hora

    await userApi.update(user._id, {
      resetPasswordToken: verificationToken,
      resetPasswordExpires: tokenExpiration,
    });

    await sendEmail(
      user.email,
      "Restablecimiento de contraseña",
      getPasswordResetEmailTemplate(verificationToken)
    );

    res.status(200).json({ message: "Correo de restablecimiento enviado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await userApi.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    const hashedPassword = createHash(password);

    await userApi.update(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    await sendEmail(user.email, getPasswordResetConfirmationTemplate());

    res.status(200).json({ message: "Contraseña restablecida exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
};
