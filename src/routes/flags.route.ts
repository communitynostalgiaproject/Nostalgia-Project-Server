import { Router } from "express";
import { isAuthenticated } from "src/middleware/authChecks";
import controller from "../controllers/flags.controller";

const router = Router();

// Create
router.post("/", isAuthenticated, controller.createFlag);

// Read
router.get("/:flagId", controller.getFlagById);
router.get("/", controller.getFlags);

// Update
router.patch("/", controller.updateFlag);

// Delete
router.delete("/:flagId", controller.deleteFlag);

export default router;