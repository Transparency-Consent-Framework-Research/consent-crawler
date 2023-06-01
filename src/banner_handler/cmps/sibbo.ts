import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const sibboHandler:BannerHandler = {
  name: 'Sibbo',
  url: 'tv.sibbo.net',
  variants: [
    {
      name: 'Main Variant',
      check: async (page: Page) => {
          page;
          return true;
      },
      accept: async (page: Page) => {
          await page.locator('a#acceptAllMain').click(); 
          page;
      },
      reject: async (page: Page) => {
          await page.locator('a#configCmpButtonMain').click();
          await page.waitForTimeout(1000);
          await page.locator('a#rejectAllConsent').click();
          console.log('Rejected Succesfully.');
      }
    }
  ]
}