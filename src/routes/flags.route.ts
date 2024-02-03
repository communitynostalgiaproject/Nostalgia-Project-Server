import { Router } from "express";
import { isAuthenticated, createAuthorizationMiddleware } from "../middleware/authChecks";
import { FlagController } from "../controllers/flags.controller";
import FlagModel from "../models/flag.model";

const router = Router();
const isAuthorized = createAuthorizationMiddleware(FlagModel, (user, document) => {
  return user.isModerator || user.isAdmin;
});
const flagController = new FlagController();

router.post("/", isAuthenticated, flagController.create);
router.get("/:documentId", flagController.readById);
router.get("/", flagController.read);
router.patch("/:documentId", isAuthorized, flagController.update);
router.delete("/:documentId", isAuthorized, flagController.delete);

export default router;