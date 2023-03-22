import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const gmbhHandler:BannerHandler = {
  name: 'Multimedia Internet Services GmbH',
  url: 'consentserve.mgr.consensu.org',
  variants: [
    {
      name: 'Main Variant',
      check: async (page: Page) => {
          page;
          return true;
      },
      accept: async (page: Page) => {
          await page.locator('button#cmp_popup_boxAcceptAllButton').click();
          page;
      },
      reject: async (page: Page) => {
          await page.locator('a#cmp_popup_boxShowAllButton').click();
          await page.waitForTimeout(2000);
          await page.locator('button#cmp_popup_boxSaveChangesButton').click();
          console.log('Rejected Succesfully.');
      }
    }
  ]
}