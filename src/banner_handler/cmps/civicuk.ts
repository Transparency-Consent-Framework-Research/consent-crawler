import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const civicHandler: BannerHandler = {
  name: 'Civic',
  url: 'civicuk.com/cookie-control/',
  variants: [
    {
      name: 'Main Variant',
      check: async (page: Page) => {
        page;
        return true;
      },
      accept: async (page: Page) => {
        await page.locator('button#ccc-notify-accept').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('button#ccc-notify-reject').click(); 
        console.log('Rejected Succesfully.');
      }
    }
  ]

}