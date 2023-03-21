import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const shinyStatHandler:BannerHandler = {
  name: 'ShinyStat',
  url: 'shinystat.com',
  variants: [
    {
      name: 'Main Variant',
      check: async(page: Page) => !!(await page.locator('div[class^="div_shbnr_"] div[class^="innerdiv_shbnr_cs_"]').count()),
      accept: async (page: Page) => (await page.locator('div[class^="div_shbnr_"] div[class^="innerdiv_shbnr_cs_"] button[class*="okBtn_shbnr_cs_"]').click()),
      reject: async (page: Page) => {
        await page.locator('div[class^="div_shbnr_"] div[class^="innerdiv_shbnr_cs_"] button[class*="koBtn_shbnr_cs_"]').click();
        console.log('Rejected Succesfully.');
      }
    }
  ]
}