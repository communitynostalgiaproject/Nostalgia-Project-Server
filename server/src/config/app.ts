import express from "express";
import experienceRouter from "../routes/experiences.route";
import commentRouter from "../routes/comments.route";
import userRouter from "../routes/users.route";
import flagRouter from "../routes/flags.route";
import errorHandler from "../middleware/errorHandler";
import connectDB from "./mongodbSetup";

export const setupApp = (mongoUri: string) => {
  connectDB(mongoUri);

  const app = express();

  // Global middlewares
  app.use(express.json());

  // API routes
  app.use("/experiences", experienceRouter);
  experienceRouter.use("/:experienceId/comments", commentRouter);
  app.use("/users", userRouter);
  app.use("/flags", flagRouter);

  // Error handling middleware
  app.use(errorHandler);

  return app;
};