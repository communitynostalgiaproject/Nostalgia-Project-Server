import { Router } from "express";
import controllers from "src/controllers/experiences.controller";

const router = Router();

router.post("/", controllers.createExperience);
router.get("/locations", controllers.getAllExperienceLocations);
router.post("/searchLocationsByGeometry", controllers.searchLocationsByGeometry);
router.post("/searchByGeometry", controllers.searchByGeometry)
router.get("/:experienceId", controllers.getExperienceById);
router.patch("/:experienceId", controllers.editExperience);
router.delete(":/experienceId", controllers.deleteExperience);

export default router;  