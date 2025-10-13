import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const oneTrustHandler: BannerHandler = {
  name: 'One Trust',
  url: 'cdn.cookielaw.org/scripttemplates/otSDKStub.js',
  cmpId: 28,
  variants: [
    {
      name: 'Direct Reject Variant',
      check: async (page: Page) => {
        const hasRejectAll = await page.locator('button#onetrust-reject-all-handler').count();
        const hasDisclosureReject = await page.locator('button#cookie-disclosure-reject').count();
        return hasRejectAll > 0 || hasDisclosureReject > 0;
      },
      accept: async (page: Page) => {
        await page.locator('button#onetrust-accept-btn-handler').click();
      },
      reject: async (page: Page) => {
        await page.waitForTimeout(1000);
        if (await page.locator('button#onetrust-reject-all-handler').isVisible()) {
          await page.locator('button#onetrust-reject-all-handler').click();
        } else if (await page.locator('button#cookie-disclosure-reject').isVisible()) {
          await page.locator('button#cookie-disclosure-reject').click();
        }
        console.log('Rejected successfully via direct button.');
      },
    },
    {
      name: 'Preference Center Variant',
      check: async (page: Page) => {
        const hasPcBtn = await page.locator('button#onetrust-pc-btn-handler').count();
        return hasPcBtn > 0;
      },
      accept: async (page: Page) => {
        await page.locator('button#onetrust-accept-btn-handler').click();
      },
      reject: async (page: Page) => {
        await page.locator('button#onetrust-pc-btn-handler').click();
        await page.waitForTimeout(1000);

        // const refuseAllBtn = await page.locator('button.ot-pc-refuse-all-handler').count();
        // const rejectAllBtn = await page.locator('button.ot-pc-reject-all-handler').count();
        if (await page.locator('button.ot-pc-refuse-all-handler').isVisible()) {
          try{
            await page.locator('button.ot-pc-refuse-all-handler').click();
          console.log('Rejected via "Refuse All" button.');
          } catch{console.log('the reject button is not clickable')}
        } else if (await page.locator('button.ot-pc-reject-all-handler').isVisible()) {
          try{
            await page.locator('button.ot-pc-reject-all-handler').click();
          console.log('Rejected via "Reject All" button.');
          } catch{console.log('the reject button is not clickable')}
        } else {
          await page.locator('button.save-preference-btn-handler').click();
          console.log('Rejected via saved preferences button.');
        }
      },
    },
  ],
};
