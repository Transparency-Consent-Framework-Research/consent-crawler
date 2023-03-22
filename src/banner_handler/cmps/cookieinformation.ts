import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const cookieInfoHandler:BannerHandler = {
  name: 'Cookie Information APS',
  url: 'cookieinformation.mgr.consensu.org',
  variants: [
    {
      name: 'Main Variant',
      check: async (page: Page) => {
          page;
          return true;
      },
      accept: async (page: Page) => {
          await page.locator('div#coi-tcf-modal-main div.coi-tcf-modal__overlay div.coi-tcf-modal__footer button#acceptButton').click();
          page;
      },
      reject: async (page: Page) => {
          await page.locator('div#coi-tcf-modal-main div.coi-tcf-modal__overlay div.coi-tcf-modal__footer button.coi-tcf-modal__button[data-coi-action="reject_all"]').click();
          console.log('Rejected Succesfully.');
      }
    }
  ]
}