import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const transfonHandler:BannerHandler = {
  name: 'Transfon',
  url: 'cmp.uniconsent.com',
  variants: [
    {
      name: 'Main Variant',
      check: async (page: Page) => {
          page;
          return true;
      },
      accept: async (page: Page) => {
          await page.locator('button#unic-agree').click();
          page;
      },
      reject: async (page: Page) => {
          await page.locator('div.unic div.unic-bar div.inner button.is-primary').click();
          await page.waitForTimeout(1000);
          await page.locator('div.unic-box div.modal-card section.modal-card-body button:not(.is-primary)').click();
          console.log('Rejected Succesfully.');
      }
    }
  ]
}