import { Router } from "express";
import { isModerator } from "../middleware/authChecks";
import BanController from "../controllers/bans.controller";

const router = Router();

router.post("/", isModerator, BanController.create);
router.get("/:documentId", isModerator, BanController.readById);
router.get("/", isModerator, BanController.read);
router.delete("/", isModerator, BanController.reinstate);

export default router;
