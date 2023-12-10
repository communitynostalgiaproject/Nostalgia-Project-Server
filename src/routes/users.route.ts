import { Router } from "express";
import { isAuthorized } from "src/middleware/authChecks";
import UserController from "../controllers/users.controller";

const router = Router();

router.post("/", UserController.create);
router.get("/", UserController.read);
router.get("/:documentId", UserController.readById);
router.patch("/:documentId", UserController.update);
router.delete("/:documentId", UserController.delete);

export default router;