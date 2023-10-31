import express from "express";
import morgan from "morgan";
import experienceRouter from "./routes/experiences.route";
import commentRouter from "./routes/comments.route";
import userRouter from "./routes/users.route";
import flagRouter from "./routes/flags.route";
import errorHandler from "./middleware/errorHandler";
import dotenv from "dotenv";
import connectDB from "./config/mongodbSetup";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// Global middlewares
app.use(express.json());
app.use(morgan('dev'));

// API routes
app.use("/experiences", experienceRouter);
experienceRouter.use("/:experienceId/comments", commentRouter);
app.use("/users", userRouter);
app.use("/flags", flagRouter);

// Error handling middleware
app.use(errorHandler);
 
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

export default app;