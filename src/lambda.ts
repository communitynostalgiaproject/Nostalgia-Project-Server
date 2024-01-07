import "source-map-support/register";
import serverlessExpress from "@codegenie/serverless-express";
import { setupApp } from "./config/app";

const app = setupApp(`${process.env.MONGODB_URI}`);

export const handler = serverlessExpress({ app });