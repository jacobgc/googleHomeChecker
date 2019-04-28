// URL to check https://store.google.com/gb/config/uylj89x6oh

const puppeteer = require('puppeteer');
const express = require('express');
const debug = require('debug')('googleHomeChecker');
const cron = require('node-cron');
const app = express()
const port = 3001;

let status = "STATS NOT ACQUIRED YET";

cron.schedule('* * * * *', async () => { // Get stats once a minute
    debug('GETTING NEW STATS');
    status = await getStatus()
    debug('STATS UPDATED')
});


app.get('/', async (req, res) => {
    res.setHeader('Cache-Control', 'max-age=60');
    res.send(status);
})

app.listen(port, () => console.log(`googleHomeChecker running on port: ${port}!`))

async function getStatus(){

    debug('Loading browser');
    const browser = await puppeteer.launch({headless: true});
    debug('Creating page');
    const page = await browser.newPage()
    debug('Setting viewport');
    await page.setViewport({ width: 1280, height: 800 })
    debug('Navigating to the URL');
    await page.goto('https://store.google.com/gb/config/uylj89x6oh');
     debug('Waiting for idle network');
     await page.waitForNavigation({ waitUntil: 'networkidle0' });

    debug('Evaluating for chalkText');
    let chalkText = await page.evaluate( ()=> {
        let text = document.querySelector('#mqn-config-controller > div > div.mqn-product-collection.ng-scope > div > div.mqn-product-collection__gallery.mqn-product-collection__gallery--centered.slick-initialized.slick-slider > div > div > div.mqn-product-collection__card.ng-scope.slick-slide.slick-current.slick-active > div > div.mqn-product-collection__card__meta.mqn-product-collection__card__meta--active > div.mqn-product-collection__card__availability.ng-binding.mqn-product-collection__card__availability--out-of-stock > span')
        return text.innerHTML;
    });

    debug('Evaluating for charcoalText');
    let charcoalText = await page.evaluate( ()=> {
        let text = document.querySelector('#mqn-config-controller > div > div.mqn-product-collection.ng-scope > div > div.mqn-product-collection__gallery.mqn-product-collection__gallery--centered.slick-initialized.slick-slider > div > div > div:nth-child(2) > div > div.mqn-product-collection__card__meta.mqn-product-collection__card__meta--active > div.mqn-product-collection__card__availability.ng-binding.mqn-product-collection__card__availability--out-of-stock > span')
        return text.innerHTML;
    });

    debug('Closing the browser');
    browser.close()


    debug('Returning output');
    return JSON.parse(`{"chalkStatus":"${chalkText}", "charcoalStatus":"${charcoalText}"}`)
    
    
}

