import { Router } from "express";
import { isAuthenticated, createAuthorizationMiddleware } from "../middleware/authChecks";
import { ReactionController } from "../controllers/reactions.controller";
import ReactionModel from "../models/reaction.model";

const router = Router();
const isAuthorized = createAuthorizationMiddleware(ReactionModel, (user, document) => {
  return user._id.equals(document.userId);
});
const reactionController = new ReactionController();

router.post("/", isAuthenticated, reactionController.create);
router.get("/:documentId", reactionController.readById);
router.get("/", reactionController.read);
router.delete("/:documentId", isAuthorized, reactionController.delete);

export default router;