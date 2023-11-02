import { Router } from "express";
import controller from "../controllers/flags.controller";

const router = Router();

// Create
router.post("/", controller.createFlag);

// Read
router.get("/:flagId", controller.getFlagById);
router.get("/", controller.getFlags);

// Update
router.patch("/:flagId", controller.updateFlag);

// Delete
router.delete("/:flagId", controller.deleteFlag);

export default router;