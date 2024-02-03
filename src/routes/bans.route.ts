import { Router } from "express";
import { isModerator } from "../middleware/authChecks";
import { BanController } from "../controllers/bans.controller";

const router = Router({ mergeParams: true });
const banController = new BanController();

router.post("/", isModerator, banController.create);
router.get("/", banController.findBan);
router.delete("/", isModerator, banController.reinstate);

export default router;
