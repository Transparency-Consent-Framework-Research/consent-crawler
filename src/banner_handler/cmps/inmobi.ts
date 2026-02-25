import { Page } from 'playwright';
import { BannerHandler } from '../index.js';

const examples = ["styleforum.net","ilmondodelledonne.net","vidverto.io","the-express.com","zmescience.com"]

export const inmobiHandler: BannerHandler = {
  name: 'Inmobi',
  url: 'cdn.privacy-mgmt.com',
  cmpId: 10,
  // preActionHook: async (page: Page) => {
  //   console.log('Running pre-action hook');
  //   await page.locator('#qc-cmp2-container .qc-cmp-cleanslate .qc-cmp2-summary-buttons button[mode="secondary"]').click();
  // },
  variants: [
    {
      name: 'Reject button exists',
      check: async(page: Page) => !!(await page.locator('.qc-cmp2-summary-buttons button#disagree-btn').count()),
      accept: async (page: Page) => (await page.locator('.qc-cmp2-summary-buttons button#accept-btn').click()),
      reject: async (page: Page) => {
        await page.locator('.qc-cmp2-summary-buttons button#disagree-btn').click();
        console.log('Rejected Succesfully.');
      }
    },
    {
            name: 'Variant - Footer/PopUp',
            check: async (page: Page) => {
                try {
                    const check = await page.locator('.qc-cmp2-summary-buttons button[mode="secondary"]').count();
                    console.log('Check:', check);
                    return check > 0;
                }
                catch (e) {
                    console.error(e);
                    return false;
                }
            },
            accept: async (page) => (await page.locator('.qc-cmp2-summary-buttons button[mode="primary"]').click()),
            reject: async (page) => {
                const moreOptionPopUp = await page.locator('.qc-cmp2-summary-buttons button[mode="secondary"]').count();
                if (moreOptionPopUp === 1) {await page.locator('.qc-cmp2-summary-buttons button[mode="secondary"]').click();}
                if (moreOptionPopUp > 1) {await page.locator('.qc-cmp2-summary-buttons button[mode="secondary"]').nth(0).click();}
                await page.waitForTimeout(500);
                //const moreOptionPopUp = await page.locator('.qc-cmp2-summary-buttons button[mode="secondary"]').count();
                //console.log('More option popup?', moreOptionPopUp);
                //if (moreOptionPopUp > 1) {
                //    await page.locator('.qc-cmp2-summary-buttons button[mode="secondary"]').click();
               // }
                //await page.locator('.qc-cmp2-buttons-desktop button[mode="primary"]').click();
                await page.locator('.qc-cmp2-header-links button:first-child').click();
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