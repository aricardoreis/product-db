import { CosmosClient } from "@azure/cosmos";
import { getDefaultOptions } from ".";

const defaultOptions = getDefaultOptions();

export const defaultCosmosClient = new CosmosClient({
  ...defaultOptions,
});
