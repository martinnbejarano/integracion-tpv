import express from "express";
import morgan from "morgan";
import http from "http";
import { Server as ioServer } from "socket.io";
import { envConfig } from "./utils/env.config.js";
import { connectDb } from "./DB/dbConnection.js";
import router from "./routes/index.routes.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import session from "express-session";
import initializePassport from "./utils/passport.config.js";

//import sockets from "./sockets.js";

const app = express();

const httpServer = http.createServer(app);
//const io = new ioServer(httpServer);

//middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(envConfig.COOKIE_SECRET));
app.use(
  session({
    secret: envConfig.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: envConfig.NODE_ENV === "production", // use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Inicializar Passport
initializePassport();
app.use(passport.initialize());

//ruta
app.use("/", router);

const connectedServer = httpServer.listen(envConfig.PORT, () => {
  console.log(`Server is up and running on port ${envConfig.PORT}`);
});

connectedServer.on("error", (error) => {
  console.error("Error: ", error);
});

//socket servidor
//sockets(io)

//mongo atlas
connectDb();
