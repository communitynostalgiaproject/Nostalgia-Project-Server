import { Router } from "express";
import controller from "../controllers/users.controller";

const router = Router();

router.post("/", controller.createUser);
router.get("/", controller.getUsers);
router.get("/:userId", controller.getUserById);
router.patch("/:commentId", controller.updateUser);
router.delete("/:commentId", controller.deleteUser);

export default router;