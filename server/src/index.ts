import express from "express";
import experienceRouter from "./routes/experiences.route";
import commentRouter from "./routes/comments.route";
import userRouter from "./routes/users.route";
import errorHandler from "./middleware/errorHandler";

const app = express();
const port = process.env.PORT || 5000;

// Global middlewares
app.use(express.json());

// API routes
app.use("/experiences", experienceRouter);
experienceRouter.use("/:experienceId/comments", commentRouter);
app.use("/users", userRouter);

// Error handling middleware
app.use(errorHandler);
 
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

export default app;