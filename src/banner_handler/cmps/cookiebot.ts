import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const cookiebotHandler: BannerHandler = {
  name: 'CookieBot',
  url: 'cookiebot.com',
  variants: [
    {
      name: 'Main Variant',
      check: async (page: Page) => {
        page;
        return true;
      },
      accept: async (page: Page) => {
        await page.locator('button#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('button#CybotCookiebotDialogBodyButtonDecline').click();
        console.log('Rejected Succesfully.');
      }
    }
  ]
}