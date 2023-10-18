import { Router } from "express";
import controller from "src/controllers/user.controller";

const router = Router({ mergeParams: true });

// Create
router.post("/", controller.createUser);

// Read
router.get("/", controller.getUserById);

// Update
router.patch("/:commentId", controller.updateUser);

// Delete
router.delete("/:commentId", controller.deleteUser);

export default router;