import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const traffectiveHandler:BannerHandler = {
  name: 'Traffective GMBH',
  url: 'https://traffective.com/en/',
  cmpId: 21,
  variants: [
    {
      name: 'Main Variant',
      check: async(page: Page) => !!(await page.locator('div.cmp_primaryButtonLine').count()),
      accept: async (page: Page) => {
          await page.locator('div.cmp_button.cmp_button_bg.cmp_button_font_color.cmp-button-accept-all').click();
          page;
      },
      reject: async (page: Page) => {
          await page.locator('div.cmp_saveLink a.cmp_link.cmp_ext_main_color_text').click();
          await page.waitForTimeout(1000);
          await page.locator('div.cmp_saveLink a.cmp_ext_main_color_text').click();
          console.log('Rejected Succesfully.');
      }
    }
  ]
}