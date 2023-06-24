import { EnhancedPuppeteerForCrawlee } from "@destruct/puppeteer-wrapper";
import { CrawlingContext, KeyValueStore, Log } from "crawlee";
import { Page } from "puppeteer";
import { BASE_URL, SELECTORS } from "../constants/grand_portfolio.js";



/*
Grand Portfolio
    https://www.dataroma.com/m/g/portfolio.php?L=2 // there is pagination

    pages: #pages > a // previous to last one contains the max number of pages

    table: #grid > tbody > tr
    elements: // handle some tds
*/

export async function handleGrandPortfolio(config: { page: Page, log: Log, enqueueLinks: CrawlingContext["enqueueLinks"] } ){
    const { page, log: logger, enqueueLinks } = config
    const scraper = new EnhancedPuppeteerForCrawlee({
        page,
        logger
    })



    const MAX_PAGES = parseInt(await scraper.getText({ selector: SELECTORS.max_pages }))

    scraper.logger.info(`Found max pages equal to ${MAX_PAGES}`)
    const ALL_PAGES = Array.from({ length: MAX_PAGES }, (_, index) => index+1).map(number=>BASE_URL+`${number}`)

    await KeyValueStore.setValue('grand_portfolio', [])
    await enqueueLinks({
        urls: ALL_PAGES,
        label: "grand_portfolio"
    })

}