import { appConfig } from "./config";
import { Invoice } from "./models";
import { defaultCosmosClient } from "./utils";

const getCosmosDbContainer = () => {
  const database = defaultCosmosClient.database(appConfig.databaseName);
  return database.container(appConfig.containerName);
};

export const fetchInvoices = async () => {
  const query = "SELECT * FROM c";
  const dbContainer = getCosmosDbContainer();
  const { resources } = await dbContainer.items
    .query<Invoice>(query)
    .fetchAll();
  return resources;
};

export const insertInvoice = async (data: Invoice) => {
  const dbContainer = getCosmosDbContainer();
  return dbContainer.items.create(data);
};
