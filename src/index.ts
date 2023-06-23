/**
 * This template is a production ready boilerplate for developing with `CheerioCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

// For more information, see https://docs.apify.com/sdk/js
import { Actor } from 'apify';
// For more information, see https://crawlee.dev
import { PuppeteerCrawler } from 'crawlee';
import { router } from './routes/routes.js';
import { SUPERINVESTORS, ACTIVITY, GRAND_PORTFOLIO } from './routes/links.js';

// Initialize the Apify SDK
await Actor.init();

const startUrls = [
    SUPERINVESTORS, ACTIVITY, GRAND_PORTFOLIO
];


const crawler = new PuppeteerCrawler({
    requestHandler: router,
});

await crawler.run(startUrls);

// Exit successfully
await Actor.exit();
