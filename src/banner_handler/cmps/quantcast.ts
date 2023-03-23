import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const quantcastHandler: BannerHandler = {
  name: 'Quantcast',
  url: 'quantcast.mgr.consensu.org',
  // preActionHook: async (page: Page) => {
  //   console.log('Running pre-action hook');
  //   await page.locator('#qc-cmp2-container .qc-cmp-cleanslate .qc-cmp2-summary-buttons button[mode="secondary"]').click();
  // },
  variants: [
    {
      name: 'Variant - Footer/PopUp',
      check: async(page: Page) => !!(await page.locator('#qc-cmp2-container .qc-cmp2-footer').count()),
      accept: async (page: Page) => (await page.locator('#qc-cmp2-container .qc-cmp2-footer button[mode="primary"]').click()),
      reject: async (page: Page) => {
        await page.locator('#qc-cmp2-container .qc-cmp2-footer button:first-child').click();
        await page.waitForTimeout(500);
        const moreOptionPopUp = await page.locator('.qc-cmp2-consent-info .qc-cmp2-header-links button:first-child').count();
        if(moreOptionPopUp > 0) {
          await page.locator('.qc-cmp2-consent-info .qc-cmp2-header-links button:first-child').click();
        }
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'No header links',
      check: async(page: Page) => !!(await page.locator('.qc-cmp2-buttons-desktop button[mode="secondary"]').count()),
      accept: async (_page: Page) => {},
      reject: async (page: Page) => {
        await page.locator('.qc-cmp2-buttons-desktop button[mode="secondary"]').click();
        console.log('Rejected Succesfully.');
      }
    }
  ]

}