import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

// This needs a different name
export const ConsentManagerNetHandler: BannerHandler = {
  name: 'consentmanager.net',
  url: 'https://app.consentmanager.net/',
  cmpId: 31,
  variants: [
    {
      name: 'Reject all Variant',
      check: async(page: Page) => !!(await page.locator('span#cmpwelcomebtnno').count()),
      accept: async (page: Page) => {
        await page.locator('span#cmpwelcomebtnyes').click(); 
        page;
      },
      reject: async (page: Page) => {
        await page.locator('span#cmpwelcomebtnno').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
        name: 'Settings Variant',
        check: async(page: Page) => !!(await page.locator('span#cmpbntcustomtxt').count()),
        accept: async (page: Page) => {
          await page.locator('span#cmpwelcomebtnyes').click(); 
          page;
        },
        reject: async (page: Page) => {
          await page.locator('span#cmpbntcustomtxt').click();
          await page.waitForTimeout(1000);
          await page.locator('a.cmpboxbtn.cmpboxbtnreject.cmpboxbtnrejectcustomchoices.cmptxt_btn_no').click();
          console.log('Rejected Succesfully.');
        }
      },
      {
        name: 'Settings Variant -- no reject all',
        check: async(page: Page) => !!(await page.locator('a.cmpboxbtn.cmpboxbtnyes.cmpboxbtnyescustomchoices.cmptxt_btn_save').count()),
        accept: async (_page: Page) => { },
        reject: async (page: Page) => {
          await page.locator('a.cmpboxbtn.cmpboxbtnyes.cmpboxbtnyescustomchoices.cmptxt_btn_save').click();
          console.log('Rejected Succesfully.');
        }
      },
  ]
}
