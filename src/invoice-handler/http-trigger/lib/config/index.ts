import { config } from "dotenv";

config();

export const appConfig = {
  databaseName: process.env.databaseName || "",
  containerName: process.env.containerName || "",
};
