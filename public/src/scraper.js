"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.load = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const url = 'http://nfce.sefaz.pe.gov.br/nfce/consulta?p=26220306057223042761650260000047251260098148%7C2%7C1%7C1%7C4DF204E1731C295B86D989CF8C0D729129257FA2';
const load = () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch();
    const page = yield browser.newPage();
    yield page.goto(url);
    yield page.waitForSelector('#tabResult');
    const elements = yield page.$$eval('#tabResult > tbody > tr', data => {
        return data.map(el => {
            var _a, _b, _c, _d, _e;
            return ({
                name: (_a = el.querySelector('.txtTit')) === null || _a === void 0 ? void 0 : _a.innerHTML,
                code: (_b = el.querySelector('.RCod')) === null || _b === void 0 ? void 0 : _b.innerHTML.split(' ')[1].split(')')[0],
                quantity: (_c = el.querySelector('.Rqtd')) === null || _c === void 0 ? void 0 : _c.innerHTML.split('>')[2],
                value: (_d = el.querySelector('.RvlUnit')) === null || _d === void 0 ? void 0 : _d.innerHTML.split('>')[2],
                total: (_e = el.querySelector('.valor')) === null || _e === void 0 ? void 0 : _e.innerHTML
            });
        });
    });
    yield browser.close();
    return elements;
});
exports.load = load;
