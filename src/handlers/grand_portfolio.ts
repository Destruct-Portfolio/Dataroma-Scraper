import { EnhancedPuppeteerForCrawlee } from "@destruct/puppeteer-wrapper";
import { Dataset, Log } from "crawlee";
import { Page } from "puppeteer";


/*
Grand Portfolio
    https://www.dataroma.com/m/g/portfolio.php?L=2 // there is pagination

    pages: #pages > a // previous to last one contains the max number of pages

    table: #grid > tbody > tr
    elements: // handle some tds
*/

export async function handleGrandPortfolio(config: { page: Page, log: Log } ){
    const { page, log: logger } = config
    const scraper = new EnhancedPuppeteerForCrawlee({
        page,
        logger
    })

    const BASE_URL = "https://www.dataroma.com/m/g/portfolio.php?L="
    const SELECTORS = {
        max_pages: "#pages > a:nth-last-child(2)",
        list: "#grid > tbody > tr",
        elements: {
            symbol: "td.sym > a",
            stock: "td.stock > a",
            percentage: "td:nth-child(3)",
            ownership_count: "td:nth-child(4)",
            hold_price: "td:nth-child(5)",
            max_percentage: "td:nth-child(6)",
            current_price: "td:nth-child(7)",
            _52_week_low: "td:nth-child(8)",
            percentage_above_52_week_low: "td:nth-child(9)",
            _52_week_high: "td:nth-child(10)"
        }
    }

    const MAX_PAGES = parseInt(await scraper.getText({ selector: SELECTORS.max_pages }))

    scraper.logger.info(`Found max pages equal to ${MAX_PAGES}`)
    const ALL_PAGES = Array.from({ length: MAX_PAGES }, (_, index) => index + 1).map(number=>BASE_URL+`${number}`)

    let results: Array<Array<string>> = []
    const headers = Object.keys(SELECTORS.elements).map(key=>key.replaceAll('_', ' ').trim())
    results.push(headers)
    for(const page_url of ALL_PAGES) {
        await scraper.navigate(page_url)
        const page_results = await scraper.page
            .$$eval(
            SELECTORS.list,
            (rows, selectors)=>{

                let listing: Array<Array<string>> = []
                for(const row of rows) {
                    const line: Array<string> = []
                    for(const column of Object.keys(selectors)){
                        line.push(row.querySelector(selectors[column as keyof typeof selectors])?.textContent || "")
                    }
                    listing.push(line)
                }

                return listing;
            }, SELECTORS.elements);
        results = [
            ...results,
            ...page_results
        ]
    }

    Dataset.pushData({
        grand_portfolio: results
    })
}