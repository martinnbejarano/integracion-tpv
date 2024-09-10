import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../DAO/models/user.models.js";
import { envConfig } from "./env.config.js";
import jsonwebtoken from "jsonwebtoken";
import { createHash, isValidPassword } from "./bcrypt.config.js";
import { UserMongoDB } from "../DAO/manager/mongoDB/User.mongoDB.js";
import { CompanyMongoDB } from "../DAO/manager/mongoDB/Company.mongoDB.js";
import { BranchMongoDB } from "../DAO/manager/mongoDB/Branch.mongoDB.js";
import { isTokenBlacklisted } from "./tokenBlacklist.js";
import { AppError } from "../middlewares/errorHandlers/AppError.js";

export const userApi = new UserMongoDB();
export const companyApi = new CompanyMongoDB();
export const branchApi = new BranchMongoDB();

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies[envConfig.SIGNED_COOKIE];
  }
  return token;
};

const initializePassport = () => {
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          ExtractJwt.fromAuthHeaderAsBearerToken(),
          cookieExtractor,
        ]),
        secretOrKey: envConfig.TOKEN_SECRET,
        passReqToCallback: true,
      },
      async (req, jwt_payload, done) => {
        try {
          const token =
            cookieExtractor(req) || req.get("Authorization")?.split(" ")[1];
          if (isTokenBlacklisted(token)) {
            return done(new AppError("Token no válido", 401), false);
          }

          const user = await User.findById(jwt_payload.user._id);
          if (user) {
            return done(null, user);
          } else {
            return done(new AppError("Usuario no encontrado", 404), false);
          }
        } catch (error) {
          return done(
            new AppError(`Error en autenticación JWT: ${error.message}`, 500),
            false
          );
        }
      }
    )
  );

  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email", session: false },
      async (req, username, password, done) => {
        const { email, role, companyName, branchName, branchDirection } =
          req.body;
        try {
          if (!email) {
            return done(new AppError("El email es requerido", 400), false);
          }
          const user = await userApi.findUserByEmail(username);
          if (user) {
            return done(
              new AppError("El email ya está registrado", 400),
              false
            );
          }

          let company, branch;
          if (role === "company_admin") {
            company = await companyApi.create({ name: companyName });
          } else if (role === "branch_admin") {
            const existingCompany = await companyApi.getOneByName(companyName);
            if (!existingCompany) {
              return done(new AppError("Compañía no encontrada", 404), false);
            }
            branch = await branchApi.create({
              name: branchName,
              direction: branchDirection,
              company: existingCompany._id,
            });
            await companyApi.update(existingCompany._id, {
              $push: { branches: branch._id },
            });
            company = existingCompany;
          }

          const newUser = {
            email,
            password: createHash(password),
            role,
            company: company._id,
            branch: role === "branch_admin" ? branch._id : undefined,
            accountDeletionRequested: false,
            accountDeletionDate: null,
            isEmailVerified: false,
            emailVerificationToken: null,
          };
          let result = await userApi.create(newUser);
          const token = jsonwebtoken.sign(
            { user: result },
            envConfig.TOKEN_SECRET
          );
          req.res.cookie(envConfig.SIGNED_COOKIE, token, {
            httpOnly: true,
            secure: true,
            maxAge: 3600000,
          });
          return done(null, { user: result, token });
        } catch (error) {
          return done(
            new AppError(`Error al registrar usuario: ${error.message}`, 500),
            false
          );
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email", session: false },
      async (req, email, password, done) => {
        try {
          const user = await userApi.findUserByEmail(email);
          if (!user) {
            return done(new AppError("Usuario no encontrado", 404), false);
          }
          if (!isValidPassword(user, password)) {
            return done(new AppError("Contraseña incorrecta", 401), false);
          }
          const token = jsonwebtoken.sign({ user }, envConfig.TOKEN_SECRET);
          req.res.cookie(envConfig.SIGNED_COOKIE, token, {
            httpOnly: true,
            secure: true,
            maxAge: 3600000,
          });
          return done(null, { user, token });
        } catch (error) {
          return done(
            new AppError(`Error en inicio de sesión: ${error.message}`, 500),
            false
          );
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: envConfig.GOOGLE_CLIENT_ID,
        clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await userApi.findUserByEmail(profile.emails[0].value);

          if (!user) {
            const newUser = {
              email: profile.emails[0].value,
              password: createHash(Math.random().toString(36).substring(7)),
              role: "user",
              googleId: profile.id,
              accountDeletionRequested: false,
              accountDeletionDate: null,
            };
            user = await userApi.create(newUser);
          }

          const token = jsonwebtoken.sign({ user }, envConfig.TOKEN_SECRET);
          return done(null, { user, token });
        } catch (error) {
          return done(
            new AppError(
              `Error en autenticación Google: ${error.message}`,
              500
            ),
            false
          );
        }
      }
    )
  );
};

export default initializePassport;
