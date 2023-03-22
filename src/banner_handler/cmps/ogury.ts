import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const oguryHandler:BannerHandler = {
  name: 'Ogury',
  url: 'consent-manager-events.ogury.io',
  variants: [
    {
      name: 'Main Variant',
      check: async (page: Page) => {
          page;
          return true;
      },
      accept: async (page: Page) => {
          const iframeP = page.frameLocator('.ogury-consent-manager__form__iframe');
          await iframeP.locator('div#root div.container div.flex > div:nth-child(3) button').click();
          page;
      },
      reject: async (page: Page) => {
          const iframeP = page.frameLocator('.ogury-consent-manager__form__iframe');
          await iframeP.locator('div#root div.container div.flex > div:nth-child(2) button').click();
          await page.waitForTimeout(1000);
          await iframeP.locator('div#root div.container div.flex > div:nth-child(2) button').click();
          console.log('Rejected Succesfully.');
      }
    }
  ]
}