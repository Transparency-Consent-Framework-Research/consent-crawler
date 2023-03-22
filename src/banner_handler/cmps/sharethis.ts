import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const shareThisHandler:BannerHandler = {
  name: 'ShareThis',
  url: 'sharethis.mgr.consensu.org',
  variants: [
    {
      name: 'Main Variant',
      check: async (page: Page) => {
          page;
          return true;
      },
      accept: async (page: Page) => {
          await page.locator('div.st-cmp-permanent-footer-nav-buttons > div:nth-child(1)').click();
          page;
      },
      reject: async (page: Page) => {
          await page.locator('div.st-cmp-permanent-footer-nav-buttons > div:nth-child(2)').click();
          console.log('Rejected Succesfully.');
      }
    }
  ]
}