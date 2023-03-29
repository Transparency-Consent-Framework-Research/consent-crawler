import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const didomiHandler: BannerHandler = {
  name: 'Didomi',
  url: 'sdk.privacy-center.org',
  variants: [
    {
      name: 'Variant - Accept Only - No Reject Option (Subscription Required)',
      check: async(page: Page) => !!(await page.locator('.jad_cmp_paywall_content').isVisible()),
      accept: async (page: Page) => {
        page
      },
      reject: async (_page: Page) => {
        console.log('Reject Fail. Variant requires subscription');
      }
    },
    {
      name: 'Variant - HeaderType1',
      check: async(page: Page) => !!(await page.locator('#didomi-notice').isVisible()),
      accept: async (page: Page) => {
        await page.locator('#didomi-notice #didomi-notice-agree-button').click();
        page
      },
      reject: async (page: Page) => {
        await page.locator('#didomi-notice #didomi-notice-learn-more-button').click();
        await page.waitForTimeout(1000);
        await page.locator('#didomi-consent-popup div.didomi-consent-popup-actions button:first-child').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant - PopupType1',
      check: async(page: Page) => !!(await page.locator('#didomi-popup').isVisible()),
      accept: async (page: Page) => {
        await page.locator('.didomi-popup-view button#didomi-notice-agree-button').click();
        page
      },
      reject: async (page: Page) => {
        await page.locator('.didomi-popup-view button#didomi-notice-learn-more-button').click();
        await page.waitForTimeout(1000);
        await page.locator('.didomi-consent-popup-footer .didomi-consent-popup-actions button:first-child').click();
        console.log('Rejected Succesfully.');
      }
    },
  ]
}