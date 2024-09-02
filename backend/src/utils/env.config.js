/** variables de entorno comunes en mi aplicacion **/
import dotenv from "dotenv";
dotenv.config();

export const envConfig = {
  PORT: +process.env.PORT || 8080,
  DB_URI: process.env.DB_URI,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  SIGNED_COOKIE: process.env.SIGNED_COOKIE || "auth_token",
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
};
