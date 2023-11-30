import { Router } from "express";
import controllers from "../controllers/experiences.controller";

const router = Router();

router.post("/", controllers.createExperience);
router.get("/withinBox", controllers.getExperiencesWithinBox)
router.get("/:experienceId", controllers.getExperienceById);
router.patch("/:experienceId", controllers.updateExperience);
router.delete("/:experienceId", controllers.deleteExperience);

export default router;  