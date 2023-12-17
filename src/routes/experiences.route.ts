import { Router } from "express";
import { isAuthenticated, createAuthorizationMiddleware } from "../middleware/authChecks";
import ExperienceController from "../controllers/experiences.controller";
import ExperienceModel from "../models/experience.model";

const router = Router();
const isAuthorized = createAuthorizationMiddleware(ExperienceModel, (user, document) => {
  return user._id.equals(document.creatorId) || user.isModerator || user.isAdmin;
});

router.post("/", isAuthenticated, ExperienceController.create);
router.get("/", ExperienceController.read)
router.get("/:documentId", ExperienceController.readById);
router.patch("/:documentId", isAuthorized, ExperienceController.update);
router.delete("/:documentId", isAuthorized, ExperienceController.delete);

export default router;  