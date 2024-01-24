import { Router } from "express";
import { isAuthenticated, createAuthorizationMiddleware, checkBanStatus } from "../middleware/authChecks";
import multer from "multer";
import ExperienceController from "../controllers/experiences.controller";
import ExperienceModel from "../models/experience.model";

const router = Router();
const upload = multer({ dest: "/tmp" });
const isAuthorized = createAuthorizationMiddleware(ExperienceModel, (user, document) => {
  return user._id.equals(document.creatorId) || user.isModerator || user.isAdmin;
});

router.post(
  "/",
  isAuthenticated,
  checkBanStatus,
  upload.fields([{ name: "foodPhoto", maxCount: 1 }, { name: "personPhoto", maxCount: 1 }]),
  ExperienceController.create
);
router.get("/", ExperienceController.read)
router.get("/:documentId", ExperienceController.readById);
router.patch("/:documentId", isAuthorized, upload.fields([{ name: "foodPhoto", maxCount: 1 }, { name: "personPhoto", maxCount: 1 }]), ExperienceController.update);
router.delete("/:documentId", isAuthorized, ExperienceController.delete);

export default router;  