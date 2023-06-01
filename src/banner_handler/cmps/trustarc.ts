import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

export const trustArcHandler: BannerHandler = {
  name: 'TrustArc',
  url: 'consent.trustarc.com/notice',
  variants: [
    {
      name: 'Variant - Modal Type1',
      check: async(page: Page) => !!(await page.locator('#truste-consent-buttons button#truste-consent-required').count()),
      accept: async (page: Page) => {
        await page.locator('#truste-consent-buttons button#truste-consent-button').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('button#truste-consent-required').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant - Modal Type2',
      check: async(page: Page) => !!(await page.locator('#truste-consent-buttons button#truste-show-consent').count()),
      accept: async (page: Page) => {
        await page.locator('#truste-consent-buttons button#truste-consent-button').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('button#truste-show-consent').click();
        await page.waitForTimeout(3000);
        const iframeP = page.frameLocator('.truste_box_overlay .truste_box_overlay_inner .truste_popframe');
        const rejectLink = await iframeP.locator('.mainContent a.rejectAll').count();
        if(rejectLink > 0) {
          await iframeP.locator('.mainContent a.rejectAll').click();
        }
        else {
          await iframeP.locator('.mainContent a.required').click();
        }
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant - Modal Type3',
      check: async(page: Page) => !!(await page.locator('#truste-consent-buttons button#truste-show-consent_').count()),
      accept: async (page: Page) => {
        await page.locator('#truste-consent-buttons button#truste-consent-button').click();
        page;
      },
      reject: async (page: Page) => {
        await page.locator('button#truste-show-consent_').click();
        await page.waitForTimeout(3000);
        await page.locator('div.pdynamicbutton a.submit').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
      name: 'Variant - PopUp',
      check: async(page: Page) => !!(await page.locator('.truste_popframe').isVisible()),
      accept: async (page: Page) => {
        const iframeP = page.frameLocator('.truste_popframe');
        const callLink = await iframeP.locator('a.call').isVisible();
        if(callLink) {
          await iframeP.locator('a.call').click();
        }
        else{
          await iframeP.locator('a.acceptAll').click();
        }
        
        page;
      },
      reject: async (page: Page) => {
        const iframeP = page.frameLocator('.truste_popframe');
        const requiredLink = await iframeP.locator('a.required').isVisible();
        if(requiredLink) {
          await iframeP.locator('a.required').click();
        }
        else{
          await iframeP.locator('a.rejectAll').click();
        }
        console.log('Rejected Succesfully.');
      }
    },
  ]
}