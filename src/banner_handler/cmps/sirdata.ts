import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const sirdataHandler:BannerHandler = {
  name: 'Sirdata',
  url: 'https://www.sirdata.com/en/',
  cmpId: 92,
  variants: [
    {
      name: 'Main Variant',
      check: async(page: Page) => !!(await page.locator('span', { hasText: /Do not accept|Continuer sans accepter/i }).count()),
      accept: async (page: Page) => {
          await page.locator('span', { hasText: /Accept all|Tout accepter/i }).click();
      },
      reject: async (page: Page) => {
          await page.locator('span', { hasText: /Do not accept|Continuer sans accepter/i }).first().click();
          console.log('Rejected Succesfully.');
      }
    },
  ]
}