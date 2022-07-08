import * as puppeteer from 'puppeteer';

export class Scraper {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    load = async (path: string, query: string) => {
        const browser = await puppeteer.launch({
            headless: true,
            devtools: false,
            defaultViewport: {
                width: 1024 + Math.floor(Math.random() * 100),
                height: 768 + Math.floor(Math.random() * 100),
            }
        });
        const page = await browser.newPage();
        const fakeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko';

        await page.evaluateOnNewDocument(fakeUserAgent => {
            let open = window.open;
            window.open = (...args) => {
                let newPage = open(...args);
                Object.defineProperty(newPage.navigator, 'userAgent', { get: () => fakeUserAgent });
                return newPage;
            }

            window.open.toString = () => 'function open() { [native code] }';
        }, fakeUserAgent);

        await page.setUserAgent(fakeUserAgent);

        const url = `${this.baseUrl}/${path}`;

        const cookies = await page.cookies(url);
        await page.deleteCookie(...cookies);

        await page.goto(url, { waitUntil: 'load' });
        const pageData = await page.evaluate((sel: string) => {
            const name = document.querySelectorAll(sel)[0].textContent;
            return name;
        }, query);

        await page.close();
        await browser.close();

        return pageData;
    }

}