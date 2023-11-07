import { setupApp } from './config/app';
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 5001;
const app = setupApp(process.env.MONGODB_URI as string);

const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

process.on('SIGTERM', () => {
   server.close(() => {
      console.log('Process terminated');
   });
});
