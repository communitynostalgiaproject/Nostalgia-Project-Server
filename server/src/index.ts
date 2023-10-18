import express from "express";
import errorHandler from "./middleware/errorHandler";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
// Add routers here
app.use(errorHandler);
 
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});