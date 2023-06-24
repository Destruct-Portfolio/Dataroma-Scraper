import { RequestQueue, KeyValueStore } from "apify";
import { BASE_URL } from "../constants/shared.js";
import { SuperinvestorsEntryT } from "../types/superinvestors.js";
import { router } from "./default.js";
import { SELECTORS as Superinvestors_SELECTORS } from "../constants/superinvestors.js";
import { columnSplitter } from "../adapters/superinvestors.js";

export function addSuperinvestorsHandler(){
    
    router.addHandler('superinvestors_stocks', async ({ log, page, enqueueLinks, request })=> {
        const USERDATA = request.userData as { manager_name: string }
        const SELECTORS = Superinvestors_SELECTORS
    
        const manager_name = USERDATA['manager_name']
        const stocks = await page
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
    
            const queue = await RequestQueue.open();
            log.info(`[${manager_name}] | Found ${stocks.length} stocks.`)
            for(const stock of stocks) {
                const [stock_name, link] = stock
                const url = BASE_URL+link
                log.info(`[${manager_name}] | Grabbing ${stock_name} stock history.`)
                await enqueueLinks({
                    urls: [url],
                    label: "superinvestors_history",
                    requestQueue: queue,
                    userData: {
                        manager_name,
                        stock_name
                    }
                })
    
            }
    
    })
    
    router.addHandler('superinvestors_history', async ({ page, request, log })=> {
    
        const USERDATA = request.userData as { manager_name: string, stock_name: string }
        const SELECTORS = Superinvestors_SELECTORS
        const manager_name = USERDATA['manager_name']
        const stock_name = USERDATA['stock_name']
        const superinvestor_results = await page
        .$$eval(
            SELECTORS.shared,
            (rows, data)=>{
            const { selectors, manager_name, stock_name } = data
            let listing: Array<SuperinvestorsEntryT> = []
                for(const row of rows){
                    const line: Partial<SuperinvestorsEntryT> = {
                        manager: manager_name,
                        stock: stock_name
                    }
    
                    for(const column of Object.keys(selectors)){
                        line[column as keyof SuperinvestorsEntryT] =row.querySelector(selectors[column as keyof typeof selectors])?.textContent || ""
                    }
                    listing.push(line as SuperinvestorsEntryT)
                }
            return listing;
            }, { selectors: SELECTORS[3].elements, manager_name, stock_name });
    
        log.info(`[${manager_name}] | Stock<${stock_name}> : ${superinvestor_results.length} historical data points.`)
        let superinvestors_results = await KeyValueStore.getValue('superinvestors') as Array<SuperinvestorsEntryT>
        await KeyValueStore.setValue('superinvestors', [
            ...superinvestors_results,
            ...columnSplitter(superinvestor_results)
        ])
    })
}

