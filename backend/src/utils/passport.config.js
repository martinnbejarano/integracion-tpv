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
        passReqToCallback: true, // Añadir esta línea
      },
      async (req, jwt_payload, done) => {
        try {
          const token =
            cookieExtractor(req) || req.get("Authorization")?.split(" ")[1];
          if (isTokenBlacklisted(token)) {
            return done(null, false, { message: "Token no válido" });
          }

          const user = await User.findById(jwt_payload.user._id);
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        } catch (error) {
          return done(error, false);
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
            return done(null, false, { message: "El email es requerido" });
          }
          console.log(username, email);
          const user = await userApi.findUserByEmail(username);
          //console.log(user);
          if (user) {
            return done(null, false, {
              message: "El email ya está registrado",
            });
          }

          let company, branch;
          if (role === "company_admin") {
            company = await companyApi.create({ name: companyName });
          } else if (role === "branch_admin") {
            console.log(companyName);
            const existingCompany = await companyApi.getOneByName(companyName);
            if (!existingCompany) {
              return done("Compañía no encontrada");
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
            emailVerificationToken: null, // Se generará en el controlador
          };
          //console.log(newUser.email);
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
          return done(null, { user: result, token }); // Cambiado aquí
        } catch (error) {
          return done(null, false, {
            message: "Error al registrar usuario: " + error.message,
          });
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
          console.log(" User login " + user);

          if (!user) {
            return done(null, false);
          }

          if (!isValidPassword(user, password)) {
            return done(null, false);
          }
          const token = jsonwebtoken.sign({ user }, envConfig.TOKEN_SECRET);
          req.res.cookie(envConfig.SIGNED_COOKIE, token, {
            httpOnly: true,
            secure: true,
            maxAge: 3600000,
          });
          console.log({ token });
          return done(null, { user, token });
        } catch (error) {
          console.log(error);
          return done(null, false);
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
            // Si el usuario no existe, lo creamos
            const newUser = {
              email: profile.emails[0].value,
              password: createHash(Math.random().toString(36).substring(7)),
              role: "user", // Asigna un rol predeterminado
              googleId: profile.id,
              accountDeletionRequested: false,
              accountDeletionDate: null,
            };
            user = await userApi.create(newUser);
          }

          const token = jsonwebtoken.sign({ user }, envConfig.TOKEN_SECRET);
          return done(null, { user, token });
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};

export default initializePassport;
