import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const triTableHandler:BannerHandler = {
  name: 'Tri-table Sp. z o.o.',
  url: 'https://tri-table.com/',
  cmpId: 61,
  variants: [
    {
      name: 'Main Variant',
      check: async(page: Page) => !!(await page.locator('div.jA5ME2tC').count()),
      accept: async (page: Page) => {
          await page.locator('button.qxOn2zvg.e1sXLPUy').click();
          page;
      },
      reject: async (page: Page) => {
          await page.locator('button.qxOn2zvg.N2IntVHt').click();
          await page.waitForTimeout(1000);
          await page.locator('button.qxOn2zvg.rGGY7F98').click();
          console.log('Rejected Succesfully.');
      }
    }
  ]
}