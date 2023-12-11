import { Router } from "express";
import { isAuthenticated, createAuthorizationMiddleware } from "../middleware/authChecks";
import ReactionController from "../controllers/reactions.controller";
import ReactionModel from "../models/reaction.model";

const router = Router();
const isAuthorized = createAuthorizationMiddleware(ReactionModel, (user, document) => {
  return user._id.equals(document.userId);
});

router.post("/", isAuthenticated, ReactionController.create);
router.get("/:documentId", ReactionController.readById);
router.get("/", ReactionController.read);
router.patch("/:documentId", isAuthorized, ReactionController.update);
router.delete("/:documentId", isAuthorized, ReactionController.delete);

export default router;