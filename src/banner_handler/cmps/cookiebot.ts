import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const cookiebotHandler: BannerHandler = {
  name: 'CookieBot',
  url: 'cookiebot.com',
  variants: [
    {
      name: 'Variant 1',
      check: async(page: Page) => !!(await page.locator('a#manage-cookies').count()),
      accept: async (page: Page) => {
        await page.locator('div#cookiebanner div#c-right a.c-button').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('a#manage-cookies').click();
        await page.waitForTimeout(500);
        await page.locator('div#settings-content div.button-container a.c-button').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant 2',
      check: async(page: Page) => !!(await page.locator('#cookiewrapper').count()),
      accept: async (page: Page) => {
        await page.locator('button#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('button#CybotCookiebotDialogBodyLevelButtonAccept').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant 3',
      check: async(page: Page) => !!(await page.locator('#CybotCookiebotDialogFooter').count()),
      accept: async (page: Page) => {
        await page.locator('button#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection').click();
        page;
      },
      reject: async (page: Page) => {
        const declineBodyBtn = !!(await page.locator('button#CybotCookiebotDialogBodyButtonDecline').isVisible());
        const customizeBodyBtn = !!(await page.locator('button#CybotCookiebotDialogBodyLevelButtonCustomize').isVisible());
        if(declineBodyBtn){
          await page.locator('button#CybotCookiebotDialogBodyButtonDecline').click();
        }
        else{
          await page.locator('button#CybotCookiebotDialogBodyLevelButtonCustomize').click();
          await page.waitForTimeout(500);
          await page.locator('button#CybotCookiebotDialogBodyButtonDecline').click();
        }
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant 4',
      check: async(page: Page) => !!(await page.locator('#CybotCookiebotDialogBody').count()),
      accept: async (page: Page) => {
        await page.locator('a#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        page;
      },
      reject: async (page: Page) => {
        const declineAllBodyBtn = !!(await page.locator('div#CybotCookiebotDialogBodyButtons a#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll').isVisible());
        const declineBodyBtn = !!(await page.locator('div#CybotCookiebotDialogBodyButtons a#CybotCookiebotDialogBodyButtonDecline').isVisible());
        const declineAllBodyLevelBtn = !!(await page.locator('div#CybotCookiebotDialogBodyLevelWrapper a#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll').isVisible());
        const declineBodyLevelBtn = !!(await page.locator('div#CybotCookiebotDialogBodyLevelWrapper a#CybotCookiebotDialogBodyButtonDecline').isVisible());
        const allowSelectionBodyLevelBtn = !!(await page.locator('div#CybotCookiebotDialogBodyLevelWrapper a#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection').isVisible());
        if(declineAllBodyBtn) {
          await page.locator('div#CybotCookiebotDialogBodyButtons a#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll').click();
        }
        else if(declineBodyBtn) {
          await page.locator('div#CybotCookiebotDialogBodyButtons a#CybotCookiebotDialogBodyButtonDecline').click();
        }
        else if(declineAllBodyLevelBtn) {
          await page.locator('div#CybotCookiebotDialogBodyLevelWrapper a#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll').click();
        }
        else if(declineBodyLevelBtn) {
          await page.locator('div#CybotCookiebotDialogBodyLevelWrapper a#CybotCookiebotDialogBodyButtonDecline').click();
        }
        else if(allowSelectionBodyLevelBtn) {
          await page.locator('div#CybotCookiebotDialogBodyLevelWrapper a#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection').click();
        }
        else {
          await page.locator('div#CybotCookiebotDialogBodyButtons a#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection').click();
        }
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant 5',
      check: async(page: Page) => !!(await page.locator('#CybotCookiebotDialogBodyLevelWrapper').count()),
      accept: async (page: Page) => {
        await page.locator('div#CybotCookiebotDialogBodyLevelWrapper a#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('div#CybotCookiebotDialogBodyLevelWrapper a#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant 6',
      check: async(page: Page) => !!(await page.locator('#CookiebotCustom').count()),
      accept: async (page: Page) => {
        await page.locator('div#CookiebotCustom button#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('div#CookiebotCustom button#CybotCookiebotDialogBodyButtonDecline').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant 7',
      check: async(page: Page) => !!(await page.locator('#cookiesck').count()),
      accept: async (page: Page) => {
        await page.locator('a#cookiesck_accept').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('a#cookiesck_decline').click();
        console.log('Rejected Succesfully.');
      }
    }
  ]
}