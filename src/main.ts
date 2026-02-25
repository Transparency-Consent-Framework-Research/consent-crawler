//@ts-nocheck
import crypto from 'crypto';
import dayjs from "dayjs";
import { PlaywrightCrawler, ProxyConfiguration, RequestList } from 'crawlee';
import { Request, Cookie  } from 'playwright';
import { handleBanner } from './banner_handler/index.js';

import { make_formatted_request, FormattedRequest } from './util/requests.js';
import { make_target_list } from './util/target_list.js';
import { save_crawl } from './util/bigquery.js';
import { find_and_decode, make_boolean_rows } from './util/string_decoder.js'

import { type CrawlData } from './types/data.js';
export { CrawlData } from './types/data.js';
import { CONSTANTS } from './constants.js';

let startUrls = [];
let requestList = undefined;

//process.env.NODE_EXTRA_CA_CERTS = path.resolve("C:/Users/riley/BrightData_ssl.crt");
const proxyConfiguration = new ProxyConfiguration({
    proxyUrls: [
      //'http://brd-customer-hl_58d2833c-zone-residential_proxy1:uxm1p12x3xfd@brd.superproxy.io:33335'
        'http://brd-customer-hl_58d2833c-zone-isp_proxy1:sc72esntu52f@brd.superproxy.io:33335'
    ]
});

if(CONSTANTS.DEV_MODE) {
  console.log('✨ Dev mode ON, Crawling', CONSTANTS.DEV_URL);
  console.log(`Use Proxy: ${CONSTANTS.USE_PROXY}, Headless: ${CONSTANTS.HEADLESS}`);
  startUrls.push(CONSTANTS.DEV_URL);
} else {
  // Open a CSV list of domains and turn into an array of target URLs
  startUrls = await make_target_list(CONSTANTS.SCRAPE_TARGET_LIST_PATH);

  console.log('Loading Request List');
  requestList = await RequestList.open('tranco-top-1m-v2', startUrls);
  console.log('Request List Loaded');
}

