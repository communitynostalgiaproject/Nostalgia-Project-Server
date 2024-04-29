import express from "express";
import morgan from "morgan";
import session from "express-session";
import passport from "passport";
import mongoStore from "connect-mongo";
import cors from "cors";
import path from "path";
import { Request, Response } from "express";

// Import routers
import getExperienceRouter from "../routes/experiences.route";
import commentRouter from "../routes/comments.route";
import userRouter from "../routes/users.route";
import flagRouter from "../routes/flags.route";
import authRouter from "../routes/auth.route";
import reactionRouter from "../routes/reactions.route";
import banRouter from "../routes/bans.route";

// Import middleware
import errorHandler from "../middleware/errorHandler";

// Import config
import connectDB from "./mongodbSetup";
import configurePassport from "../config/passportConfig";

export const setupApp = async (mongoUri: string) => {
  connectDB(mongoUri);
  configurePassport(passport);

  const app = express();
  const sessionStore = mongoStore.create({
    mongoUrl: mongoUri,
    dbName: "session-data"
  });

  // Global middlewares
  app.use(cors({
    origin: process.env.REDIRECT_URI,
    credentials: true
  }));
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(session({
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // API routes
  const experienceRouter = await getExperienceRouter();
  app.get("/", (req: Request, res: Response) => res.status(200).json({ message: "Ping received!" }));
  app.use("/experiences", experienceRouter);
  experienceRouter.use("/:experienceId/comments", commentRouter);
  userRouter.use("/:userId/bans", banRouter);
  app.use("/users", userRouter);
  app.use("/flags", flagRouter);
  experienceRouter.use("/:experienceId/reactions", reactionRouter);
  app.use("/auth", authRouter);

  // Serve files from local storage in testing and development environments
  if (process.env.NODE_ENV !== "production") {
    app.use('/files', express.static(path.resolve(__dirname, '../../uploads')));
  }
  // Error handling middleware
  app.use(errorHandler);

  return app;
};