import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Scraper } from "./lib/scraper";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { url } = req.body;

  const scraper = Scraper.getInstance(url);
  const data = await scraper.load();

  context.res = {
    body: data,
  };
};

export default httpTrigger;
