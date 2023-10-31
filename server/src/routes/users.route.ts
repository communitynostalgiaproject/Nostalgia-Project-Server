import { Router } from "express";
import controller from "../controllers/users.controller";

const router = Router();

router.post("/", controller.createUser);
router.get("/:limit?", controller.getUsers);
router.get("/:userId", controller.getUserById);
router.patch("/", controller.updateUser);
router.delete("/:userId", controller.deleteUser);

export default router;