const crawler = new PlaywrightCrawler({
  // Takes array of http(s) or socks5 proxies, they are used in a round-robin fashion between 
  // target domains in the queue
  //proxyConfiguration: CONSTANTS.USE_PROXY ? new ProxyConfiguration({
  //  proxyUrls: CONSTANTS.PROXY_URLS
  //}) : undefined, 
  proxyConfiguration,
  requestList: requestList,
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
  // Set the number of concurrent crawling instances
  maxConcurrency: CONSTANTS.CONCURRENCY ?? 1,
  // Disable cookie persistance to ensure a clean session for every URL
  persistCookiesPerSession: false,
  // Hooks to run before navigation starts on a give ncrawl
  preNavigationHooks: [
    async ({ blockRequests }) => {
      if(CONSTANTS.ENABLE_MEDIA_BLOCK) {
        await blockRequests();
      }
    },
    // Announce the crawl and set navigation settings
    (crawlingContext, gotoOptions) => {
      crawlingContext.request.userData.session_id = crypto.randomUUID();
      crawlingContext.log.info(`Crawling ${crawlingContext.request.uniqueKey}`);
      if(gotoOptions) {
        gotoOptions.timeout = 60_000;
        gotoOptions.waitUntil = 'networkidle';
      }
    },
    // Mount network request listener and push formatted request 
    async (crawlingContext) => {
      
      crawlingContext.request.userData.requests = [];
      const { page } = crawlingContext;
      page.on('request', async (request: Request) => {
        try {
          // format and push the request into session storage
          const formatted_request =  await make_formatted_request(crawlingContext.request.userData.session_id, request);
          crawlingContext.request.userData.requests.push(formatted_request);
        } catch(e) {
          // crawlingContext.log.error(`Unable to make_formatted_request`);
        }
      });
    },
    async (crawlingContext) => {
      const { page } = crawlingContext;
      crawlingContext.request.userData.tcfapi_detected = false;
      crawlingContext.request.userData.cmp_detected = false;
      crawlingContext.request.userData.cmp_name = undefined;
      crawlingContext.request.userData.cmp_banner_variant = undefined;
      crawlingContext.request.userData.consent_action_success = false;
      crawlingContext.request.userData.consent_action_timestamp = undefined;
      crawlingContext.request.userData.cmp_id = null;
      crawlingContext.request.userData.actionObject = null;
      console.log('TESTING 1')
      await page.exposeBinding('_tcBinding', async ({ frame }, value) => {
        //@ts-ignore
        crawlingContext.log.info(`${page.url()} consent update for ${frame._guid}`);
        
        if(!crawlingContext.request.userData.tcfapi_detected) {
          crawlingContext.request.userData.tcfapi_detected = true;
          console.log('JUST A TEST');
        }

        if(value.success) {
          crawlingContext.log.info(`📣 TCFAPI Event ${value.data.cmpId} ${value.data.eventStatus}`)
          if(!crawlingContext.request?.userData.cmp_id) {
            crawlingContext.request.userData.cmp_id = value.data.cmpId;
          }

          if(value.data?.eventStatus === 'useractioncomplete' && !crawlingContext.request.userData.consent_action_success) {
            crawlingContext.log.info('✅ Action success');
            crawlingContext.request.userData.consent_action_success = true;
            crawlingContext.request.userData.consent_action_timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss'),
            crawlingContext.request.userData.actionObject = JSON.stringify(value.data);
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
  requestHandler: async({page, request, log, proxyInfo}) => {
    // Act on the consent banner if one has been detected
    // @TODO: Should be moved to a postnav hook
    let consent_action_success = false;
    let variant_name;
    log.info(`testing: ${request.userData.cmp_id}`)
    if(request.userData.cmp_id) {
      try {
        const actionSuccess = await handleBanner(request.userData.cmp_id, page, 'reject', log);
        console.log(actionSuccess);
        await page.waitForTimeout(3000);
        consent_action_success = actionSuccess.success;
        variant_name = actionSuccess?.variant_name;
      } catch(e) {
        log.error('Consent banner click failed');
        if(e instanceof Error) {
          log.error(e.message);
        }
      }
    }

    // We get the cookies AFTER we reject consent
    const cookies = await page.context().cookies();

    log.info(`✅ Loaded: ${request.url}`);

    const parsed_strings = find_and_decode(request.userData.session_id, request.userData.requests, cookies);
    const parsed_strings_boolean = make_boolean_rows(parsed_strings, request.userData.session_id, request.url);

    // console.log(request.userData);
    // This is the data to save for analysis
    const data: CrawlData = {
      session_id: request.userData.session_id,
      target_url: request.url,
      tcfapi_detected: request.userData.tcfapi_detected,
      cmp_banner_variant: variant_name,
      cmp_id: request.userData.cmp_id,
      cmp_detected: request.userData.cmp_detected,
      cmp_name: request.userData.cmp_name,
      consent_action: 'REJECT',
      consent_action_success: request.userData.consent_action_success,
      consent_action_timestamp: request.userData.consent_action_timestamp,
      action_object: request.userData.actionObject,
      crawl_geo: 'EU',
      crawl_ip: proxyInfo?.hostname ?? 'n/a',
      requests: request.userData.requests,
      cookies: cookies,
      parsed_strings: parsed_strings,
      parsed_strings_boolean: parsed_strings_boolean,
    };

    log.info(`Action ${(request.userData.consent_action_success ? 'Success' : 'Failure')} | ${data.requests.length} requests, ${cookies.length} cookies, ${data.parsed_strings.length} TC strings`);

    // This is a rough check in place of real validation in case a proxy sputters out and fails
    // or the crawl fails due to any kind of bot deterrent.
    if(request.userData.requests.length > 3 && CONSTANTS.SAVE_TO_BIGQUERY) {
      log.info('⌛ Inserting data into BigQuery');
      await save_crawl(data);
      log.info('💾 Insert Complete');
    } else {
      log.warning('🟡 Skipping file save');
    }
  },

  async failedRequestHandler({ request, log }) {
    log.error(`${request.url} 'failed`);
  }
});

// Start the crawl
console.log(`Crawling ${startUrls.length} URLs`);
if(startUrls.length > 0) {
  await crawler.run(startUrls);
} else {
  console.log('Nothing to Crawl, Exiting.');
}

// Exit out once crawl the crawl is done
process.exit();
