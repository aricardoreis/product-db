"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const analytics_1 = require("firebase/analytics");
const firebaseConfig = {
    apiKey: "AIzaSyCxUsj0MfpaNd8HgyP_R-ek0zMxlpatMAs",
    authDomain: "product-history-c7a6e.firebaseapp.com",
    projectId: "product-history-c7a6e",
    storageBucket: "product-history-c7a6e.appspot.com",
    messagingSenderId: "125607574450",
    appId: "1:125607574450:web:e757b511833849e94282ab",
    measurementId: "G-EPV49JDQ90"
};
const app = (0, app_1.initializeApp)(firebaseConfig);
const analytics = (0, analytics_1.getAnalytics)(app);
