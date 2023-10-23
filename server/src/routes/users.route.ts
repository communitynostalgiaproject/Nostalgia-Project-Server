import { Router } from "express";
import controller from "../controllers/users.controller";

const router = Router();

// Create
router.post("/", controller.createUser);

// Read
router.get("/", controller.getUserById);

// Update
router.patch("/:commentId", controller.updateUser);

// Delete
router.delete("/:commentId", controller.deleteUser);

export default router;