import puppeteer from 'puppeteer';

const url = 'http://nfce.sefaz.pe.gov.br/nfce/consulta?p=26220306057223042761650260000047251260098148%7C2%7C1%7C1%7C4DF204E1731C295B86D989CF8C0D729129257FA2';

export const load = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('#tabResult');

    const elements = await page.$$eval('#tabResult > tbody > tr', data => {
        return data.map(el =>
        ({
            name: el.querySelector('.txtTit')?.innerHTML,
            code: el.querySelector('.RCod')?.innerHTML.split(' ')[1].split(')')[0],
            quantity: el.querySelector('.Rqtd')?.innerHTML.split('>')[2],
            value: el.querySelector('.RvlUnit')?.innerHTML.split('>')[2],
            total: el.querySelector('.valor')?.innerHTML
        }
        ));
    });

    await browser.close();

    return elements;
};