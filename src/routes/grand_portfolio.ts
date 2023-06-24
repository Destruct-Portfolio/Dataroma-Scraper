
import { GrandPortfolioEntryT } from '../types/grand_portfolio.js';
import { SELECTORS as GrandPortfolio_SELECTORS } from '../constants/grand_portfolio.js';
import { router } from './default.js';
import { KeyValueStore } from 'crawlee';

export function addGrandPortfolioHandler() {
    
    router.addHandler('grand_portfolio', async ({ page, log })=>{
    
        const SELECTORS = GrandPortfolio_SELECTORS
    
        log.info(`Extracting portfolio data from [${page.url()}]`)
        const page_results = await page
            .$$eval(
            SELECTORS.list,
            (rows, selectors)=>{
                let listing: Array<GrandPortfolioEntryT> = []
                for(const row of rows) {
                    const line: Partial<GrandPortfolioEntryT> = {}
                    for(const column of Object.keys(selectors)){
                        line[column as keyof GrandPortfolioEntryT] = row.querySelector(selectors[column as keyof GrandPortfolioEntryT])?.textContent || ""
                    }
                    listing.push(line as GrandPortfolioEntryT)
                }
    
                return listing;
            }, SELECTORS.elements);
    
        log.info(`Extracted ${page_results.length} entry.`)
        const results = await KeyValueStore.getValue('grand_portfolio') as Array<GrandPortfolioEntryT>
    
        await KeyValueStore.setValue('grand_portfolio', [
            ...results,
            ...page_results
        ])
    
    })
}