import { Router } from "express";
import { isAuthenticated, createAuthorizationMiddleware } from "../middleware/authChecks";
import { ReactionController } from "../controllers/reactions.controller";
import ReactionModel from "../models/reaction.model";

const router = Router({ mergeParams: true });
const isAuthorized = createAuthorizationMiddleware(ReactionModel, (user, document) => {
  return user._id.equals(document.userId);
});
const reactionController = new ReactionController();

router.put("/", isAuthenticated, reactionController.create);
router.put("/remove", isAuthenticated, reactionController.remove);
router.get("/byUser", isAuthenticated, reactionController.byUser);
router.get("/", reactionController.read);
router.get("/:documentId", reactionController.readById);
router.delete("/:documentId", isAuthorized, reactionController.delete);

export default router;