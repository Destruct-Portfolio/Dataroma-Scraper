import { Page } from "puppeteer";
import { EnhancedPuppeteerForCrawlee }  from "@destruct/puppeteer-wrapper"
import { Dataset, KeyValueStore, Log } from "crawlee";
import { SELECTORS } from "../constants/activity.js";
import { ActivityEntryT } from "../types/activity.js";
/*
Activity
    https://www.dataroma.com/m/allact.php?typ=a

    table: #grid > tbody > tr
    elements: // handle some tds 
*/
export async function handleActivity(config: { page: Page, log: Log } ){
    const { page, log: logger } = config
    const scraper = new EnhancedPuppeteerForCrawlee({
        page,
        logger
    })



    let results: Array<ActivityEntryT> = []

    const activity_results = await scraper.page
    .$$eval(
      SELECTORS.list,
      (rows, selectors)=>{

        let listing: Array<ActivityEntryT> = []
        for(const row of rows) {
            let portfolio_manager = row.querySelector(selectors.portfolio_manager)?.textContent || "";
            let period = row.querySelector(selectors.period)?.textContent || "";
            let sells: Array<string> = []
            row.querySelectorAll(selectors.sells).forEach((sell)=>{
                const stock = sell.textContent
                if (stock) sells.push(stock)
            })
            let buys: Array<string> = []
            row.querySelectorAll(selectors.buys).forEach((buy)=>{
                const stock = buy.textContent
                if(stock) buys.push(stock)
            })

            listing.push({
                portfolio_manager,
                period,
                sells: sells.join(','),
                buys: buys.join(',')
            })
        }

        return listing;
      }, SELECTORS.elements);

    results = [
        ...results,
        ...activity_results
    ]
    scraper.logger.info(`Finished extracting activity.`)

    await KeyValueStore.setValue("activity", results)
}
