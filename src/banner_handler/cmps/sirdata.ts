import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const sirdataHandler:BannerHandler = {
  name: 'Sirdata',
  url: 'https://www.sirdata.com/en/',
  cmpId: 92,
  variants: [
    {
      name: 'Main Variant',
      check: async(page: Page) => !!(await page.locator('div.sd-cmp-3H8D2 button.sd-cmp-1bquj').count()),
      accept: async (page: Page) => {
          await page.locator('div.sd-cmp-2yAVI >button').nth(1).click();
          page;
      },
      reject: async (page: Page) => {
          await page.locator('div.sd-cmp-3H8D2 button.sd-cmp-1bquj >span').first().click();
          console.log('Rejected Succesfully.');
      }
    },
    {
        name: '3 in line options Variant',
        check: async(page: Page) => {const buttonCount = await page.locator('div.sd-cmp-2yAVI button.sd-cmp-1bquj').count();
            return buttonCount === 3;},
        accept: async (page: Page) => {
            await page.locator('div.sd-cmp-2yAVI >button').nth(2).click();
            page;
        },
        reject: async (page: Page) => {
            await page.locator('div.sd-cmp-2yAVI >button').first().click();
            console.log('Rejected Succesfully.');
        }
      },
  ]
}