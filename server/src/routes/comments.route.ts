import { Router } from "express";
import controller from "../controllers/comments.controller";

const router = Router({ mergeParams: true });

// Create
router.post("/", controller.createComment);

// Read
router.get("/", controller.fetchComments); // Get all comments for given experience

// Update
router.patch("/:commentId", controller.updateComment);

// Delete
router.delete("/:commentId", controller.deleteComment);

export default router;