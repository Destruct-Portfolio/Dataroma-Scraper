import { createPuppeteerRouter } from 'crawlee';
import { ACTIVITY, GRAND_PORTFOLIO, SUPERINVESTORS } from './links.js';
import { handleSuperinvestors } from '../handlers/superinvestors.js';
import { handleGrandPortfolio } from '../handlers/grand_portfolio.js';
import { handleActivity } from '../handlers/activity.js';
import { addGrandPortfolioHandler } from './grand_portfolio.js';
import { addSuperinvestorsHandler } from './superinvestors.js';

export const router = createPuppeteerRouter();

router.addDefaultHandler(async ({ log, request, page, enqueueLinks }) => {
    log.info(`Currently working on [${request.url}]`)

    switch(request.url) {
        case SUPERINVESTORS:
            await handleSuperinvestors({ page, log, enqueueLinks })
            break;
        case GRAND_PORTFOLIO:
            await handleGrandPortfolio({ page, log, enqueueLinks })
            break;
        case ACTIVITY:
            await handleActivity({ page, log })
            break;
        default:
            log.error(`Url unhandled by business logic.`)
    }

});

addGrandPortfolioHandler()
addSuperinvestorsHandler()

