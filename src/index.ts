import express from 'express';
import { load } from './scraper';

const app = express();
const port = 80;

app.get('/', (req, res) => {
    console.log('hello world');
    res.status(200).send('hello world');
});

app.get('/load', async (req, res) => {
    const elements = await load();
    res.status(200).send(elements);
});

app.listen(port, () => {
    console.log('app is up and running...')
});