import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../middleware/authChecks";
import controllers from "../controllers/experiences.controller";

const router = Router();

router.post("/", isAuthenticated, controllers.createExperience);
router.get("/withinBox", controllers.getExperiencesWithinBox)
router.get("/:experienceId", controllers.getExperienceById);
router.patch("/:experienceId", isAuthorized, controllers.updateExperience);
router.delete("/:experienceId", isAuthorized, controllers.deleteExperience);

export default router;  