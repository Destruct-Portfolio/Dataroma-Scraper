import { EnhancedPuppeteerForCrawlee } from "@destruct/puppeteer-wrapper";
import { CrawlingContext, Dataset, KeyValueStore, Log, RequestQueue, enqueueLinks } from "crawlee";
import { Page } from "puppeteer";
import { SELECTORS } from "../constants/superinvestors.js";
import { BASE_URL } from "../constants/shared.js";
import { columnSplitter } from "../adapters/superinvestors.js";
import { SuperinvestorsEntryT } from "../types/superinvestors.js";



/*
Superinvestors 
    https://www.dataroma.com/m/managers.php

    table: #grid > tbody > tr
    element:  td.man > a // grab both link and text
        table: #grid > tbody > tr
        element: td.stock > a // grab text
        2# element: td.hist > a // grab link
            table: #grid > tbody > tr
            elements: // handle some tds
*/
export async function handleSuperinvestors(config: { page: Page, log: Log, enqueueLinks: CrawlingContext["enqueueLinks"] } ){
    const { page, log: logger } = config
    const scraper = new EnhancedPuppeteerForCrawlee({
        page,
        logger
    })



    await KeyValueStore.setValue('superinvestors', [])

    const managers = await scraper.page
        .$$eval(
            SELECTORS.shared,
            (rows, selectors)=>{
      
              let listing: Array<Array<string>> = []
                for(const row of rows){
                    let manager = row.querySelector(selectors.manager)?.textContent || ""
                    let manager_link = row.querySelector(selectors.manager)?.getAttribute('href') || ""

                    if(manager_link==="") continue

                    listing.push([
                        manager,
                        manager_link
                    ])
                }
              return listing;
            }, SELECTORS[1].elements);

    Dataset.pushData({managers: managers})
    const queue = await RequestQueue.open();

    scraper.logger.info(`Found ${managers.length} portfolio manager(s).`)
    for(const [index, manager] of managers.entries()){
        const [manager_name, link] = manager
        const url = BASE_URL+link
        logger.info(`Checking [${manager}] portfolio | ${url}`)
        await enqueueLinks({
            urls: [url],
            label: 'superinvestors_stocks',
            requestQueue: queue,
            userData: {
                manager_name
            }
        })
    }

}