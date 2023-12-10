import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../middleware/authChecks";
import ExperienceController from "../controllers/experiences.controller";

const router = Router();

router.post("/", isAuthenticated, ExperienceController.create);
router.get("/", ExperienceController.read)
router.get("/:documentId", ExperienceController.readById);
router.patch("/:documentId", isAuthorized, ExperienceController.update);
router.delete("/:documentId", isAuthorized, ExperienceController.delete);

export default router;  