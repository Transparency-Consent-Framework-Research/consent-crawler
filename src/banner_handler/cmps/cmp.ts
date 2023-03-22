import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

// This needs a different name
export const cmpHandler: BannerHandler = {
  name: 'CMP',
  url: 'dl.cmp.min.js',
  variants: [
    {
      name: 'Main Variant',
      check: async (page: Page) => {
        page;
        return true;
      },
      accept: async (page: Page) => {
        await page.locator('button.cmp-intro_acceptAll').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('.cmp-popup_popup .cmp-intro_options button.cmp-intro_rejectAll').click();
        await page.waitForTimeout(500);
        await page.locator('.cmp-popup_popup .cmp-details_footer button.cmp-intro_rejectAll').click();
        console.log('Rejected Succesfully.');
      }
    }
  ]
}