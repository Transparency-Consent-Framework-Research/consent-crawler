import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const ezoicHandler:BannerHandler = {
  name: 'Ezoic',
  url: 'https://www.ezoic.com/',
  cmpId: 299,
  variants: [
    {
      name: 'Necessary only Variant',
      check: async(page: Page) => !!(await page.locator('button#ez-accept-necessary').count()),
      accept: async (page: Page) => {
        await page.locator('button#ez-accept-all').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('button#ez-accept-necessary').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Settings-Variant',
      check: async(page: Page) => !!(await page.locator('button#ez-manage-settings').count()),
      accept: async (page: Page) => {
        await page.locator('button#ez-accept-all').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('button#ez-manage-settings').click();
        await page.waitForTimeout(1000);
        await page.locator('button#ez-save-settings').click();
        console.log('Rejected Succesfully.');
      }
    }
  ]
}