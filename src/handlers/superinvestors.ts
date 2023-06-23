import { EnhancedPuppeteerForCrawlee } from "@destruct/puppeteer-wrapper";
import { Dataset, Log } from "crawlee";
import { Page } from "puppeteer";


const BASE_URL = "https://www.dataroma.com"
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
export async function handleSuperinvestors(config: { page: Page, log: Log } ){
    const { page, log: logger } = config
    const scraper = new EnhancedPuppeteerForCrawlee({
        page,
        logger
    })

    const SELECTORS = {
        shared: "#grid > tbody > tr",
        1: {
            elements: {
                manager: "td.man > a"
            }
        },
        2: {
            elements: {
                stock: "td.stock > a",
                history: "td.hist > a"
            }
        },
        3: {
            elements: {
                period: "td:nth-child(1)",
                shares: "td:nth-child(2)",
                percentage_of_portfolio: "td:nth-child(3)",
                activity: "td:nth-child(4)",
                percentage_change_to_portfolio: "td:nth-child(5)",
                reported_price: "td:nth-child(6)",
            }
        }
    }

    let results: Array<Array<string>> = []
    const headers = [
        ...Object.keys(SELECTORS[1].elements),
        ...[Object.keys(SELECTORS[2].elements)[0]],
        ...Object.keys(SELECTORS[3].elements)
    ].map(key=>key.replaceAll('_', ' ').trim())
    results.push(headers)

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

    scraper.logger.info(`Scrapped ${managers.length} portfolio manager.`)
    let superinvestors_results: Array<Array<string>> = []
    for(const manager of managers){
        const [manager_name, link] = manager
        await scraper.navigate(BASE_URL+link)
        const stocks = await scraper.page
            .$$eval(
                SELECTORS.shared,
                (rows, selectors)=>{
        
                let listing: Array<Array<string>> = []
                    for(const row of rows){
                        let stock = row.querySelector(selectors.stock)?.textContent || ""
                        let history_link = row.querySelector(selectors.history)?.getAttribute('href') || ""

                        if(history_link==="") continue
                        listing.push([
                            stock,
                            history_link
                        ])
                    }
                return listing;
                }, SELECTORS[2].elements);

        for(const stock of stocks) {
            const [stock_name, link] = stock
            await scraper.navigate(BASE_URL+link)
            const history = await scraper.page
            .$$eval(
                SELECTORS.shared,
                (rows, selectors)=>{
        
                let listing: Array<Array<string>> = []
                    for(const row of rows){
                        const line: Array<string> = []
                        for(const column of Object.keys(selectors)){
                            line.push(row.querySelector(selectors[column as keyof typeof selectors])?.textContent || "")
                        }
                        listing.push(line)
                    }
                return listing;
                }, SELECTORS[3].elements);

            const superinvestor_results = history.map(
                entry=>[manager_name, stock_name, ...entry]
            )
            
            superinvestors_results = [
                ...superinvestors_results,
                ...superinvestor_results
            ]
        }
        
        break;
    }


    results = [
        ...results,
        ...superinvestors_results
    ]

    Dataset.pushData({
        superinvestors: results
    })
}