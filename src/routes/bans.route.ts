import { Router } from "express";
import { isModerator } from "../middleware/authChecks";
import BanController from "../controllers/bans.controller";

const router = Router({ mergeParams: true });

router.post("/", isModerator, BanController.create);
router.get("/", BanController.findBan);
router.delete("/", isModerator, BanController.reinstate);

export default router;
