import { createPuppeteerRouter } from 'crawlee';
import { ACTIVITY, GRAND_PORTFOLIO, SUPERINVESTORS } from './links.js';
import { handleActivity } from '../handlers/activity.js';
import { handleSuperinvestors } from '../handlers/superinvestors.js';
import { handleGrandPortfolio } from '../handlers/grand_portfolio.js';

export const router = createPuppeteerRouter();

router.addDefaultHandler(async ({ log, request, page }) => {
    log.info(`Currently working on [${request.url}]`)

    switch(request.url) {
        case SUPERINVESTORS:
            await handleSuperinvestors({ page, log })
            break;
        case GRAND_PORTFOLIO:
            //await handleGrandPortfolio({ page, log })
            break;
        case ACTIVITY:
            //await handleActivity({ page, log })
            break;
        default:
            log.error(`Url unhandled by business logic.`)
    }

});

