//@ts-nocheck
import crypto from 'crypto';
import dayjs from "dayjs";
import { PlaywrightCrawler, ProxyConfiguration, RequestList } from 'crawlee';
import { Request, Cookie  } from 'playwright';
import { handleBanner } from './banner_handler/index.js';

import { make_formatted_request, FormattedRequest } from './util/requests.js';
import { make_target_list } from './util/target_list.js';
import { save_to_bigquery } from './util/bigquery.js';
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
  maxRequestRetries: 3,
  retryOnBlocked: false,
  proxyConfiguration,
  requestList: requestList,
  launchContext: {
    // Here you can set options that are passed to the playwright .launch() function.
    launchOptions: {
      headless: CONSTANTS.HEADLESS,
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
              if (CONSTANTS.ENABLE_MEDIA_BLOCK) {
                  await blockRequests();
              }
          },
          // Announce the crawl and set navigation settings
          (crawlingContext, gotoOptions) => {
              crawlingContext.request.userData.session_id = crypto.randomUUID();
              crawlingContext.log.info(`Crawling ${crawlingContext.request.uniqueKey}`);
              if (gotoOptions) {
                  gotoOptions.timeout = 60_000;
                  gotoOptions.waitUntil = 'networkidle';
              }
          },
          // Mount network request listener and push formatted request 
          async (crawlingContext) => {
              crawlingContext.request.userData.requests = [];
              const { page } = crawlingContext;
              page.on('request', async (request) => {
                  try {
                      // format and push the request into session storage
                      const formatted_request = await make_formatted_request(crawlingContext.request.userData.session_id, request);
                      crawlingContext.request.userData.requests.push(formatted_request);
                  }
                  catch (e) {
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
              crawlingContext.request.userData.uspapi_detected = false;
              crawlingContext.request.userData.gpp_detected = false;
              crawlingContext.request.userData.uspData = null;
              crawlingContext.request.userData.gppData = null;
              console.log('TESTING 1');
              await page.exposeBinding('_tcBinding', async ({ frame }, value) => {
                  //@ts-ignore
                  crawlingContext.log.info(`${page.url()} consent update for ${frame._guid}`);
                  if (!crawlingContext.request.userData.tcfapi_detected) {
                      crawlingContext.request.userData.tcfapi_detected = true;
                      console.log('JUST A TEST');
                  }
                  if (value.success) {
                      crawlingContext.log.info(`📣 TCFAPI Event ${value.data.cmpId} ${value.data.eventStatus}`);
                      if (!crawlingContext.request?.userData.cmp_id) {
                          crawlingContext.request.userData.cmp_id = value.data.cmpId;
                      }
                      if (value.data?.eventStatus === 'useractioncomplete' && !crawlingContext.request.userData.consent_action_success) {
                          crawlingContext.log.info('✅ Action success');
                          crawlingContext.request.userData.consent_action_success = true;
                          crawlingContext.request.userData.consent_action_timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss'),
                              crawlingContext.request.userData.actionObject = JSON.stringify(value.data);
                      }
                  }
              });
              //await page.exposeBinding('_consentBinding', async ({ frame }, value) => { 
              // if (value.type === 'USPAPI') { crawlingContext.log.info('✅ USPAPI exists'); 
              //   crawlingContext.request.userData.uspapi_detected = true; 
              //   crawlingContext.request.userData.uspData = value.data; 
              //   crawlingContext.log.info('USP data', value.data); } 
              // if (value.type === 'GPP') { crawlingContext.log.info('✅ GPP API exists'); 
              //   crawlingContext.request.userData.gpp_detected = true; 
              //   crawlingContext.request.userData.gppData = value.data; 
              //   crawlingContext.log.info('GPP data', value.data); } });
              await page.addInitScript(async () => {
                  const apiInterval = setInterval(() => {
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
                      }
                      else {
                          //@ts-ignore
                          console.log('not defined', window.__tcfapi);
                      }
                  }, 1000);
              });
              //  await page.addInitScript(() => { 
              //   const maxAttempts = 8; 
              //    let attempt = 0; 
              //   const interval = setInterval(() => { 
              //     attempt++; 
              //     if (window.__uspapi !== undefined && !window._uspflag) { 
              //       window.__uspapi('getUSPData', 1, (uspData, success) => { 
              //       window._consentBinding({ type: 'USPAPI', data: success ? uspData : null }); }); 
              //       window._uspflag = true; } 
              //     if (window.__gpp !== undefined && !window._gppflag) { 
              //       window.__gpp('ping', (gppData, success) => { 
              //         window._consentBinding({ type: 'GPP', data: success ? gppData : null }); }); 
              //         window._gppflag = true; } 
              //     if (window._uspflag && window._gppflag) clearInterval(interval); 
              //      if (attempt >= maxAttempts) { clearInterval(interval); } 
              //    }, 1000); });
          }
      ],
      postNavigationHooks: [
          async (crawlingContext) => {
              const { page, log, request } = crawlingContext;
              log.info('Starting PostNav');
              // Check for GPP API
              try {
                log.info('Checking for GPP API');
                let gppFound = false;

                for (let i = 0; i < 5; i++) {
                    const exists = await page.evaluate(() => window.__gpp !== undefined);
                    if (exists) {
                        gppFound = true;
                        log.info(`✅ GPP API found on attempt ${i + 1}`);
                        break;
                    }
                    await page.waitForTimeout(1000); // wait 1 second before next check
                }

                if (!gppFound) {
                    log.info('❌ GPP API did not appear after 5 checks (≈4 seconds total)');
                } else {
                    const gppData = await page.evaluate(() =>
                        new Promise((resolve) =>
                            window.__gpp('ping', (data, success) =>
                                resolve(success ? data : null)
                            )
                        )
                    );
                    request.userData.gpp_detected = true;
                    request.userData.gppData = gppData;
                    log.info('GPP Data:', gppData);
                }
            } catch (err) {
                log.info('❌ Error while checking GPP API:', err);
            }
            // Check for USP API
              try {
                log.info('Checking for USP API');
                let uspFound = false;

                for (let i = 0; i < 5; i++) {
                    const exists = await page.evaluate(() => window.__uspapi !== undefined);
                    if (exists) {
                        uspFound = true;
                        log.info(`✅ USP API found on attempt ${i + 1}`);
                        break;
                    }
                    await page.waitForTimeout(1000); // wait 1 second before next check
                }

                if (!uspFound) {
                    log.info('❌ USP API did not appear after 5 checks (≈4 seconds total)');
                } else {
                    const uspData = await Promise.race([
                    page.evaluate(() =>
                        new Promise((resolve) => {
                            try {
                                window.__uspapi('getUSPData', 1, (data, success) => {
                                    resolve(success ? data : null);
                                });
                            } catch (e) {
                                resolve(null);
                            }
                        })
                    ),
                    new Promise((resolve) => setTimeout(() => resolve(null), 3000)) // Timeout fallback
                ]);

                if (uspData) {
                    request.userData.uspapi_detected = true;
                    request.userData.uspData = uspData;
                    log.info('✅ USP Data:', uspData);
                } else {
                    log.info('⚠️ USP API detected but did not return data within timeout');
                }
                }
            } catch (err) {
                log.info('❌ Error while checking USP API:', err);
            }
              // Check for USP API
              //try {
               //   log.info('checking if USPAPI exists');
               //   await page.waitForFunction(() => window.__uspapi !== undefined, { timeout: 4_000 });
               //   log.info('✅ USPAPI exists');
                //  const uspData = await page.evaluate(() => new Promise((resolve) => window.__uspapi('getUSPData', 1, (data, success) => resolve(success ? data : null))));
               //   request.userData.uspapi_detected = true;
               //   request.userData.uspData = uspData;
               //   log.info('USP Data:', uspData);
             // }
             // catch {
             //     log.info('❌ USPAPI did not appear within 15 seconds');
             // }
              if (!request.userData.cmp_id) { 
                try {
                log.info('Checking for TCF API');
                let tcfFound = false;

                for (let i = 0; i < 5; i++) {
                    const exists = await page.evaluate(() => window.__tcfapi !== undefined);
                    if (exists) {
                        tcfFound = true;
                        log.info(`✅ TCF API found on attempt ${i + 1}`);
                        break;
                    }
                    await page.waitForTimeout(1000); // wait 1 second before next check
                }

                if (!tcfFound) {
                    log.info('❌ TCF API did not appear after 5 checks (≈4 seconds total)');
                } else {
                    const tcfData = await page.evaluate(() =>
                            new Promise((resolve) => window.__tcfapi('ping', 2, (pingReturn,success) =>{
                      if (success) {
                          resolve({
                              cmpId: pingReturn.cmpId,
                              cmpStatus: pingReturn.cmpStatus,
                              gdprApplies: pingReturn.gdprApplies,
                          });
                      } else {
                          resolve(null);
                      }
  
                  })));
                    request.userData.tcfapi_detected = true;
                    //request.userData.tcfData = tcfData;
                    request.userData.cmp_id = tcfData.cmpId;
                    log.info('TCF Data:', tcfData);
                }
            } catch (err) {
                log.info('❌ Error while checking TCF API:', err);
            }} else {
                log.info('Skipping TCFAPI check — cmp_id already set');
            }
          }],
               //   crawlingContext.request.userData.tcfapi_detected = true;
                  //request.userData.uspapi_detected = true;
                  //request.userData.tcfData = tcfData;
               //   log.info('TCF Data:', tcfData);
             // }
            //  catch {
             //     log.info('❌ TCFAPI did not appear within 15 seconds');
             // }
          //}
     // ],
      // Executes after postnav hooks
      requestHandler: async ({ page, request, log, proxyInfo }) => {
          // Act on the consent banner if one has been detected
          // @TODO: Should be moved to a postnav hook
          let consent_action_success = false;
          let variant_name;
          log.info(`testing: ${request.userData.cmp_id}`);
          if (request.userData.cmp_id) {
              try {
                  const actionSuccess = await handleBanner(request.userData.cmp_id, page, 'reject', log);
                  console.log(actionSuccess);
                  await page.waitForTimeout(3000);
                  consent_action_success = actionSuccess.success;
                  variant_name = actionSuccess?.variant_name;
              }
              catch (e) {
                  log.error('Consent banner click failed');
                  if (e instanceof Error) {
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
          const data = {
              session_id: request.userData.session_id,
              target_url: request.url,
              tcfapi_detected: request.userData.tcfapi_detected,
              cmp_banner_variant: variant_name,
              cmp_id: request.userData.cmp_id,
              cmp_detected: request.userData.cmp_detected,
              cmp_name: request.userData.cmp_name,
              consent_action: 'REJECT',
              consent_action_success: consent_action_success,
              //captures whether event listener was working properly. If consent_Action_success=True and consent_action_success_event_listener=False, 
              // then the action was forced by postnavhook 
              consent_action_success_event_listener: request.userData.consent_action_success,
              consent_action_timestamp: request.userData.consent_action_timestamp,
              action_object: request.userData.actionObject,
              crawl_geo: 'EU',
              crawl_ip: proxyInfo?.hostname ?? 'n/a',
              requests: request.userData.requests,
              cookies: cookies,
              parsed_strings: parsed_strings,
              parsed_strings_boolean: parsed_strings_boolean,
          };
          const data2 = {
              target_url: request.url,
              tcfapi_detected: request.userData.tcfapi_detected,
              cmp_id: request.userData.cmp_id,
              cmp_banner_variant: variant_name,
              consent_action_success: consent_action_success,
              //captures whether event listener was working properly. If consent_Action_success=True and consent_action_success_event_listener=False, 
              // then the action was forced by postnavhook 
              consent_action_success_event_listener: request.userData.consent_action_success,
              uspdata: request.userData.uspData,
              gppdata: request.userData.gppData,
              uspapi_exists: request.userData.uspapi_detected,
              gpp_exists: request.userData.gpp_detected,
          };
          log.info(`Action ${(consent_action_success ? 'Success' : 'Failure')} | ${data.requests.length} requests, ${cookies.length} cookies, ${data.parsed_strings.length} TC strings`);
          
          // This is a rough check in place of real validation in case a proxy sputters out and fails
          // or the crawl fails due to any kind of bot deterrent.
          if (request.userData.requests.length > 3 && CONSTANTS.SAVE_TO_BIGQUERY) {
              log.info('⌛ Inserting data into BigQuery');
              await save_to_bigquery('v2p2', 'feb_scan_26', data2);
              log.info('💾 Insert Complete');
          }
          else {
              log.warning('🟡 Skipping file save');
          }
      },
      async failedRequestHandler({ request, log }) {
          log.error(`${request.url} 'failed`);
      }
  });
  // Start the crawl
  console.log(`Crawling ${startUrls.length} URLs`);
  if (startUrls.length > 0) {
      await crawler.run(startUrls);
  }
  else {
      console.log('Nothing to Crawl, Exiting.');
  }
  // Exit out once crawl the crawl is done
  process.exit();
  //# sourceMappingURL=main_copy.js.map