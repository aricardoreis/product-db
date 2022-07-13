import * as puppeteer from "puppeteer";
import { Invoice } from "./models";

export class Scraper {
  private static instance: Scraper;

  protected baseUrl: string;
  private browser: puppeteer.Browser;
  protected page: puppeteer.Page;

  protected constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public static getInstance = (baseUrl: string): Scraper => {
    if (!Scraper.instance) {
      Scraper.instance = new Scraper(baseUrl);
    }
    return Scraper.instance;
  };

  launchBrowser = async () => {
    this.browser = await puppeteer.launch({
      headless: true,
      devtools: false,
      defaultViewport: {
        width: 1024 + Math.floor(Math.random() * 100),
        height: 768 + Math.floor(Math.random() * 100),
      },
      args: ["--allow-file-access-from-files"],
    });
  };

  initPage = async (url: string) => {
    await this.launchBrowser();
    this.page = await this.browser.newPage();
    await this.page.goto(url);
  };

  load = async () => {
    await this.initPage(this.baseUrl);

    const sale = await this.page.evaluate((sel: string) => {
      const sale = {
        products: [],
        store: {
          name: "",
          address: "",
        },
        total: 0,
        itemsCount: 0,
        date: undefined,
        accessKey: "",
      };

      const rows = Array.from(document.querySelectorAll(sel));
      rows.forEach((item) => {
        const unitType = item.querySelector(".RUN").textContent.split(" ")[1];
        sale.products.push({
          product: {
            name: item.querySelector(".txtTit").textContent,
            value: parseFloat(
              item
                .querySelector(".RvlUnit")
                .textContent.trim()
                .split(" ")[2]
                .replace(",", ".")
            ),
          },
          code: parseInt(
            item
              .querySelector(".RCod")
              .textContent.split(" ")[1]
              .replace(")", "")
              .trim()
          ),
          quantity: parseInt(
            item.querySelector(".Rqtd").textContent.split(" ")[1]
          ),
          total: parseFloat(
            item.querySelector(".valor").textContent.replace(",", ".")
          ),
          type: unitType,
        });
      });

      sale.store.name = document
        .querySelector("#conteudo .txtTopo")
        .textContent.trim();
      sale.store.address = document
        .querySelectorAll("#conteudo .text")[1]
        .textContent.split(",")
        .map((i) => i.trim())
        .join(", ");
      sale.itemsCount = parseInt(
        document.querySelectorAll(".totalNumb")[0].textContent.replace(",", ".")
      );
      sale.total = parseFloat(
        document.querySelectorAll(".totalNumb")[1].textContent.replace(",", ".")
      );
      const datePart = document.querySelector(
        "#infos > div:nth-child(1) > div > ul > li"
      ).textContent;
      const dateTokens = datePart
        .match(/(\d{4}([.\-/ ])\d{2}\2\d{2}|\d{2}([.\-/ ])\d{2}\3\d{4})/)[0]
        .split("/")
        .map((i) => parseInt(i));
      sale.date = dateTokens.join("/");
      sale.accessKey = document
        .querySelector("#infos > div:nth-child(2) > div > ul > li")
        .textContent.split(":")[2];

      return sale;
    }, "#tabResult tr");

    this.close();

    return sale as Invoice;
  };

  public close = async () => {
    await this.page.close();
    await this.browser.close();
  };
}
