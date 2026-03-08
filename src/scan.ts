import crypto from 'crypto';
import dayjs from 'dayjs';
import { PlaywrightCrawler, ProxyConfiguration, RequestList } from 'crawlee';
import { make_target_list } from './util/target_list.js';
import { save_to_bigquery } from './util/bigquery.js';
import { CONSTANTS, scanTargetListPath, proxyUrls } from './constants.js';

export type ScanData = {
  publisher_url: string;
  tcfapi_detected: boolean;
  cmp_id: number | null;
  uspapi_detected: boolean;
  usp_data: string | null;
  gpp_detected: boolean;
  gpp_data: string | null;
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
      crawlingContext.request.userData.uspapi_detected = false;
      crawlingContext.request.userData.gpp_detected = false;
      crawlingContext.request.userData.uspData = null;
      crawlingContext.request.userData.gppData = null;
    

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
  postNavigationHooks: [
    async (crawlingContext) => {
      const { page, log, request } = crawlingContext;

      // Check for GPP API
      try {
        let gppFound = false;
        for (let i = 0; i < 5; i++) {
          const exists = await page.evaluate(() => (window as any).__gpp !== undefined);
          if (exists) {
            gppFound = true;
            log.info(`GPP API found on attempt ${i + 1}`);
            break;
          }
          await page.waitForTimeout(1000);
        }

        if (gppFound) {
          const gppData = await page.evaluate(() =>
            new Promise((resolve) =>
              (window as any).__gpp('ping', (data: unknown, success: boolean) =>
                resolve(success ? data : null)
              )
            )
          );
          request.userData.gpp_detected = true;
          request.userData.gppData = gppData;
          log.info(`GPP Data: ${JSON.stringify(gppData)}`);
        }
      } catch (err) {
        log.info(`Error checking GPP API: ${err}`);
      }

      // Check for USP API
      try {
        let uspFound = false;
        for (let i = 0; i < 5; i++) {
          const exists = await page.evaluate(() => (window as any).__uspapi !== undefined);
          if (exists) {
            uspFound = true;
            log.info(`USP API found on attempt ${i + 1}`);
            break;
          }
          await page.waitForTimeout(1000);
        }

        if (uspFound) {
          const uspData = await Promise.race([
            page.evaluate(() =>
              new Promise((resolve) => {
                try {
                  (window as any).__uspapi('getUSPData', 1, (data: unknown, success: boolean) => {
                    resolve(success ? data : null);
                  });
                } catch {
                  resolve(null);
                }
              })
            ),
            new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
          ]);

          if (uspData) {
            request.userData.uspapi_detected = true;
            request.userData.uspData = uspData;
            log.info(`USP Data: ${JSON.stringify(uspData)}`);
          } else {
            log.info('USP API detected but did not return data within timeout');
          }
        }
      } catch (err) {
        log.info(`Error checking USP API: ${err}`);
      }

      // TCF fallback: if cmp_id wasn't set by the event listener, try ping
      if (!request.userData.cmp_id) {
        try {
          let tcfFound = false;
          for (let i = 0; i < 5; i++) {
            const exists = await page.evaluate(() => (window as any).__tcfapi !== undefined);
            if (exists) {
              tcfFound = true;
              log.info(`TCF API found on attempt ${i + 1} (fallback ping)`);
              break;
            }
            await page.waitForTimeout(1000);
          }

          if (tcfFound) {
            const tcfData = await page.evaluate(() =>
              new Promise<{ cmpId?: number } | null>((resolve) =>
                (window as any).__tcfapi('ping', 2, (pingReturn: any, success: boolean) => {
                  if (success) {
                    resolve({
                      cmpId: pingReturn.cmpId,
                    });
                  } else {
                    resolve(null);
                  }
                })
              )
            );
            if (tcfData) {
              request.userData.tcfapi_detected = true;
              request.userData.cmp_id = tcfData.cmpId ?? null;
              log.info('TCF fallback ping data:', tcfData);
            }
          }
        } catch (err) {
          log.info(`Error checking TCF API (fallback): ${err}`);
        }
      }
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
      cmp_id: request.userData?.cmp_id ?? null,
      uspapi_detected: !!request.userData.uspapi_detected,
      usp_data: request.userData.uspData ? JSON.stringify(request.userData.uspData) : null,
      gpp_detected: !!request.userData.gpp_detected,
      gpp_data: request.userData.gppData ? JSON.stringify(request.userData.gppData) : null,
      crawl_reason: 'Tranco Top 1M',
      timestamp: dayjs().unix(),
    };

    if (scanData.tcfapi_detected) {
      log.info('TCF API detected', { cmp_id: scanData.cmp_id });
    }
    if (scanData.uspapi_detected) {
      log.info('USP API detected', { usp_data: scanData.usp_data });
    }
    if (scanData.gpp_detected) {
      log.info('GPP API detected', { gpp_data: scanData.gpp_data });
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
      uspapi_detected: false,
      usp_data: null,
      gpp_detected: false,
      gpp_data: null,
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
