import express from "express";
import experienceRouter from "./routes/experience.route";
import commentRouter from "./routes/comment.route";
import errorHandler from "./middleware/errorHandler";

const app = express();
const port = process.env.PORT || 5000;

// Global middlewares
app.use(express.json());

// API routes
app.use("/experiences", experienceRouter);
experienceRouter.use("/:experienceId/comments", commentRouter);

// Error handling middleware
app.use(errorHandler);
 
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});