import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../DAO/models/user.models.js";
import { envConfig } from "../utils/env.config.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        company: user.company,
        branch: user.branch,
      },
      envConfig.TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie(envConfig.SIGNED_COOKIE, token, {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
      signed: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({ message: "Inicio de sesión exitoso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

export const logout = (req, res) => {
  res.clearCookie(envConfig.SIGNED_COOKIE);
  res.json({ message: "Sesión cerrada exitosamente" });
};

export const register = async (req, res) => {
  try {
    const { username, password, role, company, branch } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      company,
      branch: role === "branch_admin" ? branch : undefined,
    });

    await newUser.save();

    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};
