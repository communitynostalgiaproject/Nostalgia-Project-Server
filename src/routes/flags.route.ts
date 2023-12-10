import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../middleware/authChecks";
import FlagController from "../controllers/flags.controller";

const router = Router();

router.post("/", isAuthenticated, FlagController.create);
router.get("/:documentId", FlagController.readById);
router.get("/", FlagController.read);
router.patch("/:documentId", isAuthorized, FlagController.update);
router.delete("/:documentId", isAuthorized, FlagController.delete);

export default router;