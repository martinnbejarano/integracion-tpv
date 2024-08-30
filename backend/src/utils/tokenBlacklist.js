import jwt from "jsonwebtoken";
import { envConfig } from "./env.config.js";

// Usaremos un Map en lugar de un Set para almacenar los tokens junto con su tiempo de expiración
let tokenBlacklist = new Map();

export const addToBlacklist = (token) => {
  try {
    const decoded = jwt.verify(token, envConfig.TOKEN_SECRET);
    const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
    tokenBlacklist.set(token, expirationTime);
  } catch (error) {
    console.error("Error al añadir token a la lista negra:", error);
  }
};

export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

export const cleanupBlacklist = () => {
  const now = Date.now();
  for (const [token, expirationTime] of tokenBlacklist.entries()) {
    if (expirationTime <= now) {
      tokenBlacklist.delete(token);
    }
  }
};

// Ejecutar la limpieza cada hora
setInterval(cleanupBlacklist, 60 * 60 * 1000);
