import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../middleware/authChecks";
import controller from "../controllers/flags.controller";

const router = Router();

// Create
router.post("/", isAuthenticated, controller.createFlag);

// Read
router.get("/:flagId", controller.getFlagById);
router.get("/", controller.getFlags);

// Update
router.patch("/:flagId", isAuthorized, controller.updateFlag);

// Delete
router.delete("/:flagId", isAuthorized, controller.deleteFlag);

export default router;