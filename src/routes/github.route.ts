import { Router } from "express";
import { GithubController } from "../controllers/github.controller";

const router = Router();
const githubController = new GithubController();

router.post("/bug-report", githubController.createBugReportIssue);

export default router;