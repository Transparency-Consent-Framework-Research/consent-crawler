import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const MediaVine:BannerHandler = {
  name: 'MediaVine',
  url: 'https://www.mediavine.com/',
  cmpId: 46,
  variants: [
    {
      name: 'Main Variant',
      check: async(page: Page) => !!(await page.locator('div.sc-jCbFiK.bWhiHd').count()),
      accept: async (page: Page) => {
          await page.locator('div.sc-jCbFiK.bWhiHd div.sc-dkjaqt.bzblAN >div').nth(1).click();
          page;
      },
      reject: async (page: Page) => {
        await page.locator('div.sc-jCbFiK.bWhiHd div.sc-dkjaqt.bzblAN >div').nth(0).click();
          await page.waitForTimeout(1000);
          await page.locator('div.sc-tOkKi.ghNZzX >div').nth(1).click();
          console.log('Rejected Succesfully.');
      }
    }
  ]
}