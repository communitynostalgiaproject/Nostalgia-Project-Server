import express from "express";
import experienceRoutes from "./routes/experience.route";
import errorHandler from "./middleware/errorHandler";

const app = express();
const port = process.env.PORT || 5000;

// Global middlewares
app.use(express.json());

// API routes
app.use("/experiences", experienceRoutes);

// Error handling middleware
app.use(errorHandler);
 
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});