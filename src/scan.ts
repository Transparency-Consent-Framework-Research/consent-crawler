import crypto from 'crypto';
// @ts-expect-error - dayjs has no default export in strict moduleResolution
import dayjs from 'dayjs';
import { PlaywrightCrawler, ProxyConfiguration, RequestList } from 'crawlee';
import { make_target_list } from './util/target_list.js';
import { save_to_bigquery } from './util/bigquery.js';
// @ts-expect-error - constants.ts may be gitignored; resolved at runtime
import { CONSTANTS, scanTargetListPath, proxyUrls } from './constants.js';

export type ScanData = {
  publisher_url: string;
  tcfapi_detected: boolean;
  cmp_id: number | null;
  crawl_reason: string;
  timestamp: number;
}

// Open a CSV list of domains and turn into an array of target URLs, or use single DEV_URL when DEV_MODE
const startUrls = CONSTANTS.DEV_MODE
  ? [CONSTANTS.DEV_URL.startsWith('http') ? CONSTANTS.DEV_URL : `https://${CONSTANTS.DEV_URL}`]
  : await make_target_list(scanTargetListPath);

console.log('Loading Request List');
const requestList = await RequestList.open('tranco-top-1m-scan', startUrls);
console.log('Request List Loaded');


const crawler = new PlaywrightCrawler({
  // Takes array of http(s) or socks5 proxies, they are used in a round-robin fashion between 
  // target domains in the queue (only when CONSTANTS.USE_PROXY is true and proxyUrls has entries)
  maxRequestRetries: 2,
  retryOnBlocked: true,
  ...(CONSTANTS.USE_PROXY && proxyUrls?.length
    ? { proxyConfiguration: new ProxyConfiguration({ proxyUrls }) }
    : {}),
  launchContext: {
    // Here you can set options that are passed to the playwright .launch() function.
    launchOptions: {
      headless: CONSTANTS.HEADLESS,
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH && {
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      }),
    },
    // This along with persistCookiesPerSession attempt to ensure a clean session for every domain
    useIncognitoPages: true,
  },
  requestList,
  maxConcurrency: CONSTANTS.CONCURRENCY ?? 7,
  // Disable cookie persistance to ensure a clean session for every URL
  persistCookiesPerSession: false,
  // Hooks to run before navigation starts on a give ncrawl
  preNavigationHooks: [
    async ({ blockRequests }) => {
      if (CONSTANTS.ENABLE_MEDIA_BLOCK) {
        await blockRequests();
      }
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
    

      await page.exposeBinding('_tcBinding', async (_context: unknown, value: { success: boolean; data?: { cmpId?: number } }) => {
        crawlingContext.log.info(`${page.url()} consent update`);

        if(!crawlingContext.request.userData?.tcfapi_detected) {
          crawlingContext.request.userData.tcfapi_detected = true;
        }

        if(value.success && value.data?.cmpId != null) {
          if(!crawlingContext.request?.userData.cmp_id) {
            crawlingContext.request.userData.cmp_id = value.data.cmpId;
          }
        }
      });

      await page.addInitScript(async () => {
        const maxChecks = 10;
        let checks = 0;
        const apiInterval = setInterval(() => {
          checks += 1;
          //@ts-ignore
          if (window.__tcfapi !== undefined) {
            //@ts-ignore
            window.__tcfapi('addEventListener', 2, (tcData, success) => {
              //@ts-ignore
              window._tcBinding({
                success: success,
                data: tcData,
              });
            });
            clearInterval(apiInterval);
          } else if (checks >= maxChecks) {
            clearInterval(apiInterval);
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

    if (scanData.tcfapi_detected) {
      log.info('TCF API detected', { cmp_id: scanData.cmp_id });
    }

    if (CONSTANTS.SAVE_TO_BIGQUERY) {
      await save_to_bigquery('v2p2', 'publisher_cmp', scanData);
    }

  },

  async failedRequestHandler({ request, log }) {
    log.warning(`${request.url} failed`);
    const scanData: ScanData = {
      publisher_url: request.url,
      tcfapi_detected: false,
      cmp_id: null,
      crawl_reason: 'Tranco Top 1M - Failure',
      timestamp: dayjs().unix(),
    };
    if (CONSTANTS.SAVE_TO_BIGQUERY) {
      await save_to_bigquery('v2p2', 'publisher_cmp', scanData);
    }
  }
});

// Start the crawl
console.log(`Crawling ${startUrls.length} URLs`);
await crawler.run();

// Exit out once crawl the crawl is done
process.exit();
