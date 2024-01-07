import express from "express";
import morgan from "morgan";
import session from "express-session";
import passport from "passport";
import mongoStore from "connect-mongo";
import { Request, Response, NextFunction } from "express";

// Import routers
import experienceRouter from "../routes/experiences.route";
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

export const setupApp = (mongoUri: string) => {
  connectDB(mongoUri);
  configurePassport(passport);

  const app = express();
  const sessionStore = process.env.NODE_ENV === "test"
    ? undefined
    : mongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      dbName: "session-data"
    });

  // Global middlewares
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(session({
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // API routes
  app.get("/", (req: Request, res: Response) => res.status(200).json({ message: "Ping received!" }));
  app.use("/experiences", experienceRouter);
  experienceRouter.use("/:experienceId/comments", commentRouter);
  userRouter.use("/:userId/bans", banRouter);
  app.use("/users", userRouter);
  app.use("/flags", flagRouter);
  app.use("/reactions", reactionRouter);
  app.use("/auth", authRouter);

  // Error handling middleware
  app.use(errorHandler);

  return app;
};