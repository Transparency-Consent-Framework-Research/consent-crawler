// Copy contents and save as constants.ts

export const CONSTANTS = {
  // Setting this to true disables loading the large list of urls to crawl
  // and can be set to a single DEV_URL to crawl
  DEV_MODE: true,
  // While DEV_MODE is true, this will be the only URL crawled
  // Change it as you see fit.
  DEV_URL: 'https://google.com',
  // Set to false to show the browser UI
  HEADLESS: true,
  // Set greater than 1 for parallel crawling
  CONCURRENCY: 1,
  // Only set to true during production crawls, not during dev
  SAVE_TO_BIGQUERY: false,
  // Setting to true blocks large media files like video and images.
  ENABLE_MEDIA_BLOCK: false,  
  // Setting to true loads PROXY_URLS and rotates between crawls
  USE_PROXY: false,
  // Replace with actual proxy addresses
  PROXY_URLS: [
    'http://154.11.11.198:6197',
    'http://154.11.11.199:6197'
  ],
  SCRAPE_TARGET_LIST_PATH: './data/scrape-list.csv',// Scan targets get a light crawl  to detect CMP id
  SCAN_TARGET_LIST_PATH: './data/scan-list.csv'
}

export const scanTargetListPath = CONSTANTS.SCAN_TARGET_LIST_PATH
export const proxyUrls = CONSTANTS.PROXY_URLS