import { envConfig } from "../utils/env.config.js";
import { companyApi, branchApi } from "../utils/passport.config.js";

export const login = async (req, res) => {
  try {
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
    console.log("Headers de la solicitud:", req.headers);
    console.log("Usuario en la solicitud:", req.user);

    // El middleware de Passport ya ha verificado la autenticación,
    // así que podemos asumir que req.user existe
    res.clearCookie(envConfig.SIGNED_COOKIE);
    res.json({ message: "Sesión cerrada exitosamente" });
  } catch (error) {
    console.error("Error en logout:", error);
    res
      .status(500)
      .json({ error: "Error al cerrar sesión", message: error.message });
  }
};

export const register = async (req, res) => {
  try {
    if (!req.user || !req.user.user) {
      return res.status(400).json({ error: "Error en el registro de usuario" });
    }

    const { user, token } = req.user;
    let responseData = {
      message: "Usuario registrado exitosamente",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
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
