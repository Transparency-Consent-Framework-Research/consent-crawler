import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const didomiHandler: BannerHandler = {
  name: 'Didomi',
  url: 'sdk.privacy-center.org',
  cmpId: 7,
  variants: [
    {
      name: 'Paywall',
      check: async (page: Page) => {
        const paywall1 = await page.locator('button[action-name="consentlessSubAccess"]').isVisible().catch(() => false);
        const paywall2 = await page.locator('button[action-name="disagreeAndSubscribe"]').isVisible().catch(() => false);
        const paywall3 = await page.locator('a.deny-subscribe').isVisible().catch(() => false);
        const paywall4 = await page.locator('a.lp-mr_4.lp-font-btn').isVisible().catch(() => false);
        const paywall5 = await page.locator('a, button, span', { hasText: /S.?abonner.*refuser.*cookies/i }).isVisible().catch(() => false);
        const paywall6 = await page.locator('a, button, span', { hasText: /rechazar.*pagar/i }).isVisible().catch(() => false);
        const paywall7 = await page.locator('a, button, span', { hasText: /decline.*subscribe/i }).isVisible().catch(() => false);
        return paywall1 || paywall2 || paywall3 || paywall4 || paywall5 || paywall6 || paywall7;
      },
      accept: async (page: Page) => {await page.locator('button[action-name="agreeAll"]').click();},
      reject: async (_page: Page) => {}
    },
    {
      name: 'Variant - Continue without agreeing',
      check: async(page: Page) => !!(await page.locator('span.didomi-continue-without-agreeing').count()),
      accept: async (page: Page) => {
        await page.locator('button#didomi-notice-agree-button').click();
      },
      reject: async (page: Page) => {
        await page.locator('span.didomi-continue-without-agreeing').click();
      }
    },
    {
      name: 'Variant - Reject Button - Check if Subscribe',
      check: async(page: Page) => !!(await page.locator('button#didomi-notice-disagree-button').count()),
      accept: async (page: Page) => {
        await page.locator('button#didomi-notice-agree-button').click();
      },
      reject: async (page: Page) => {
        await page.locator('button#didomi-notice-disagree-button').click();
        console.log('Check if UI action was received.');
      }
    },
    {
      name: 'Variant - Learn More button',
      check: async(page: Page) => !!(await page.locator('button#didomi-notice-learn-more-button').count()),
      accept: async (page: Page) => {
        await page.locator('#button#didomi-notice-agree-button').click();
      },
      reject: async (page: Page) => {
        await page.locator('button#didomi-notice-learn-more-button').click();
        await page.waitForTimeout(1000);
        await page.locator('button#btn-toggle-disagree').click();
        console.log('Rejected Succesfully.');
      }
    },
  ]
}