import { PlaywrightCrawler, ProxyConfiguration, Configuration, KeyValueStore } from 'crawlee';
import { Request, Cookie  } from 'playwright';
import { make_formatted_request, FormattedRequest } from './util/requests.js';
import { make_target_list } from './util/target_list.js';
import { banners } from './util/cmp_banners.js';
import { detector, bannerHandler } from './banner_handler/index.js';

/**
 * @TODO - Refactor CMP banners to use check/variants system (See example)
 * @TODO - Add wrapper code to run and log the CMP process
 * @TODO - Investigate using playwright routes instead of the loop/regex system
 * @TODO - Refactor main to make crawler exportable from an index.ts file 
 * @TODO - Make new main.ts file call this exportable crawler and pass any target list needed
 * @TODO - Write automated tests for each CMP banner
 * @TODO - Make docker image build succesfully and run tests.
 */

type CrawlData = {
  target_url: string;
  cmp_detected: boolean;
  cmp_name?: string;
  cmp_banner_variant?: string;
  consent_action: "ACCEPT" | "REJECT" | "NONE";
  consent_action_success?: boolean;
  crawl_geo: string,
  crawl_ip: string,
  requests: FormattedRequest[],
  cookies: Cookie[]
}

// Open a CSV list of domains and turn into an array of target URLs
const startUrls = await make_target_list('./data/top100k.csv');

// Open a storage handler to store crawl results
// See: https://crawlee.dev/docs/guides/result-storage#key-value-store
const store = await KeyValueStore.open('0316');

