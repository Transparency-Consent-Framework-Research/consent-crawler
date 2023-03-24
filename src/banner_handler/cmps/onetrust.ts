import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const oneTrustHandler: BannerHandler = {
  name: 'One Trust',
  url: 'cdn.cookielaw.org/scripttemplates/otSDKStub.js',
  variants: [
    {
      name: 'Alternative Variant',
      check: (page: Page) => {
        return page.locator("#onetrust-consent-sdk #onetrust-accept-btn-handler").isVisible();
      },
      accept: (page) => page.locator("#onetrust-accept-btn-handler").click(),
      reject: async (page) => {
        await page.locator('button#onetrust-pc-btn-handler').click();
        await page.waitForTimeout(1000);
        await page.locator('button.save-preference-btn-handler').click();
      }

    },
    {
      name: 'Three Options - Reject All',
      check: async (page: Page) => {
        const buttonCount = await page.locator("#onetrust-banner-sdk #onetrust-button-group button").count();
        console.log('buttonCount', buttonCount);
        return buttonCount === 3;
      },
      accept: async (page) => page.locator("#onetrust-banner-sdk #onetrust-accept-btn-handler").click(),
      reject: async (page) => page.locator("#onetrust-banner-sdk #onetrust-button-group #onetrust-reject-all-handler").click()
    },
    {
      name: 'Main Variant - Both Options',
      check: (page: Page) => page.locator("#onetrust-banner-sdk #onetrust-button-group #onetrust-pc-btn-handler").isVisible(),
      accept: async (page: Page) => {
        await page.locator('button#onetrust-accept-btn-handler').click();
      },
      reject: async (page: Page) => {
        await page.locator('button#onetrust-pc-btn-handler').click();
        await page.waitForTimeout(1000);
        await page.locator('button.save-preference-btn-handler').click();
      }
    },
    {
      name: 'Accept Only - No Reject Option',
      check: (page: Page) => page.locator("#onetrust-banner-sdk div.accept-btn-only").isVisible(),
      accept: async (page) => page.locator("#onetrust-banner-sdk #onetrust-accept-btn-handler").click(),
      reject: async (_page) => console.log('Reject Fail. Variant does not have reject option.'),
    }
  ]
}