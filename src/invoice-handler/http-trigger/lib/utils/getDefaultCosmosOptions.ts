import { CosmosClientOptions } from "@azure/cosmos";
import { config } from "dotenv";

config();

export const getDefaultOptions = (): CosmosClientOptions => {
  if (
    !process.env.COSMOS_ENDPOINT ||
    !process.env.COSMOS_KEY ||
    process.env.COSMOS_ENDPOINT === "undefined" ||
    process.env.COSMOS_KEY === "undefined"
  ) {
    throw new Error(
      "You must define Cosmos endpoint and key environment variables!"
    );
  }

  const clientOptions: CosmosClientOptions = {
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY,
    connectionPolicy: {
      requestTimeout:
        parseInt(process.env.COSMOS_REQUEST_TIMEOUT || "", 10) || 1500,
    },
  };
  return clientOptions;
};
