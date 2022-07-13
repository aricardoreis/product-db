import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { insertInvoice } from "./lib/db";
import { Scraper } from "./lib/scraper";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { url } = req.body;

  const scraper = Scraper.getInstance(url);
  const data = await scraper.load();
  const result = await insertInvoice(data);

  context.res = {
    body: result,
  };
};

export default httpTrigger;
