//@ts-nocheck
import crypto from 'crypto';
import dayjs from "dayjs";
import { PlaywrightCrawler, ProxyConfiguration, RequestList, Configuration  } from 'crawlee';
import { make_target_list } from './util/target_list.js';
import { save_scan } from './util/bigquery.js';
import { scanTargetListPath, proxyUrls } from './constants.js';

export type ScanData = {
  publisher_url: string;
  tcfapi_detected: boolean;
  cmp_id: number | null;
  crawl_reason: string;
  timestamp: number;
}

// Get the global configuration
const config = Configuration.getGlobalConfig();

// Open a CSV list of domains and turn into an array of target URLs
// @TODO: Add new tranco top1m
const startUrls = await make_target_list(scanTargetListPath);

// console.log('Loading Request List');
// const requestList = await RequestList.open('tranco-top-1m-scan', startUrls);
// console.log('Request List Loaded');


const crawler = new PlaywrightCrawler({
  // Takes array of http(s) or socks5 proxies, they are used in a round-robin fashion between 
  // target domains in the queue
  maxRequestRetries: 2,
  retryOnBlocked: true,
  proxyConfiguration: new ProxyConfiguration({
    proxyUrls: proxyUrls
  }),
  launchContext: {
    // Here you can set options that are passed to the playwright .launch() function.
    launchOptions: {
      headless: true,
    },
    // This along with persistCookiesPerSession attempt to ensure a clean session for every domain
    useIncognitoPages: true,
  },
  // requestList: requestList,
  // Set the number of concurrent crawling instances
  maxConcurrency: 7,
  // Disable cookie persistance to ensure a clean session for every URL
  persistCookiesPerSession: false,
  // Hooks to run before navigation starts on a give ncrawl
  preNavigationHooks: [
    async ({ blockRequests }) => {
      // Block all requests to URLs that include `adsbygoogle.js` and also all defaults.
      await blockRequests();
    },
    // Announce the crawl and set navigation settings
    (crawlingContext, gotoOptions) => {
      crawlingContext.request.userData.session_id = crypto.randomUUID();
      crawlingContext.log.info(`⏳ Crawling ${crawlingContext.request.uniqueKey}`);
      if(gotoOptions) {
        gotoOptions.timeout = 45_000;
        gotoOptions.waitUntil = 'networkidle';
      }
    },
    async (crawlingContext) => {
      const { page } = crawlingContext;

      crawlingContext.request.userData.tcfapi_detected = false;
      crawlingContext.request.userData.cmp_id = null;
    

      await page.exposeBinding('_tcBinding', async ({ frame }, value) => {
        //@ts-ignore
        crawlingContext.log.info(`${page.url()} consent update for ${frame._guid}`);

        if(!crawlingContext.request.userData?.tcfapi_detected) {
          crawlingContext.request.userData.tcfapi_detected = true;
        }

        console.log(value);
        if(value.success) {
          if(!crawlingContext.request?.userData.cmp_id) {
            crawlingContext.request.userData.cmp_id = value.data.cmpId;
          }
        }
      });

      await page.addInitScript(async () => {
        const apiInterval = setInterval(() => {
          //@ts-ignore
          if(window.__tcfapi !== undefined) {
            //@ts-ignore
            window.__tcfapi('addEventListener', 2, (tcData, success) => {
            //@ts-ignore
              window._tcBinding({
                success: success,
                data: tcData,
              });
            });
            clearInterval(apiInterval);
          } else {
            //@ts-ignore
            console.log('not defined', window.__tcfapi);
          }
        }, 1000);
      });
    }
  ],
  // Executes after postnav hooks
  requestHandler: async({request, log}) => {
    log.info(`🟢 ${request.url} loaded`);
    // Act on the consent banner if one has been detected
    // @TODO: Should be moved to a postnav hook
    const scanData: ScanData = {
      publisher_url: request.url,
      tcfapi_detected: !!request.userData.tcfapi_detected,
      cmp_id: request.userData?.cmp_id,
      crawl_reason: 'Tranco Top 1M',
      timestamp: dayjs().unix(),
    };

    if(scanData.tcfapi_detected) {
      console.log('✨✨✨✨',scanData, '✨✨✨✨');
    }

    await save_scan(scanData);

  },

  async failedRequestHandler({ request }) {
    console.log(`${request.url} 'failed`);
    const scanData: ScanData = {
      publisher_url: request.url,
      tcfapi_detected: false,
      cmp_id: null,
      crawl_reason: 'Tranco Top 1M - Failure',
      timestamp: dayjs().unix(),
    };
    await save_scan(scanData);
    console.log(`Saved Failed Crawl - ${request.url}`);
  }
});

// Start the crawl
console.log(`Crawlign ${startUrls.length} URLs`);
await crawler.run(startUrls);

// Exit out once crawl the crawl is done
process.exit();
