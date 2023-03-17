import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const civicHandler: BannerHandler = {
  name: 'Civic',
  url: 'sdk.privacy-center.org',
  variants: [
    {
      name: 'Main Variant',
      check: async (page: Page) => {
        page;
        return true;
      },
      accept: async (page: Page) => {
        page;
      },
      reject: async (page: Page) => {
        await page.locator('button#ccc-notify-reject').click(); 
      }
    }
  ]

}