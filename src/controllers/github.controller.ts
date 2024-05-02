import { Octokit } from "@octokit/core";
import { BadRequest } from "../utils/customErrors";
import { Request, Response, NextFunction } from "express";

export class GithubController {
  private octokit: Octokit;

  constructor() {
    if (!process.env.GITHUB_AUTH_TOKEN) console.log("GitHub Auth Token not found");

    this.octokit = new Octokit({
      auth: process.env.GITHUB_AUTH_TOKEN
    });;
  }

  createBugReportIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message } = req.body;

      if (!message) throw new BadRequest("Expected 'message' in request body JSON");

      await this.octokit.request("POST /repos/{owner}/{repo}/issues", {
        owner: "communitynostalgiaproject",
        repo: "Nostalgia-Project-Client",
        title: "New User Bug Report",
        body: message
      });

      res.status(201).send("Bug report created");
    } catch (err) {
      console.log(`Error creating bug report: ${err}`);
      next(err);
    }
  }
}