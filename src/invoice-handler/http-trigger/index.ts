import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Scraper } from "../lib";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    console.log('************ STARTING **************')

    const scraper = new Scraper('https://www.futbin.com');
    const playerName = await scraper.load('22/player/26054', '.header_name');

    console.log('name: ' + playerName);

    context.res = {
        body: playerName,
    };
};

export default httpTrigger;