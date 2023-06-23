import { Page } from "puppeteer";
import { EnhancedPuppeteerForCrawlee }  from "@destruct/puppeteer-wrapper"
import { Dataset, Log } from "crawlee";
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

    const SELECTORS = {
        list: "#grid > tbody > tr",
        elements: {
            portfolio_manager: "td.firm > a",
            period: "td.period",
            sells: "td > span > a.sell",
            buys: "td > span > a.buy"
        }
    }

    let results: Array<Array<string>> = []
    const headers = Object.keys(SELECTORS.elements).map(key=>key.replaceAll('_', ' ').trim())
    results.push(headers)
    
    const activity_results = await scraper.page
    .$$eval(
      SELECTORS.list,
      (rows, selectors)=>{

        let listing: Array<Array<string>> = []
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

            listing.push([
                portfolio_manager,
                period,
                sells.join(','),
                buys.join(',')
            ])
        }

        return listing;
      }, SELECTORS.elements);

    results = [
        ...results,
        ...activity_results
    ]
    scraper.logger.info(`Finished extracting activity.`)
    // save results
    Dataset.pushData({ activity: results })
}
