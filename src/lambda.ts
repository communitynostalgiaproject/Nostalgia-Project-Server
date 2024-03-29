import "source-map-support/register";
import serverlessExpress from "@codegenie/serverless-express";
import { Express } from "express";
import { setupApp } from "./config/app";

let app: Express;

export const handler = async (event: any, context: any) => {
  if (!app) {
    app = await setupApp(`${process.env.MONGODB_URI}`);
  }
  const serverlessHandler = serverlessExpress({ app });
  return serverlessHandler(event, context);
};
