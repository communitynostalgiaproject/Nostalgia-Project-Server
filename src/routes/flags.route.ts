import { Router } from "express";
import { isAuthenticated, createAuthorizationMiddleware } from "../middleware/authChecks";
import FlagController from "../controllers/flags.controller";
import FlagModel from "../models/flag.model";

const router = Router();
const isAuthorized = createAuthorizationMiddleware(FlagModel, (user, document) => {
  return user.isModerator || user.isAdmin;
});

router.post("/", isAuthenticated, FlagController.create);
router.get("/:documentId", FlagController.readById);
router.get("/", FlagController.read);
router.patch("/:documentId", isAuthorized, FlagController.update);
router.delete("/:documentId", isAuthorized, FlagController.delete);

export default router;