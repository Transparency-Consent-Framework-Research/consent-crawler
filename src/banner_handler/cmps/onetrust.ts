import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const oneTrustHandler: BannerHandler = {
  name: 'One Trust',
  url: 'cdn.cookielaw.org/scripttemplates/otSDKStub.js',
  variants: [
    {
      name: 'Main Variant',
      check: async (page: Page) => {
        page;
        return true;
      },
      accept: async (page: Page) => {
        await page.locator('button#onetrust-accept-btn-handler').click();
      },
      reject: async (page: Page) => {
        await page.locator('button#onetrust-pc-btn-handler').click();
        await page.waitForTimeout(1000);
        await page.locator('button.save-preference-btn-handler').click();
      }
    }
  ]
}