const crawler = new PlaywrightCrawler({
  // Takes array of http(s) or socks5 proxies, they are used in a round-robin fashion between 
  // target domains in the queue
  proxyConfiguration: new ProxyConfiguration({
    proxyUrls: [
      'http://104.233.18.2:5335', // GERMANY
      'http://154.21.10.199:5220', // SPAIN
      'http://154.92.115.198:6197', // NED
      'http://154.21.8.89:6297', // SPAIN
      'http://45.43.181.94:5440', // SPAIN
      'http://188.74.211.135:6470', // ITALY
      'http://185.168.158.211:5723', // FRANCE
      'http://154.21.96.233:5859', // UK
      'http://104.233.18.250:5583', // GERMANY
      'http://154.55.88.63:5663', // FRANCE
      'http://45.192.132.78:5723', // POLAND
      'http://154.13.11.233:6081', // UK
      'http://154.12.12.80:5128', // UK
      ],
  }),
  launchContext: {
    // Here you can set options that are passed to the playwright .launch() function.
    launchOptions: {
      headless: true,
    },
    // This along with persistCookiesPerSession attempt to ensure a clean session for every domain
    useIncognitoPages: true,
  },
  // Set the number of concurrent crawling instances
  maxConcurrency: 1,
  // Disable cookie persistance to ensure a clean session for every URL
  persistCookiesPerSession: false,
  // Hooks to run before navigation starts on a give ncrawl
  preNavigationHooks: [
    // Announce the crawl and set navigation settings
    (crawlingContext, gotoOptions) => {
      crawlingContext.log.info(`Crawl ${crawlingContext.id} - ${crawlingContext.request.uniqueKey}`);
      if(gotoOptions) {
        gotoOptions.timeout = 30_000;
        gotoOptions.waitUntil = 'networkidle';
      }
    },
    // Optional request blocking when needing to save proxy bandwidth (unconfirmed if it affects quality)
    // async ({ blockRequests }) => {
    //   await blockRequests({
    //     extraUrlPatterns: ['.mp4', '.mov', '.flv', '.webm', '.mkv'],
    //   });
    // },
    // Mount network request listener and push formatted request 
    async (crawlingContext) => {
      crawlingContext.request.userData.requests = [];

      const { page } = crawlingContext;
      page.on('request', async (request: Request) => {
        try {
          // format and push the request into session storage
          const formatted_request =  await make_formatted_request(request);
          crawlingContext.request.userData.requests.push(formatted_request);
        } catch(e) {
          crawlingContext.log.error(`Unable to make_formatted_request`);
        }
      });
    },
    // Detect consent banners
    async (crawlingContext) => {

      crawlingContext.request.userData.cmp_detected = false;
      crawlingContext.request.userData.cmp_name = undefined;
      crawlingContext.request.userData.cmp_banner_variant = undefined;
      crawlingContext.request.userData.consent_action_success = undefined;

      const { page } = crawlingContext;
      const bannerHandler = detector(crawlingContext.log);

      page.on('request', async (request: Request) => {
        // Stop checking every request once consent is detected once
        if(crawlingContext.request.userData.cmp_detected) {
          return;
        }

        const url = request.url();
        const detectResult = bannerHandler.detectCmp(url);
        if(detectResult.match) {
          crawlingContext.log.info(`🎇 CMP Detected! ${detectResult.handler?.name}`);
          crawlingContext.request.userData.cmp_detected = true
          crawlingContext.request.userData.cmp_name = detectResult.handler?.name;
          crawlingContext.request.userData.banner_handler = detectResult.handler;
        }
      });
    }
  ],
  // Executes after postnav hooks
  requestHandler: async({page, request, log, proxyInfo}) => {
    // Set a safe filename to identify the crawl
    const url = new URL(request.url);
    // This removes any unsafe characters in favor of underscores
    const url_safe = url.hostname.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    // We create a filename from the url and the random request ID assigned to this domain
    const filename = `${url_safe}--${request.id}`;

    // Act on the consent banner if one has been detected
    // @TODO: Should be moved to a postnav hook
    let consent_action_success = false;
    let variant_name;
    if(request.userData.cmp_detected) {
      try {
        const actionSuccess = await bannerHandler(page, request.userData.banner_handler, 'reject');
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
    log.info(`${request.userData.requests.length} requests, ${cookies.length} cookies`);

    // This is the data to save for analysis
    const data: CrawlData = {
      target_url: request.url,
      cmp_banner_variant: variant_name,
      cmp_detected: request.userData.cmp_detected,
      cmp_name: request.userData.cmp_name,
      consent_action: 'REJECT',
      consent_action_success: consent_action_success,
      crawl_geo: 'EU',
      crawl_ip: proxyInfo?.hostname ?? 'n/a',
      requests: request.userData.requests,
      cookies: cookies,
    };

    // This is a rough check in place of real validation in case a proxy sputters out and fails
    // or the crawl fails due to any kind of bot deterrent.
    if(request.userData.requests.length > 3) {
      log.info('Wrote Result');
      await store.setValue(filename, data);
    } else {
      log.warning('Skipping file save');
    }
  },

  async failedRequestHandler({ request, log }) {
    log.error(`${request.url} 'failed`);
  }
});

// Start the crawl
//await crawler.run(['https://www.bleepingcomputer.com']);
await crawler.run([
  'https://www.bleepingcomputer.com',
  'https://www.civicuk.com/cookie-control/',
  'https://businessinsider.com.pl/',
  'https://www.cookiebot.com/',
  'https://us.as.com/',
  'http://eurogamer.net',
  'http://msdmanuals.com',
  'https://www.forbes.com/',
  'https://fortune.com/',
  'https://www.pentasoft.it/',
  'https://www.fightfear.us/',
  'http://hustleforhumanity.org/',
  'https://ekilu.com/es',
  'https://ogury.com/',
  'https://tasty-cat.net/',
  'https://www.klatsch-tratsch.de/',
  'https://www.wisst-ihr-noch.de/',
  'https://www.asiakastieto.fi/web/fi/',
  'https://videnskab.dk/',
  'https://borsenfordelsklub.dk/',
  'https://www.finect.com/',
  'https://www.lasexta.com/'
])
// Exit out once crawl the crawl is done
process.exit();