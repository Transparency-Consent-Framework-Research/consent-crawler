import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const quantcastHandler: BannerHandler = {
  name: 'Quantcast',
  url: 'quantcast.mgr.consensu.org',
  preActionHook: async (page: Page) => {
    console.log('Running pre-action hook');
    await page.locator('#qc-cmp2-container .qc-cmp-cleanslate .qc-cmp2-summary-buttons button[mode="secondary"]').click();
  },
  variants: [
    {
      name: 'Header Links',
      check: async(page: Page) => !!(await page.locator('#qc-cmp2-container .qc-cmp-cleanslate .qc-cmp2-header-links').count()),
      accept: async (page: Page) => (await page.locator('#qc-cmp2-container .qc-cmp-cleanslate .qc-cmp2-summary-buttons button:first-child').click()),
      reject: async (page: Page) => {
        await page.locator('#qc-cmp2-container .qc-cmp-cleanslate .qc-cmp2-header-links button:first-child').click();
        await page.waitForTimeout(500);
        await page.locator('.qc-cmp2-buttons-desktop button[mode="primary"]').click();
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