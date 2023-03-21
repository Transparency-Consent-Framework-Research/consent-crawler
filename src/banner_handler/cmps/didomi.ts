import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const didomiHandler: BannerHandler = {
  name: 'Didomi',
  url: 'sdk.privacy-center.org',
  variants: [
    {
      name: 'Main',
      check: async (page: Page) => {
        page;
        return true;
      },
      accept: async (page: Page) => {
        await page.locator('#didomi-notice #didomi-notice-agree-button').click();
        page
      },
      reject: async (page: Page) => {
        await page.locator('#didomi-notice #didomi-notice-learn-more-button').click();
        await page.waitForTimeout(1000);
        await page.locator('#didomi-consent-popup div.didomi-consent-popup-actions button:first-child').click();
        console.log('Rejected Succesfully.');
      }
    }
  ]
}