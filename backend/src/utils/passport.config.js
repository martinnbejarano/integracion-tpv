import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../DAO/models/user.models.js";
import { envConfig } from "../utils/env.config.js";
import jsonwebtoken from "jsonwebtoken";
import { createHash, isValidPassword } from "../utils/bcrypt.config.js";
import { UserMongoDB } from "../DAO/manager/mongoDB/User.mongoDB.js";

export const userApi = new UserMongoDB();

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
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: envConfig.TOKEN_SECRET,
      },
      async (jwt_payload, done) => {
        try {
          const user = await User.findById(jwt_payload.id);
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
        const { email, role, company, branch } = req.body;
        try {
          const user = await userApi.findUserByEmail(username);
          if (user) {
            console.log(user);
            return done(null, false);
          }
          const newUser = {
            email,
            password: createHash(password),
            role: role || "company_admin",
            company,
            branch: role === "branch_admin" ? branch : undefined,
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
          return done(null, result);
        } catch (error) {
          return done("User Not found" + error);
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
};

export default initializePassport;
