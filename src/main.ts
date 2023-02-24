import { PlaywrightCrawler, ProxyConfiguration, Configuration, KeyValueStore } from 'crawlee';
import { Request, Cookie  } from 'playwright';
import { make_formatted_request, FormattedRequest } from './util/requests.js';
import { make_target_list } from './util/target_list.js';
import { banners } from './util/cmp_banners.js';

type CrawlData = {
  target_url: string;
  consent_banner: boolean;
  consent_action: "ACCEPT" | "REJECT" | "NONE";
  consent_action_success: boolean;
  crawl_geo: string,
  crawl_ip: string,
  requests: FormattedRequest[],
  cookies: Cookie[]
}

// Open a CSV list of domains and turn into an array of target URLs
const startUrls = await make_target_list('./data/top100k.csv');

// Open a storage handler to store crawl results
// See: https://crawlee.dev/docs/guides/result-storage#key-value-store
const store = await KeyValueStore.open();

const crawler = new PlaywrightCrawler({
  // Takes array of http(s) or socks5 proxies, they are used in a round-robin fashion between 
  // target domains in the queue
  // proxyConfiguration: new ProxyConfiguration({
  //   proxyUrls: [
  //     'http://1.2..4:1234', // http(s) or socks5 proxy URL
  //     ],
  // }),
  launchContext: {
    // Here you can set options that are passed to the playwright .launch() function.
    launchOptions: {
      headless: false,
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
    async ({ blockRequests }) => {
      await blockRequests({
        extraUrlPatterns: ['.mp4', '.mov', '.flv', '.webm', '.mkv'],
      });
    },
    // Mount network request listener and push formatted request 
    async (crawlingContext) => {
      crawlingContext.request.userData.requests = [];

      const { page } = crawlingContext;
      page.on('request', async (request: Request) => {
        // Log only any navigation request to reduce log noise (this is totally optional)
        if(request.isNavigationRequest()) {
          crawlingContext.log.info(`>> ${request.method()} - ${request.url().substring(0, 40)}`);
        }

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
      crawlingContext.request.userData.detected_consent = false;
      const { page } = crawlingContext;
      page.on('request', async (request: Request) => {
        // Stop checking every request once consent is detected once
        if(crawlingContext.request.userData.detected_consent) {
          return;
        }

        // Iterate over incoming requests to any CMP's SDK by matching against the request URL
        for (let index = 0; index < banners.length; index++) {
          const banner = banners[index];
          crawlingContext.log.debug(`Checking URL for presence of ${banner.name}`);
          const url = request.url();
          // If a network request matches the CMP url fragment, update the session state
          // to indicate detection
          if(url.indexOf(banner.url) > 0) {
            crawlingContext.log.info(`🎇 CMP Detected! ${banner.name}`);
            crawlingContext.request.userData.detected_consent = true;
            crawlingContext.request.userData.detected_consent_name = banner.name;
            // This is suboptimal, passing the entire handler to execute when navigation is complete
            // @TODO - Refactor to support evaluating multiple handlers in case of many variants for 
            // one CMP.
            crawlingContext.request.userData.consent_handler = banner;
          }
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
    if(request.userData.detected_consent) {
      try {
        await request.userData.consent_handler.playbooks.reject(page, log);
        await page.waitForTimeout(5000);
        consent_action_success = true;
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
      consent_banner: request.userData.detected_consent,
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
await crawler.run(startUrls);

// Exit out once crawl the crawl is done
process.exit();