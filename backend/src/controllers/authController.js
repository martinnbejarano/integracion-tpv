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
import { AppError } from "../middlewares/errorHandlers/AppError.js";

export const login = async (req, res) => {
  const { user } = req.user;

  if (!user.isEmailVerified) {
    throw new AppError(
      "Por favor, verifique su correo electrónico antes de iniciar sesión",
      403
    );
  }

  res.json({ message: "Inicio de sesión exitoso", payload: req.user });
};

export const failLogin = async (req, res) => {
  throw new AppError("Error en el inicio de sesión", 401);
};

export const logout = async (req, res) => {
  const token =
    req.cookies[envConfig.SIGNED_COOKIE] ||
    req.get("Authorization")?.split(" ")[1];
  if (token) {
    addToBlacklist(token);
  }
  res.clearCookie(envConfig.SIGNED_COOKIE);
  res.json({ mensaje: "Sesión cerrada exitosamente" });
};

export const register = async (req, res) => {
  if (!req.user || !req.user.user) {
    throw new AppError("Error en el registro de usuario", 400);
  }

  const { user, token } = req.user;

  const { verificationToken, tokenExpiration } = generateVerificationToken(24);

  await userApi.update(user._id, {
    emailVerificationToken: verificationToken,
    emailVerificationTokenExpires: tokenExpiration,
    isEmailVerified: false,
  });

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
};

export const failRegister = async (req, res) => {
  const errorMessage =
    req.session?.messages?.pop() || "Error en el registro de usuario";
  throw new AppError(errorMessage, 400);
};

export const googleCallback = async (req, res) => {
  const token = req.user.token;
  res.cookie(envConfig.SIGNED_COOKIE, token, {
    httpOnly: true,
    secure: true,
    maxAge: 3600000,
  });
  res.redirect("/");
};

export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  const user = await userApi.findUserByVerificationToken(token);

  if (!user) {
    throw new AppError("Token de verificación inválido", 400);
  }

  if (user.emailVerificationTokenExpires < new Date()) {
    throw new AppError("El token de verificación ha expirado", 400);
  }

  await userApi.update(user._id, {
    isEmailVerified: true,
    emailVerificationToken: null,
    emailVerificationTokenExpires: null,
  });

  res.json({ message: "Correo electrónico verificado exitosamente" });
};

export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  const user = await userApi.findUserByEmail(email);

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("El correo electrónico ya está verificado", 400);
  }

  const { verificationToken, tokenExpiration } = generateVerificationToken(24);

  await userApi.update(user._id, {
    emailVerificationToken: verificationToken,
    emailVerificationTokenExpires: tokenExpiration,
  });

  await sendEmail(
    user.email,
    "Verificación de correo electrónico",
    getVerificationEmailTemplate(verificationToken)
  );

  res.json({ message: "Se ha enviado un nuevo correo de verificación" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userApi.findUserByEmail(email);

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const { verificationToken, tokenExpiration } = generateVerificationToken(1);

  await userApi.update(user._id, {
    resetPasswordToken: verificationToken,
    resetPasswordExpires: tokenExpiration,
  });

  await sendEmail(
    user.email,
    "Restablecimiento de contraseña",
    getPasswordResetEmailTemplate(verificationToken)
  );

  res.status(200).json({
    message: "Correo de restablecimiento enviado",
    token: verificationToken,
  });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await userApi.findOneByResetToken(token, new Date());

  if (!user) {
    throw new AppError("Token inválido o expirado", 400);
  }

  const hashedPassword = createHash(password);

  await userApi.update(user._id, {
    password: hashedPassword,
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
  });

  await sendEmail(
    user.email,
    "Contraseña restablecida",
    getPasswordResetConfirmationTemplate()
  );

  res.status(200).json({ message: "Contraseña restablecida exitosamente" });
};
